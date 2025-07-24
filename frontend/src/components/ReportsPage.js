import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportsPage = () => {
  const [reportData, setReportData] = useState({
    sales: [],
    purchases: [],
    products: [],
    invoices: []
  });
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('financial');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [invoicesRes, purchasesRes, productsRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/purchases`),
        axios.get(`${API}/products`)
      ]);

      setReportData({
        sales: invoicesRes.data,
        purchases: purchasesRes.data,
        products: productsRes.data,
        invoices: invoicesRes.data
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSales = () => {
    return reportData.sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const calculateTotalPurchases = () => {
    return reportData.purchases.reduce((total, purchase) => total + purchase.total_amount, 0);
  };

  const calculateProfit = () => {
    return calculateTotalSales() - calculateTotalPurchases();
  };

  const getTopSellingProducts = () => {
    const productSales = {};
    
    reportData.sales.forEach(sale => {
      sale.items.forEach(item => {
        if (productSales[item.product_id]) {
          productSales[item.product_id].quantity += item.quantity;
          productSales[item.product_id].total += item.total_price;
        } else {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: item.quantity,
            total: item.total_price
          };
        }
      });
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const getInventoryValue = () => {
    return reportData.products.reduce((total, product) => 
      total + (product.stock_quantity * product.cost_price), 0
    );
  };

  const exportToPDF = () => {
    alert('سيتم إضافة ميزة التصدير إلى PDF قريباً');
  };

  const exportToExcel = () => {
    alert('سيتم إضافة ميزة التصدير إلى Excel قريباً');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل التقارير...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">التقارير المحاسبية</h1>
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            تصدير PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">فترة التقرير</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              تطبيق الفلتر
            </button>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse px-6">
            <button
              onClick={() => setActiveReport('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              التقرير المالي
            </button>
            <button
              onClick={() => setActiveReport('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              تقرير المبيعات
            </button>
            <button
              onClick={() => setActiveReport('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              تقرير المخزون
            </button>
            <button
              onClick={() => setActiveReport('profit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'profit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              الربح والخسارة
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeReport === 'financial' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">الملخص المالي</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-600">إجمالي المبيعات</p>
                      <p className="text-2xl font-bold text-blue-900">{calculateTotalSales().toFixed(2)} ريال</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600">إجمالي المشتريات</p>
                      <p className="text-2xl font-bold text-red-900">{calculateTotalPurchases().toFixed(2)} ريال</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600">صافي الربح</p>
                      <p className="text-2xl font-bold text-green-900">{calculateProfit().toFixed(2)} ريال</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-600">قيمة المخزون</p>
                      <p className="text-2xl font-bold text-purple-900">{getInventoryValue().toFixed(2)} ريال</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'sales' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">تقرير المبيعات التفصيلي</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        رقم الفاتورة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        المبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        طريقة الدفع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.sales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.customer_name || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.total_amount.toFixed(2)} ريال
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.payment_method === 'cash' ? 'نقدي' : 
                           sale.payment_method === 'card' ? 'بطاقة' : 'آجل'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'inventory' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">تقرير المخزون</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الكمية الحالية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        سعر التكلفة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        سعر البيع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        القيمة الإجمالية
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name_ar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock_quantity} {product.unit_ar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.cost_price.toFixed(2)} ريال
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.selling_price.toFixed(2)} ريال
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(product.stock_quantity * product.cost_price).toFixed(2)} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'profit' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">تقرير الربح والخسارة</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">الإيرادات</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>إجمالي المبيعات</span>
                      <span className="font-medium">{calculateTotalSales().toFixed(2)} ريال</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">إجمالي الإيرادات</span>
                      <span className="font-bold text-green-600">{calculateTotalSales().toFixed(2)} ريال</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">المصروفات</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>تكلفة المشتريات</span>
                      <span className="font-medium">{calculateTotalPurchases().toFixed(2)} ريال</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">إجمالي المصروفات</span>
                      <span className="font-bold text-red-600">{calculateTotalPurchases().toFixed(2)} ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">صافي الربح/الخسارة</span>
                  <span className={`text-2xl font-bold ${
                    calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateProfit().toFixed(2)} ريال
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  هامش الربح: {((calculateProfit() / calculateTotalSales()) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">المنتجات الأكثر مبيعاً</h4>
                <div className="space-y-3">
                  {getTopSellingProducts().map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full ml-3">
                          {index + 1}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{product.quantity} قطعة</div>
                        <div className="text-sm text-gray-500">{product.total.toFixed(2)} ريال</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;