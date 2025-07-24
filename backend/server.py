from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = "dark_restaurant_secret_key_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Dark Restaurant Management System", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    MANAGER = "manager"
    ACCOUNTANT = "accountant"
    WORKER = "worker"
    KITCHEN_SUPERVISOR = "kitchen_supervisor"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    DEFERRED = "deferred"

class TransactionType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    EXPENSE = "expense"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: str
    category_id: str
    cost_price: float
    selling_price: float
    unit: str
    unit_ar: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    stock_quantity: int = 0
    min_stock_level: int = 10
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InvoiceItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[InvoiceItem]
    subtotal: float
    discount: float = 0
    tax_rate: float = 0.15
    tax_amount: float
    total_amount: float
    payment_method: PaymentMethod
    status: str = "completed"
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Supplier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    balance: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PurchaseItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class Purchase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    purchase_number: str
    supplier_id: str
    supplier_name: str
    items: List[PurchaseItem]
    subtotal: float
    discount: float = 0
    tax_amount: float = 0
    total_amount: float
    payment_status: str = "pending"  # pending, paid, partial
    paid_amount: float = 0
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: str
    national_id: str
    phone: str
    email: Optional[str] = None
    department: str
    department_ar: str
    position: str
    position_ar: str
    salary: float
    hire_date: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StockMovement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    product_name: str
    movement_type: str  # in, out
    quantity: int
    reference_type: str  # sale, purchase, adjustment
    reference_id: str
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RestaurantSettings(BaseModel):
    restaurant_name: str = "مطعم دارك"
    restaurant_name_en: str = "Dark Restaurant"
    address: str
    phone: str
    email: str
    tax_rate: float = 0.15
    currency: str = "ريال"
    currency_en: str = "SAR"
    logo_url: Optional[str] = None

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

# Authentication endpoints
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="اسم المستخدم أو البريد الإلكتروني موجود بالفعل")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    return user

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    if not user["is_active"]:
        raise HTTPException(status_code=400, detail="الحساب غير مفعل")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

# Dashboard endpoint
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Today's sales
    today_sales = await db.invoices.aggregate([
        {"$match": {"created_at": {"$gte": today}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)
    
    # This month's sales
    month_start = today.replace(day=1)
    month_sales = await db.invoices.aggregate([
        {"$match": {"created_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}, "count": {"$sum": 1}}}
    ]).to_list(1)
    
    # Low stock products
    low_stock_products = await db.products.count_documents({
        "$expr": {"$lte": ["$stock_quantity", "$min_stock_level"]}
    })
    
    # Total suppliers
    total_suppliers = await db.suppliers.count_documents({})
    
    return {
        "today_sales": today_sales[0]["total"] if today_sales else 0,
        "today_orders": today_sales[0]["count"] if today_sales else 0,
        "month_sales": month_sales[0]["total"] if month_sales else 0,
        "month_orders": month_sales[0]["count"] if month_sales else 0,
        "low_stock_alerts": low_stock_products,
        "total_suppliers": total_suppliers
    }

# Categories endpoints
@api_router.post("/categories", response_model=Category)
async def create_category(category: Category, current_user: User = Depends(get_current_user)):
    await db.categories.insert_one(category.dict())
    return category

@api_router.get("/categories", response_model=List[Category])
async def get_categories(current_user: User = Depends(get_current_user)):
    categories = await db.categories.find().to_list(1000)
    return [Category(**cat) for cat in categories]

# Products endpoints
@api_router.post("/products", response_model=Product)
async def create_product(product: Product, current_user: User = Depends(get_current_user)):
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    products = await db.products.find({"is_active": True}).to_list(1000)
    return [Product(**prod) for prod in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: Product, current_user: User = Depends(get_current_user)):
    await db.products.update_one({"id": product_id}, {"$set": product_data.dict()})
    return product_data

# Invoices endpoints
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: Invoice, current_user: User = Depends(get_current_user)):
    # Generate invoice number
    count = await db.invoices.count_documents({}) + 1
    invoice.invoice_number = f"INV-{count:06d}"
    invoice.created_by = current_user.id
    
    # Calculate totals
    invoice.subtotal = sum(item.total_price for item in invoice.items)
    invoice.tax_amount = invoice.subtotal * invoice.tax_rate
    invoice.total_amount = invoice.subtotal + invoice.tax_amount - invoice.discount
    
    # Save invoice
    await db.invoices.insert_one(invoice.dict())
    
    # Update stock
    for item in invoice.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock_quantity": -item.quantity}}
        )
        
        # Record stock movement
        movement = StockMovement(
            product_id=item.product_id,
            product_name=item.product_name,
            movement_type="out",
            quantity=item.quantity,
            reference_type="sale",
            reference_id=invoice.id,
            created_by=current_user.id
        )
        await db.stock_movements.insert_one(movement.dict())
    
    return invoice

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find().sort("created_at", -1).to_list(1000)
    return [Invoice(**inv) for inv in invoices]

# Suppliers endpoints
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: Supplier, current_user: User = Depends(get_current_user)):
    await db.suppliers.insert_one(supplier.dict())
    return supplier

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(current_user: User = Depends(get_current_user)):
    suppliers = await db.suppliers.find().to_list(1000)
    return [Supplier(**sup) for sup in suppliers]

# Purchases endpoints
@api_router.post("/purchases", response_model=Purchase)
async def create_purchase(purchase: Purchase, current_user: User = Depends(get_current_user)):
    # Generate purchase number
    count = await db.purchases.count_documents({}) + 1
    purchase.purchase_number = f"PUR-{count:06d}"
    purchase.created_by = current_user.id
    
    # Calculate totals
    purchase.subtotal = sum(item.total_price for item in purchase.items)
    purchase.total_amount = purchase.subtotal + purchase.tax_amount - purchase.discount
    
    # Save purchase
    await db.purchases.insert_one(purchase.dict())
    
    # Update stock
    for item in purchase.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock_quantity": item.quantity}}
        )
        
        # Record stock movement
        movement = StockMovement(
            product_id=item.product_id,
            product_name=item.product_name,
            movement_type="in",
            quantity=item.quantity,
            reference_type="purchase",
            reference_id=purchase.id,
            created_by=current_user.id
        )
        await db.stock_movements.insert_one(movement.dict())
    
    return purchase

@api_router.get("/purchases", response_model=List[Purchase])
async def get_purchases(current_user: User = Depends(get_current_user)):
    purchases = await db.purchases.find().sort("created_at", -1).to_list(1000)
    return [Purchase(**pur) for pur in purchases]

# Employees endpoints
@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: Employee, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="غير مسموح لك بهذه العملية")
    await db.employees.insert_one(employee.dict())
    return employee

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.MANAGER, UserRole.ACCOUNTANT]:
        raise HTTPException(status_code=403, detail="غير مسموح لك بهذه العملية")
    employees = await db.employees.find({"is_active": True}).to_list(1000)
    return [Employee(**emp) for emp in employees]

# Stock movements endpoint
@api_router.get("/stock-movements", response_model=List[StockMovement])
async def get_stock_movements(current_user: User = Depends(get_current_user)):
    movements = await db.stock_movements.find().sort("created_at", -1).limit(100).to_list(100)
    return [StockMovement(**mov) for mov in movements]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
