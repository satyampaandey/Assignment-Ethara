from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order. Auto-validates stock and calculates totals."""
    db_order = crud.create_order(db, order)
    return crud.get_order(db, db_order.id)


@router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all orders."""
    return crud.get_orders(db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID."""
    return crud.get_order(db, order_id)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel and delete an order. Restores product stock."""
    return crud.delete_order(db, order_id)
