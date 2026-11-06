
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.config import Config

app = create_app()

if __name__ == "__main__":
    print(f"AI Code Mentor Backend starting on http://{Config.HOST}:{Config.PORT}")
    print(f"AI Integration configured: {Config.is_ai_configured()}")
    print(f"Model: {Config.GEMINI_MODEL}")

    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=True
    )
