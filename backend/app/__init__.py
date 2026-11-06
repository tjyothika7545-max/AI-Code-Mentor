from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for all routes (supporting frontend development on Vite default 5173 / any origin)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from app.routes.mentor import mentor_bp
    from app.routes.quiz import quiz_bp
    from app.routes.history import history_bp

    app.register_blueprint(mentor_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(history_bp)

    # Create tables automatically
    with app.app_context():
        db.create_all()

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "details": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    return app
