import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.models import db
from app.config import Config

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "test-secret-key"
    GEMINI_API_KEY = ""  # Uses mock service for deterministic tests
    GEMINI_MODEL = "gemini-2.5-flash"
    OPENAI_API_KEY = ""
    OPENAI_MODEL = "gemini-2.5-flash"
    PORT = 5001
    HOST = "127.0.0.1"

@pytest.fixture
def app():
    # Save original env vars
    orig_gemini_key = os.environ.get("GEMINI_API_KEY")
    orig_google_key = os.environ.get("GOOGLE_API_KEY")
    orig_openai_key = os.environ.get("OPENAI_API_KEY")
    orig_config_key = Config.GEMINI_API_KEY

    os.environ["GEMINI_API_KEY"] = ""
    os.environ["GOOGLE_API_KEY"] = ""
    os.environ["OPENAI_API_KEY"] = ""
    Config.GEMINI_API_KEY = ""
    Config.OPENAI_API_KEY = ""

    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

    # Restore env vars
    Config.GEMINI_API_KEY = orig_config_key
    Config.OPENAI_API_KEY = orig_config_key

    if orig_gemini_key is not None:
        os.environ["GEMINI_API_KEY"] = orig_gemini_key
    else:
        os.environ.pop("GEMINI_API_KEY", None)

    if orig_google_key is not None:
        os.environ["GOOGLE_API_KEY"] = orig_google_key
    else:
        os.environ.pop("GOOGLE_API_KEY", None)

    if orig_openai_key is not None:
        os.environ["OPENAI_API_KEY"] = orig_openai_key
    else:
        os.environ.pop("OPENAI_API_KEY", None)

@pytest.fixture
def client(app):
    return app.test_client()
