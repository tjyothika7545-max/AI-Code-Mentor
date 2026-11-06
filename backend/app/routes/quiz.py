from flask import Blueprint, request, jsonify
import logging
from google.genai import errors
from app.models import db, Quiz
from app.utils.validators import validate_quiz_request
from app.services import ai_service
from app.routes.mentor import handle_gemini_error

logger = logging.getLogger(__name__)
quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")

@quiz_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    valid, result = validate_quiz_request(data)
    if not valid:
        return jsonify({"error": result}), 400

    topic = result["topic"]
    language = result["language"]
    difficulty = result["difficulty"]
    count = result["count"]

    try:
        questions = ai_service.generate_quiz(
            topic=topic,
            language=language,
            difficulty=difficulty,
            count=count
        )
    except errors.APIError as e:
        return handle_gemini_error(e)
    except Exception as e:
        return handle_gemini_error(e)

    quiz = Quiz(
        topic=topic,
        language=language,
        difficulty=difficulty,
        total_questions=len(questions)
    )
    quiz.set_questions(questions)
    db.session.add(quiz)
    db.session.commit()

    # Return quiz with answers hidden from the student until submission
    return jsonify({
        "quiz": quiz.to_dict(include_correct=False)
    }), 201


@quiz_bp.route("/submit", methods=["POST"])
def submit():
    data = request.get_json(silent=True) or {}
    quiz_id = data.get("quiz_id")
    user_answers = data.get("answers", {})  # { question_id: "A" }

    if not quiz_id:
        return jsonify({"error": "Field 'quiz_id' is required."}), 400

    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found."}), 404

    stored_questions = quiz.get_questions()
    correct_count = 0
    feedback = []

    for q in stored_questions:
        q_id = str(q.get("id"))
        user_choice = str(user_answers.get(q_id, "")).strip().upper()
        correct_choice = str(q.get("correct_option", "")).strip().upper()
        is_correct = (user_choice == correct_choice)

        if is_correct:
            correct_count += 1

        feedback.append({
            "id": q.get("id"),
            "question": q.get("question"),
            "code_snippet": q.get("code_snippet"),
            "user_choice": user_choice,
            "correct_option": correct_choice,
            "is_correct": is_correct,
            "explanation": q.get("explanation"),
            "options": q.get("options")
        })

    quiz.score = correct_count
    quiz.set_user_answers(user_answers)
    db.session.commit()

    percentage = round((correct_count / quiz.total_questions) * 100, 1) if quiz.total_questions > 0 else 0

    return jsonify({
        "quiz_id": quiz.id,
        "score": correct_count,
        "total": quiz.total_questions,
        "percentage": percentage,
        "feedback": feedback
    }), 200


@quiz_bp.route("/history", methods=["GET"])
def history():
    limit = min(50, int(request.args.get("limit", 10)))
    quizzes = (
        Quiz.query.order_by(Quiz.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({
        "quizzes": [q.to_dict(include_correct=True) for q in quizzes]
    }), 200
