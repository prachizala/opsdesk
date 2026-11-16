from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User

def get_current_user(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticates requests using the X-User-Id header for the demo prototype.
    Validates user existence in the database.
    Raises 401 Unauthorized if missing or invalid.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing X-User-Id authentication header"
        )
    
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail=f"Unauthorized: User '{x_user_id}' not found in system"
        )
    
    return user
