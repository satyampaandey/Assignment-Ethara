from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas


# ═══════════════════════════════════════════════════════════════════════
#  PRODUCT CRUD
# ═══════════════════════════════════════════════════════════════════════

def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    """Create a new product. Raises 400 if SKU already exists."""
    existing = db.query(models.Product).filter(
        models.Product.sku == product.sku
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product.sku}' already exists."
        )

    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session, skip: int = 0, limit: int = 100) -> list[models.Product]:
    """Retrieve all products with pagination."""
    return db.query(models.Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> models.Product:
    """Retrieve a product by ID. Raises 404 if not found."""
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return product


def update_product(
    db: Session, product_id: int, product_update: schemas.ProductUpdate
) -> models.Product:
    """Update a product. Validates unique SKU if changed."""
    product = get_product(db, product_id)

    update_data = product_update.model_dump(exclude_unset=True)

    # Check SKU uniqueness if being changed
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(models.Product).filter(
            models.Product.sku == update_data["sku"]
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists."
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> dict:
    """Delete a product by ID."""
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully."}


# ═══════════════════════════════════════════════════════════════════════
#  CUSTOMER CRUD
# ═══════════════════════════════════════════════════════════════════════

def create_customer(
    db: Session, customer: schemas.CustomerCreate
) -> models.Customer:
    """Create a new customer. Raises 400 if email already exists."""
    existing = db.query(models.Customer).filter(
        models.Customer.email == customer.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer.email}' already exists."
        )

    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers(
    db: Session, skip: int = 0, limit: int = 100
) -> list[models.Customer]:
    """Retrieve all customers with pagination."""
    return db.query(models.Customer).offset(skip).limit(limit).all()


def get_customer(db: Session, customer_id: int) -> models.Customer:
    """Retrieve a customer by ID. Raises 404 if not found."""
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found."
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> dict:
    """Delete a customer by ID."""
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{customer.full_name}' deleted successfully."}


# ═══════════════════════════════════════════════════════════════════════
#  ORDER CRUD
# ═══════════════════════════════════════════════════════════════════════

def create_order(db: Session, order: schemas.OrderCreate) -> models.Order:
    """
    Create a new order with business logic:
    - Validates customer exists
    - Validates all products exist and have sufficient stock
    - Auto-calculates unit_price, subtotal, and total_amount
    - Decrements product stock atomically
    """
    # Validate customer exists
    customer = db.query(models.Customer).filter(
        models.Customer.id == order.customer_id
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order.customer_id} not found."
        )

    # Validate all products and check stock
    order_items = []
    total_amount = 0.0

    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found."
            )

        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.quantity}, Requested: {item.quantity}."
                )
            )

        subtotal = product.price * item.quantity
        total_amount += subtotal

        order_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal,
        })

    # Create the order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=round(total_amount, 2),
        status="confirmed",
    )
    db.add(db_order)
    db.flush()  # Get the order ID without committing

    # Create order items and decrement stock
    for item_data in order_items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(db_item)

        # Decrement product stock
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)
    return db_order


def get_orders(db: Session, skip: int = 0, limit: int = 100) -> list[dict]:
    """Retrieve all orders with customer names and item details."""
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    result = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "customer_id": order.customer_id,
            "customer_name": order.customer.full_name if order.customer else None,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name if item.product else None,
                    "product_sku": item.product.sku if item.product else None,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "subtotal": item.subtotal,
                }
                for item in order.items
            ],
        }
        result.append(order_dict)
    return result


def get_order(db: Session, order_id: int) -> dict:
    """Retrieve an order by ID with full details."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else None,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "product_sku": item.product.sku if item.product else None,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
    }


def delete_order(db: Session, order_id: int) -> dict:
    """Delete/cancel an order and restore stock."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )

    # Restore stock for each item
    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"message": f"Order #{order_id} cancelled and stock restored."}


# ═══════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════════════

def get_dashboard(db: Session) -> dict:
    """Get dashboard summary statistics."""
    from sqlalchemy import func as sqlfunc

    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()

    total_revenue = db.query(
        sqlfunc.coalesce(sqlfunc.sum(models.Order.total_amount), 0.0)
    ).scalar()

    # Products with quantity <= 10 are considered low stock
    low_stock = db.query(models.Product).filter(
        models.Product.quantity <= 10
    ).all()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
        "total_revenue": round(float(total_revenue), 2),
    }
