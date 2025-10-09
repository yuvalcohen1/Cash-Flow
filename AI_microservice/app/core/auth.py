from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = {"id": payload.get("userId"), "email": payload.get("email")}
        if not user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token payload"
            )
        return user["id"]
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token"
        )
