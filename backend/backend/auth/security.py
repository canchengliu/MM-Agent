"""Core security utilities for password hashing, JWT, and BYOK encryption."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional, Union

from cryptography.fernet import Fernet
from jose import jwt

from backend.config import settings

PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390_000
PASSWORD_SALT_BYTES = 16

_fernet = Fernet(settings.ENCRYPTION_KEY)


def _encode_bytes(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def _decode_bytes(value: str) -> bytes:
    return base64.b64decode(value.encode("utf-8"))


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.

    Returns a multi-part string containing the scheme, iterations, salt, and hash.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")

    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}${_encode_bytes(salt)}${_encode_bytes(derived)}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Compare a password to a stored PBKDF2 hash string.

    Returns True if the password matches, otherwise False.
    """
    try:
        scheme, iterations_str, salt_b64, hash_b64 = hashed_password.split("$")
        if scheme != PASSWORD_SCHEME:
            return False
        iterations = int(iterations_str)
        salt = _decode_bytes(salt_b64)
        stored_hash = _decode_bytes(hash_b64)
    except (ValueError, TypeError):
        return False

    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(new_hash, stored_hash)


def encrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Encrypt arbitrary user-supplied data using the configured Fernet key.

    Returns the encrypted token as a string, or None if the input is falsy.
    """
    if value is None:
        return None

    raw_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    token = _fernet.encrypt(raw_bytes)
    return token.decode("utf-8")


def decrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Decrypt previously encrypted data.

    Raises cryptography.fernet.InvalidToken if the value cannot be decrypted.
    """
    if value is None:
        return None

    token_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    plaintext = _fernet.decrypt(token_bytes)
    return plaintext.decode("utf-8")


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


__all__ = [
    "decrypt_data",
    "encrypt_data",
    "get_password_hash",
    "verify_password",
    "create_access_token",
]
