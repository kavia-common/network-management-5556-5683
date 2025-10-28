# CORS Setup for BackendAPIService (Flask)

To allow the frontend (e.g., http://localhost:3000) to communicate with the backend (http://localhost:3001) during development, enable CORS on the Flask app.

## Quick Setup

1) Install dependency (if not already installed):

    pip install flask-cors

2) In your Flask app initialization (typically app.py or the factory), add:

    from flask_cors import CORS
    app = Flask(__name__)
    CORS(app)  # enables CORS for all routes with defaults

This minimal setup is sufficient for development where the frontend and backend run on different ports.

## Notes

- If you need to restrict origins, configure:
  
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

- If you use cookies/authorization headers, set:
  
    CORS(app, supports_credentials=True)

Be sure to restart the backend after making these changes.
