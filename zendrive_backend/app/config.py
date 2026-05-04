import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass


def _normalize_db_url(url: str) -> str:
    # Neon / Supabase / Heroku style URLs sometimes start with postgres://
    # SQLAlchemy 2.x requires postgresql:// (or an explicit driver).
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    # Strip channel_binding option (libpq-only, breaks psycopg2 on some versions).
    if "channel_binding=" in url:
        from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
        parts = urlsplit(url)
        q = [(k, v) for k, v in parse_qsl(parts.query) if k != "channel_binding"]
        url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(q), parts.fragment))
    return url


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "zendrive-dev-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@zendrive.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Zendrive@2026")

    DATABASE_URL: str = _normalize_db_url(os.getenv("DATABASE_URL", "sqlite:///./zendrive.db"))

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")


settings = Settings()
