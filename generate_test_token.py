#!/usr/bin/env python3
import hmac
import hashlib
import base64
import json
import time

# Generate a simple HMAC-SHA256 JWT token
def generate_jwt(secret, payload):
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b'=').decode()
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b'=').decode()
    message = f"{header_b64}.{payload_b64}"
    signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b'=').decode()
    return f"{message}.{signature_b64}"

# Test secret from docker-compose
SECRET = "test-secret-key-minimum-32-characters-for-hmac256"
ISSUER = "http://localhost:8081"

# Generate tokens for different roles
tokens = {
    "ADMIN": generate_jwt(SECRET, {
        "sub": "admin_user",
        "roles": ["ADMIN"],
        "iss": ISSUER,
        "aud": "product-service",
        "exp": int(time.time()) + 3600
    }),
    "BANK_OFFICER": generate_jwt(SECRET, {
        "sub": "officer_user",
        "roles": ["BANK_OFFICER"],
        "iss": ISSUER,
        "aud": "product-service",
        "exp": int(time.time()) + 3600
    }),
    "CUSTOMER": generate_jwt(SECRET, {
        "sub": "customer_user",
        "roles": ["CUSTOMER"],
        "iss": ISSUER,
        "aud": "fd-calculator-service",
        "exp": int(time.time()) + 3600
    })
}

for role, token in tokens.items():
    print(f"{role}_TOKEN={token}")
