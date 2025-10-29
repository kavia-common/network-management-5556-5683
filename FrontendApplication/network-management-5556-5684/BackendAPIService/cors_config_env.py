import os
from typing import Optional, List
from flask_cors import CORS

# PUBLIC_INTERFACE
def parse_origin_list(value: Optional[str]) -> Optional[List[str]]:
    """Parse a comma-separated list of origins into a list, trimming whitespace."""
    if not value:
        return None
    parts = [v.strip() for v in value.split(",")]
    return [p for p in parts if p] or None

# PUBLIC_INTERFACE
def configure_cors_from_env(app):
    """
    Configure Flask-CORS using FRONTEND_APP_ORIGIN env variable.

    Behavior:
    - Reads FRONTEND_APP_ORIGIN as a single origin, or a comma-separated list of origins.
    - If set, restricts CORS to those origin(s).
    - If not set, defaults to allowing http://localhost:3000 for developer convenience.
      You can override by setting FRONTEND_APP_ORIGIN explicitly.

    Environment:
    - FRONTEND_APP_ORIGIN: e.g., "http://localhost:3000" or "https://host:3000"
    """
    origin_env = os.getenv("FRONTEND_APP_ORIGIN", "").strip()
    allowed = parse_origin_list(origin_env)

    if not allowed:
        # developer-friendly default
        allowed = ["http://localhost:3000"]
        app.logger.warning(
            "FRONTEND_APP_ORIGIN not set; defaulting CORS allowed origin to http://localhost:3000"
        )

    CORS(
        app,
        resources={r"/*": {"origins": allowed}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    app.logger.info(f"CORS configured with allowed origins: {allowed}")
