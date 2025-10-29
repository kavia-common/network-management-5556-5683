# Flask CORS via FRONTEND_APP_ORIGIN

To allow the React frontend to access this backend during development and in previews, configure CORS using the FRONTEND_APP_ORIGIN environment variable.

Usage in your Flask app (app.py or factory):
from flask import Flask
from cors_config_env import configure_cors_from_env

def create_app():
    app = Flask(__name__)
    # ... other setup
    configure_cors_from_env(app)  # reads FRONTEND_APP_ORIGIN and configures Flask-CORS
    return app

Environment:
- FRONTEND_APP_ORIGIN: exact origin of the frontend (e.g., http://localhost:3000 or https://<preview-host>:3000)
- For multiple origins, provide comma-separated values:
  FRONTEND_APP_ORIGIN=http://localhost:3000,https://<preview-host>:3000

Notes:
- Avoid manual Access-Control-* headers to prevent duplicates.
- If FRONTEND_APP_ORIGIN is not set, CORS defaults to allowing http://localhost:3000 to ease local development.

Ensure flask-cors is installed (see requirements.txt). If not, add:
flask-cors
