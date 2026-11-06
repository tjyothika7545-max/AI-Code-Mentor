import uuid
from datetime import datetime, timezone
import json
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False, default="Untitled Session")
    language = db.Column(db.String(50), nullable=False, default="python")
    initial_code = db.Column(db.Text, nullable=True, default="")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    messages = db.relationship(
        "Message", backref="session", cascade="all, delete-orphan", lazy="joined",
        order_by="Message.created_at.asc()"
    )

    def to_dict(self, include_messages=False):
        data = {
            "id": self.id,
            "title": self.title,
            "language": self.language,
            "initial_code": self.initial_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "message_count": len(self.messages) if self.messages else 0
        }
        if include_messages:
            data["messages"] = [msg.to_dict() for msg in self.messages]
        return data


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    session_id = db.Column(db.String(36), db.ForeignKey("sessions.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant'
    task_type = db.Column(db.String(30), nullable=False, default="chat")
    code_snapshot = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=False)
    metadata_json = db.Column(db.Text, nullable=True)  # JSON-encoded metadata
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_metadata(self):
        if self.metadata_json:
            try:
                return json.loads(self.metadata_json)
            except Exception:
                return {}
        return {}

    def set_metadata(self, data):
        if data is not None:
            self.metadata_json = json.dumps(data)
        else:
            self.metadata_json = None

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "task_type": self.task_type,
            "code_snapshot": self.code_snapshot,
            "content": self.content,
            "metadata": self.get_metadata(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    topic = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(50), nullable=False, default="general")
    difficulty = db.Column(db.String(20), nullable=False, default="intermediate")
    questions_json = db.Column(db.Text, nullable=False)  # JSON list
    score = db.Column(db.Integer, nullable=True)
    total_questions = db.Column(db.Integer, nullable=False, default=5)
    user_answers_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_questions(self):
        if self.questions_json:
            try:
                return json.loads(self.questions_json)
            except Exception:
                return []
        return []

    def set_questions(self, questions):
        self.questions_json = json.dumps(questions)

    def get_user_answers(self):
        if self.user_answers_json:
            try:
                return json.loads(self.user_answers_json)
            except Exception:
                return {}
        return {}

    def set_user_answers(self, answers):
        self.user_answers_json = json.dumps(answers)

    def to_dict(self, include_correct=True):
        questions = self.get_questions()
        if not include_correct:
            # Hide correct answer and explanation if not submitted yet
            sanitized = []
            for q in questions:
                sanitized.append({
                    "id": q.get("id"),
                    "question": q.get("question"),
                    "code_snippet": q.get("code_snippet"),
                    "options": q.get("options")
                })
            questions = sanitized

        return {
            "id": self.id,
            "topic": self.topic,
            "language": self.language,
            "difficulty": self.difficulty,
            "questions": questions,
            "score": self.score,
            "total_questions": self.total_questions,
            "user_answers": self.get_user_answers(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
