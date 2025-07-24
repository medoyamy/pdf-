import requests
import sys
import json
from datetime import datetime
import time
import uuid

class DarkRestaurantAPITester:
    def __init__(self, base_url="https://04f26167-5c90-4692-85db-ef82bb01222a.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = {
            "name": name,
            "status": status,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def run_request(self, method, endpoint, expected_status, data=None, files=None):
        """Run a request and return response"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                headers['Content-Type'] = 'application/json'
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
                
            return success, response_data, response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_login(self, username, password):
        """Test login functionality"""
        success, response_data, status_code = self.run_request(
            'POST',
            'auth/login',
            200,
            data={"username": username, "password": password}
        )
        
        if success and 'access_token' in response_data:
            self.token = response_data['access_token']
            self.user = response_data['user']
            return self.log_test("Login", True, f"Successfully logged in as {username}", response_data)
        else:
            error_msg = response_data.get('detail', f"Failed with status {status_code}")
            return self.log_test("Login", False, f"Login failed: {error_msg}", response_data)

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response_data, status_code = self.run_request('GET', 'dashboard/stats', 200)
        
        if success:
            stats_keys = ['today_sales', 'today_orders', 'month_sales', 'month_orders', 'low_stock_alerts', 'total_suppliers']
            all_keys_present = all(key in response_data for key in stats_keys)
            
            if all_keys_present:
                return self.log_test("Dashboard Stats", True, "Successfully retrieved dashboard statistics", response_data)
            else:
                missing_keys = [key for key in stats_keys if key not in response_data]
                return self.log_test("Dashboard Stats", False, f"Missing keys in response: {missing_keys}", response_data)
        else:
            return self.log_test("Dashboard Stats", False, f"Failed with status {status_code}", response_data)

    def test_get_categories(self):
        """Test retrieving categories"""
        success, response_data, status_code = self.run_request('GET', 'categories', 200)
        
        if success:
            return self.log_test("Get Categories", True, f"Successfully retrieved {len(response_data)} categories", response_data)
        else:
            return self.log_test("Get Categories", False, f"Failed with status {status_code}", response_data)

    def test_create_category(self):
        """Test creating a new category"""
        category_data = {
            "name": "Test Category",
            "name_ar": "فئة اختبار",
            "description": "Test category description"
        }
        
        success, response_data, status_code = self.run_request('POST', 'categories', 200, data=category_data)
        
        if success and 'id' in response_data:
            return self.log_test("Create Category", True, "Successfully created new category", response_data)
        else:
            return self.log_test("Create Category", False, f"Failed with status {status_code}", response_data)

    def test_get_products(self):
        """Test retrieving products"""
        success, response_data, status_code = self.run_request('GET', 'products', 200)
        
        if success:
            return self.log_test("Get Products", True, f"Successfully retrieved {len(response_data)} products", response_data)
        else:
            return self.log_test("Get Products", False, f"Failed with status {status_code}", response_data)

    def test_create_product(self):
        """Test creating a new product"""
        # First get categories to use a valid category_id
        _, categories_data, _ = self.run_request('GET', 'categories', 200)
        
        if not categories_data or len(categories_data) == 0:
            # Create a category first
            self.test_create_category()
            _, categories_data, _ = self.run_request('GET', 'categories', 200)
        
        if categories_data and len(categories_data) > 0:
            category_id = categories_data[0]['id']
            
            product_data = {
                "name": "Test Product",
                "name_ar": "منتج اختبار",
                "category_id": category_id,
                "cost_price": 10.5,
                "selling_price": 15.75,
                "unit": "piece",
                "unit_ar": "قطعة",
                "description": "Test product description",
                "stock_quantity": 50,
                "min_stock_level": 10
            }
            
            success, response_data, status_code = self.run_request('POST', 'products', 200, data=product_data)
            
            if success and 'id' in response_data:
                self.test_product_id = response_data['id']
                return self.log_test("Create Product", True, "Successfully created new product", response_data)
            else:
                return self.log_test("Create Product", False, f"Failed with status {status_code}", response_data)
        else:
            return self.log_test("Create Product", False, "No categories available to create product", None)

    def test_get_suppliers(self):
        """Test retrieving suppliers"""
        success, response_data, status_code = self.run_request('GET', 'suppliers', 200)
        
        if success:
            return self.log_test("Get Suppliers", True, f"Successfully retrieved {len(response_data)} suppliers", response_data)
        else:
            return self.log_test("Get Suppliers", False, f"Failed with status {status_code}", response_data)

    def test_create_supplier(self):
        """Test creating a new supplier"""
        supplier_data = {
            "name": "Test Supplier",
            "name_ar": "مورد اختبار",
            "contact_person": "Test Contact",
            "phone": "1234567890",
            "email": "test@supplier.com",
            "address": "Test Address"
        }
        
        success, response_data, status_code = self.run_request('POST', 'suppliers', 200, data=supplier_data)
        
        if success and 'id' in response_data:
            self.test_supplier_id = response_data['id']
            return self.log_test("Create Supplier", True, "Successfully created new supplier", response_data)
        else:
            return self.log_test("Create Supplier", False, f"Failed with status {status_code}", response_data)

    def test_get_invoices(self):
        """Test retrieving invoices"""
        success, response_data, status_code = self.run_request('GET', 'invoices', 200)
        
        if success:
            return self.log_test("Get Invoices", True, f"Successfully retrieved {len(response_data)} invoices", response_data)
        else:
            return self.log_test("Get Invoices", False, f"Failed with status {status_code}", response_data)

    def test_create_invoice(self):
        """Test creating a new invoice"""
        # First get products to use in invoice
        _, products_data, _ = self.run_request('GET', 'products', 200)
        
        if not products_data or len(products_data) == 0:
            # Create a product first
            self.test_create_product()
            _, products_data, _ = self.run_request('GET', 'products', 200)
        
        if products_data and len(products_data) > 0:
            product = products_data[0]
            
            invoice_data = {
                "customer_name": "Test Customer",
                "customer_phone": "1234567890",
                "items": [
                    {
                        "product_id": product['id'],
                        "product_name": product['name_ar'],
                        "quantity": 2,
                        "unit_price": product['selling_price'],
                        "total_price": 2 * product['selling_price']
                    }
                ],
                "subtotal": 2 * product['selling_price'],
                "discount": 0,
                "tax_rate": 0.15,
                "tax_amount": 0.15 * 2 * product['selling_price'],
                "total_amount": 1.15 * 2 * product['selling_price'],
                "payment_method": "cash",
                "notes": "Test invoice"
            }
            
            success, response_data, status_code = self.run_request('POST', 'invoices', 200, data=invoice_data)
            
            if success and 'id' in response_data:
                return self.log_test("Create Invoice", True, "Successfully created new invoice", response_data)
            else:
                return self.log_test("Create Invoice", False, f"Failed with status {status_code}", response_data)
        else:
            return self.log_test("Create Invoice", False, "No products available to create invoice", None)

    def test_get_purchases(self):
        """Test retrieving purchases"""
        success, response_data, status_code = self.run_request('GET', 'purchases', 200)
        
        if success:
            return self.log_test("Get Purchases", True, f"Successfully retrieved {len(response_data)} purchases", response_data)
        else:
            return self.log_test("Get Purchases", False, f"Failed with status {status_code}", response_data)

    def test_create_purchase(self):
        """Test creating a new purchase"""
        # First get products and suppliers
        _, products_data, _ = self.run_request('GET', 'products', 200)
        _, suppliers_data, _ = self.run_request('GET', 'suppliers', 200)
        
        if not products_data or len(products_data) == 0:
            self.test_create_product()
            _, products_data, _ = self.run_request('GET', 'products', 200)
            
        if not suppliers_data or len(suppliers_data) == 0:
            self.test_create_supplier()
            _, suppliers_data, _ = self.run_request('GET', 'suppliers', 200)
        
        if products_data and len(products_data) > 0 and suppliers_data and len(suppliers_data) > 0:
            product = products_data[0]
            supplier = suppliers_data[0]
            
            purchase_data = {
                "supplier_id": supplier['id'],
                "supplier_name": supplier['name_ar'],
                "items": [
                    {
                        "product_id": product['id'],
                        "product_name": product['name_ar'],
                        "quantity": 10,
                        "unit_price": product['cost_price'],
                        "total_price": 10 * product['cost_price']
                    }
                ],
                "subtotal": 10 * product['cost_price'],
                "discount": 0,
                "tax_amount": 0,
                "total_amount": 10 * product['cost_price'],
                "payment_status": "paid",
                "paid_amount": 10 * product['cost_price'],
                "notes": "Test purchase"
            }
            
            success, response_data, status_code = self.run_request('POST', 'purchases', 200, data=purchase_data)
            
            if success and 'id' in response_data:
                return self.log_test("Create Purchase", True, "Successfully created new purchase", response_data)
            else:
                return self.log_test("Create Purchase", False, f"Failed with status {status_code}", response_data)
        else:
            return self.log_test("Create Purchase", False, "No products or suppliers available to create purchase", None)

    def test_get_employees(self):
        """Test retrieving employees"""
        success, response_data, status_code = self.run_request('GET', 'employees', 200)
        
        if success:
            return self.log_test("Get Employees", True, f"Successfully retrieved {len(response_data)} employees", response_data)
        else:
            return self.log_test("Get Employees", False, f"Failed with status {status_code}", response_data)

    def test_get_stock_movements(self):
        """Test retrieving stock movements"""
        success, response_data, status_code = self.run_request('GET', 'stock-movements', 200)
        
        if success:
            return self.log_test("Get Stock Movements", True, f"Successfully retrieved {len(response_data)} stock movements", response_data)
        else:
            return self.log_test("Get Stock Movements", False, f"Failed with status {status_code}", response_data)

    def run_all_tests(self):
        """Run all API tests"""
        print("\n🔍 Starting Dark Restaurant API Tests...\n")
        
        # Authentication tests
        self.test_login("admin", "admin123")
        
        if not self.token:
            print("❌ Authentication failed. Cannot proceed with other tests.")
            return False
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Categories tests
        self.test_get_categories()
        self.test_create_category()
        
        # Products tests
        self.test_get_products()
        self.test_create_product()
        
        # Suppliers tests
        self.test_get_suppliers()
        self.test_create_supplier()
        
        # Invoices tests
        self.test_get_invoices()
        self.test_create_invoice()
        
        # Purchases tests
        self.test_get_purchases()
        self.test_create_purchase()
        
        # Employees tests
        self.test_get_employees()
        
        # Stock movements tests
        self.test_get_stock_movements()
        
        # Print summary
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({(self.tests_passed/self.tests_run)*100:.1f}%)")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = DarkRestaurantAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
