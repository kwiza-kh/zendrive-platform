"""Vercel Python Serverless entrypoint.

Vercel detects /api/*.py files and exposes them as Functions. Re-exporting the
FastAPI ASGI app here lets every request to /api/* be handled by the existing
FastAPI router (which already prefixes its routes with /api).
"""

from app.main import app  # noqa: F401

# Vercel's Python runtime supports ASGI apps exported as `app`.
