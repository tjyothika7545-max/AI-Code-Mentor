from flask import Blueprint, request, jsonify
from app.models import db, Session, Message, Quiz

history_bp = Blueprint("history", __name__, url_prefix="/api")

@history_bp.route("/history", methods=["GET"])
def get_history():
    limit = min(50, int(request.args.get("limit", 20)))
    task_filter = request.args.get("task")
    language_filter = request.args.get("language")

    query = Session.query

    if language_filter:
        query = query.filter_by(language=language_filter.lower())

    sessions = query.order_by(Session.updated_at.desc()).limit(limit).all()

    # Filter by task if specified
    serialized_sessions = []
    for s in sessions:
        s_dict = s.to_dict(include_messages=True)
        if task_filter:
            # check if session has message with task_type
            has_task = any(m["task_type"] == task_filter for m in s_dict["messages"])
            if not has_task:
                continue
        serialized_sessions.append(s_dict)

    # Also grab recent quizzes
    quizzes = Quiz.query.order_by(Quiz.created_at.desc()).limit(10).all()

    # Aggregate stats for Dashboard
    total_sessions = Session.query.count()
    total_quizzes = Quiz.query.count()
    completed_quizzes = Quiz.query.filter(Quiz.score.isnot(None)).all()
    avg_score = 0
    if completed_quizzes:
        avg_score = round(
            sum((q.score / q.total_questions) * 100 for q in completed_quizzes if q.total_questions > 0)
            / len(completed_quizzes),
            1
        )

    return jsonify({
        "sessions": serialized_sessions,
        "quizzes": [q.to_dict(include_correct=True) for q in quizzes],
        "stats": {
            "total_sessions": total_sessions,
            "total_quizzes": total_quizzes,
            "average_quiz_score": avg_score
        }
    }), 200


@history_bp.route("/sessions/<session_id>", methods=["GET"])
def get_session(session_id):
    session = db.session.get(Session, session_id)
    if not session:
        return jsonify({"error": "Session not found."}), 404
    return jsonify({
        "session": session.to_dict(include_messages=True)
    }), 200


@history_bp.route("/sessions/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    session = db.session.get(Session, session_id)
    if not session:
        return jsonify({"error": "Session not found."}), 404

    db.session.delete(session)
    db.session.commit()
    return jsonify({"success": True, "message": "Session deleted successfully."}), 200


@history_bp.route("/history/clear", methods=["DELETE"])
def clear_history():
    try:
        Message.query.delete()
        Session.query.delete()
        Quiz.query.delete()
        db.session.commit()
        return jsonify({"success": True, "message": "All history cleared."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
