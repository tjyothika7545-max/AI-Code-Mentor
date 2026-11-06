from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import logging
from google.genai import errors
from app.models import db, Session, Message
from app.utils.validators import validate_analyze_request, validate_chat_request
from app.services import ai_service
from app.config import Config

logger = logging.getLogger(__name__)
mentor_bp = Blueprint("mentor", __name__, url_prefix="/api")


def handle_gemini_error(e: Exception):
    err_str = str(e).lower()
    code = getattr(e, "code", None)
    logger.error(f"Gemini API Error: {type(e).__name__} (code={code}): {e}")

    # Authentication / Authorization errors
    if (
        code in (401, 403)
        or "api_key_invalid" in err_str
        or "unauthenticated" in err_str
        or "permission_denied" in err_str
        or "incorrect api key" in err_str
    ):
        return jsonify({
            "error": "Gemini Authentication Failed (401): The configured GEMINI_API_KEY is incorrect or unauthorized. Please verify your API key in backend/.env and restart the server."
        }), 401

    # Quota / Rate limit errors
    if code == 429 or "resource_exhausted" in err_str or "quota" in err_str or "rate limit" in err_str:
        return jsonify({
            "error": "Gemini Rate Limit / Quota Exceeded (429): Please verify your Gemini API plan and billing status."
        }), 429

    # Connection / Gateway / Network errors
    if code in (502, 503, 504) or "connection" in err_str or "timed out" in err_str or "unavailable" in err_str:
        return jsonify({
            "error": "Failed to connect to Gemini API. Please check your internet connection and network settings."
        }), 502

    if isinstance(e, errors.APIError):
        return jsonify({
            "error": f"Gemini API Error: {str(e)}"
        }), 500

    return jsonify({
        "error": f"Internal server error: {str(e)}"
    }), 500


@mentor_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "AI Code Mentor API",
        "ai_configured": ai_service.is_ai_configured(),
        "model": ai_service.get_current_model(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200


@mentor_bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)
    valid, result = validate_analyze_request(data)
    if not valid:
        return jsonify({"error": result}), 400

    task = result["task"]
    language = result["language"]
    code = result["code"]
    prompt = result["prompt"]
    session_id = result.get("session_id")

    session = None
    if session_id:
        session = db.session.get(Session, session_id)

    if not session:
        title_prefix = task.replace("_", " ").title()
        short_summary = prompt[:30] if prompt else (code.split("\n")[0][:30] if code else "Snippet")
        title = f"{title_prefix}: {short_summary}"
        session = Session(
            title=title,
            language=language,
            initial_code=code
        )
        db.session.add(session)
        db.session.commit()
    else:
        session.language = language
        if code:
            session.initial_code = code
        db.session.commit()

    # Record User Message
    user_msg_content = prompt if task == "generate" else (prompt or f"Analyze {language} code for {task}.")
    user_msg = Message(
        session_id=session.id,
        role="user",
        task_type=task,
        code_snapshot=code,
        content=user_msg_content
    )
    db.session.add(user_msg)
    db.session.commit()

    # Execute AI Analysis
    try:
        ai_result = ai_service.analyze_code(
            task=task,
            language=language,
            code=code,
            prompt=prompt
        )
    except errors.APIError as e:
        return handle_gemini_error(e)
    except Exception as e:
        return handle_gemini_error(e)

    # Record Assistant Message
    assistant_msg = Message(
        session_id=session.id,
        role="assistant",
        task_type=task,
        code_snapshot=code,
        content=ai_result.get("content", "")
    )
    assistant_msg.set_metadata(ai_result.get("metadata", {}))
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        "session_id": session.id,
        "message_id": assistant_msg.id,
        "task": task,
        "language": language,
        "content": assistant_msg.content,
        "metadata": assistant_msg.get_metadata(),
        "created_at": assistant_msg.created_at.isoformat()
    }), 200


@mentor_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)
    valid, result = validate_chat_request(data)
    if not valid:
        return jsonify({"error": result}), 400

    message_text = result["message"]
    code = result["code"]
    language = result["language"]
    session_id = result.get("session_id")

    session = None
    if session_id:
        session = db.session.get(Session, session_id)

    if not session:
        session = Session(
            title=f"Chat: {message_text[:30]}",
            language=language,
            initial_code=code
        )
        db.session.add(session)
        db.session.commit()

    # Collect past messages for context
    past_messages = [
        {"role": m.role, "content": m.content}
        for m in session.messages
    ]

    # Save user message
    user_msg = Message(
        session_id=session.id,
        role="user",
        task_type="chat",
        code_snapshot=code,
        content=message_text
    )
    db.session.add(user_msg)
    db.session.commit()

    # Generate contextual reply
    try:
        reply = ai_service.chat_follow_up(
            session_messages=past_messages,
            new_message=message_text,
            code=code or session.initial_code,
            language=language or session.language
        )
    except errors.APIError as e:
        return handle_gemini_error(e)
    except Exception as e:
        return handle_gemini_error(e)

    # Save assistant message
    assistant_msg = Message(
        session_id=session.id,
        role="assistant",
        task_type="chat",
        code_snapshot=code,
        content=reply
    )
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        "session_id": session.id,
        "message_id": assistant_msg.id,
        "reply": reply,
        "created_at": assistant_msg.created_at.isoformat()
    }), 200
