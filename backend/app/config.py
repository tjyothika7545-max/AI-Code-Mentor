import os
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
backend_env_file = backend_dir / ".env"

if backend_env_file.is_file():
    load_dotenv(dotenv_path=backend_env_file, override=True)
else:
    root_env_file = backend_dir.parent / ".env"
    if root_env_file.is_file():
        load_dotenv(dotenv_path=root_env_file, override=True)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "ai-code-mentor-secret-key-2025")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{backend_dir / 'mentor.db'}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "127.0.0.1")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")

    # Gemini API Configuration
    GEMINI_API_KEY = (
        os.getenv("GEMINI_API_KEY", "").strip()
        or os.getenv("GOOGLE_API_KEY", "").strip()
        or os.getenv("OPENAI_API_KEY", "").strip()
    )
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

    # Backwards compatibility aliases
    OPENAI_API_KEY = GEMINI_API_KEY
    OPENAI_MODEL = GEMINI_MODEL

    @classmethod
    def get_gemini_api_key(cls):
        if "GEMINI_API_KEY" in os.environ:
            return os.environ.get("GEMINI_API_KEY", "").strip()
        if "GOOGLE_API_KEY" in os.environ:
            return os.environ.get("GOOGLE_API_KEY", "").strip()
        return cls.GEMINI_API_KEY

    @classmethod
    def get_gemini_model(cls):
        return os.getenv("GEMINI_MODEL", "").strip() or cls.GEMINI_MODEL or "gemini-2.5-flash"

    @classmethod
    def get_openai_api_key(cls):
        return cls.get_gemini_api_key()

    @classmethod
    def get_openai_model(cls):
        return cls.get_gemini_model()

    @classmethod
    def is_ai_configured(cls):
        key = cls.get_gemini_api_key()
        return bool(
            key
            and not key.startswith("your_")
            and not key.startswith("sk-your-")
            and not key.startswith("placeholder")
        )
