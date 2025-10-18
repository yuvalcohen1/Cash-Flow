from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract and validate user_id from JWT token
    Returns user_id as string (UUID)
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("userId")  # Changed to match Express.js token structure
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Invalid token payload"
            )
        
        # Return as string (UUID)
        return str(user_id)
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Invalid or expired token: {str(e)}"
        )
