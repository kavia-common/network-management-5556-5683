import os
from typing import List, Optional
from flask_cors import CORS

# PUBLIC_INTERFACE
def parse_cors_allowed_origins(value: Optional[str]) -> Optional[List[str]]:
    """
    Parse CORS_ALLOWED_ORIGINS env var into a list of origins.
    Accepts comma-separated values and trims whitespace. Returns None if empty.

    Examples:
      "http://localhost:3000" -> ["http://localhost:3000"]
      "https://a:3000, https://b:3000" -> ["https://a:3000", "https://b:3000"]
    """
    if not value:
        return None
    parts = [v.strip() for v in value.split(",")]
    origins = [p for p in parts if p]
    return origins or None

# PUBLIC_INTERFACE
def configure_cors(app):
    """
    Configure Flask-CORS for the provided Flask app using the CORS_ALLOWED_ORIGINS env var.

    Behavior:
    - If CORS_ALLOWED_ORIGINS is set (comma-separated), restrict to those origins.
    - If not set, enable CORS for all origins (development-friendly default).
    - Does not include backend origin by default; only the frontend origin(s) should be listed.

    Environment variables:
    - CORS_ALLOWED_ORIGINS: Comma-separated list of allowed origins
    """
    env_value = os.getenv("CORS_ALLOWED_ORIGINS", "")
    allowed = parse_cors_allowed_origins(env_value)

    if allowed:
        # Restrict to provided origins
        CORS(
            app,
            resources={r"/*": {"origins": allowed}},
            supports_credentials=False,
        )
        app.logger.info(f"CORS configured with allowed origins: {allowed}")
    else:
        # Development default: allow all to reduce friction when env not configured
        CORS(app, supports_credentials=False)
        app.logger.warning("CORS_ALLOWED_ORIGINS not set; CORS enabled for all origins (development mode).")
