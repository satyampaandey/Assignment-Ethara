from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard summary with totals and low-stock alerts."""
    return crud.get_dashboard(db)
