#!/usr/bin/env python3
"""
Initialize Dark Restaurant Management System with initial data
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_database():
    """Initialize the database with initial data"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Create admin user
        admin_exists = await db.users.find_one({"username": "admin"})
        if not admin_exists:
            admin_user = {
                "id": "admin-001",
                "username": "admin",
                "email": "admin@dark-restaurant.com",
                "full_name": "مدير النظام",
                "role": "manager",
                "is_active": True,
                "password": pwd_context.hash("admin123"),
                "created_at": "2024-01-01T00:00:00"
            }
            await db.users.insert_one(admin_user)
            print("✅ تم إنشاء حساب المدير")
            print("اسم المستخدم: admin")
            print("كلمة المرور: admin123")
        
        # Create sample categories
        categories_exist = await db.categories.count_documents({})
        if categories_exist == 0:
            categories = [
                {
                    "id": "cat-001",
                    "name": "Main Dishes",
                    "name_ar": "الأطباق الرئيسية",
                    "description": "Main course dishes",
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "cat-002", 
                    "name": "Beverages",
                    "name_ar": "المشروبات",
                    "description": "Hot and cold drinks",
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "cat-003",
                    "name": "Appetizers", 
                    "name_ar": "المقبلات",
                    "description": "Starters and appetizers",
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "cat-004",
                    "name": "Desserts",
                    "name_ar": "الحلويات", 
                    "description": "Sweet desserts",
                    "created_at": "2024-01-01T00:00:00"
                }
            ]
            await db.categories.insert_many(categories)
            print("✅ تم إنشاء التصنيفات الأساسية")
        
        # Create sample products
        products_exist = await db.products.count_documents({})
        if products_exist == 0:
            products = [
                {
                    "id": "prod-001",
                    "name": "Dark Special Burger",
                    "name_ar": "برجر دارك سبيشل",
                    "category_id": "cat-001",
                    "cost_price": 15.0,
                    "selling_price": 35.0,
                    "unit": "piece",
                    "unit_ar": "قطعة",
                    "description": "Special burger with premium ingredients",
                    "is_active": True,
                    "stock_quantity": 50,
                    "min_stock_level": 10,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "prod-002",
                    "name": "Fresh Orange Juice",
                    "name_ar": "عصير البرتقال الطازج",
                    "category_id": "cat-002",
                    "cost_price": 3.0,
                    "selling_price": 12.0,
                    "unit": "glass",
                    "unit_ar": "كوب",
                    "description": "Freshly squeezed orange juice",
                    "is_active": True,
                    "stock_quantity": 100,
                    "min_stock_level": 20,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "prod-003",
                    "name": "Caesar Salad",
                    "name_ar": "سلطة سيزر",
                    "category_id": "cat-003",
                    "cost_price": 8.0,
                    "selling_price": 22.0,
                    "unit": "plate",
                    "unit_ar": "طبق",
                    "description": "Fresh caesar salad with croutons",
                    "is_active": True,
                    "stock_quantity": 30,
                    "min_stock_level": 5,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "prod-004",
                    "name": "Chocolate Cake",
                    "name_ar": "كيك الشوكولاتة",
                    "category_id": "cat-004",
                    "cost_price": 12.0,
                    "selling_price": 28.0,
                    "unit": "slice",
                    "unit_ar": "قطعة",
                    "description": "Rich chocolate cake",
                    "is_active": True,
                    "stock_quantity": 20,
                    "min_stock_level": 3,
                    "created_at": "2024-01-01T00:00:00"
                }
            ]
            await db.products.insert_many(products)
            print("✅ تم إنشاء المنتجات التجريبية")
        
        # Create sample suppliers
        suppliers_exist = await db.suppliers.count_documents({})
        if suppliers_exist == 0:
            suppliers = [
                {
                    "id": "sup-001",
                    "name": "Fresh Foods Company",
                    "name_ar": "شركة الأطعمة الطازجة",
                    "contact_person": "أحمد محمد",
                    "phone": "+966501234567",
                    "email": "ahmed@freshfoods.com",
                    "address": "الرياض، المملكة العربية السعودية",
                    "balance": 0.0,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "sup-002",
                    "name": "Quality Meats",
                    "name_ar": "اللحوم عالية الجودة",
                    "contact_person": "محمد عبدالله",
                    "phone": "+966507654321",
                    "email": "mohammed@qualitymeats.com",
                    "address": "جدة، المملكة العربية السعودية",
                    "balance": 0.0,
                    "created_at": "2024-01-01T00:00:00"
                }
            ]
            await db.suppliers.insert_many(suppliers)
            print("✅ تم إنشاء قائمة الموردين")
        
        # Create sample employees
        employees_exist = await db.employees.count_documents({})
        if employees_exist == 0:
            employees = [
                {
                    "id": "emp-001",
                    "name": "خالد العتيبي",
                    "name_ar": "خالد العتيبي",
                    "national_id": "1234567890",
                    "phone": "+966501111111",
                    "email": "khalid@dark-restaurant.com",
                    "department": "Kitchen",
                    "department_ar": "المطبخ",
                    "position": "Head Chef",
                    "position_ar": "شيف رئيسي",
                    "salary": 8000.0,
                    "hire_date": "2024-01-01T00:00:00",
                    "is_active": True,
                    "created_at": "2024-01-01T00:00:00"
                },
                {
                    "id": "emp-002",
                    "name": "فاطمة أحمد",
                    "name_ar": "فاطمة أحمد",
                    "national_id": "0987654321",
                    "phone": "+966502222222",
                    "email": "fatima@dark-restaurant.com",
                    "department": "Service",
                    "department_ar": "الخدمة",
                    "position": "Waitress",
                    "position_ar": "مضيفة",
                    "salary": 4500.0,
                    "hire_date": "2024-01-01T00:00:00",
                    "is_active": True,
                    "created_at": "2024-01-01T00:00:00"
                }
            ]
            await db.employees.insert_many(employees)
            print("✅ تم إنشاء قائمة الموظفين")
        
        print("\n🎉 تم تهيئة قاعدة البيانات بنجاح!")
        print("يمكنك الآن تسجيل الدخول باستخدام:")
        print("اسم المستخدم: admin")
        print("كلمة المرور: admin123")
        
    except Exception as e:
        print(f"❌ خطأ في تهيئة قاعدة البيانات: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 بدء تهيئة قاعدة البيانات...")
    asyncio.run(init_database())