# Flask CORS Configuration

This backend reads CORS_ALLOWED_ORIGINS from environment and configures Flask-CORS accordingly.

- Set CORS_ALLOWED_ORIGINS to a comma-separated list of allowed origins.
- Only include the frontend origin(s). Do NOT include the backend origin.
- Example for current preview:
  CORS_ALLOWED_ORIGINS=https://vscode-internal-28439-beta.beta01.cloud.kavia.ai:3000

Integration (in your Flask app factory or app.py):

from flask import Flask
from cors_config import configure_cors

def create_app():
    app = Flask(__name__)
    # other setup...
    configure_cors(app)  # reads CORS_ALLOWED_ORIGINS and applies CORS
    return app

Notes:
- When CORS_ALLOWED_ORIGINS is not set, CORS defaults to allowing all origins to ease development.
- Set supports_credentials as needed if you plan to use cookies or Authorization headers.
