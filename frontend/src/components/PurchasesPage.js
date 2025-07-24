import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    supplier_id: '',
    supplier_name: '',
    items: [],
    discount: 0,
    tax_amount: 0,
    payment_status: 'pending',
    paid_amount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API}/purchases`);
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addItemToPurchase = () => {
    setNewPurchase({
      ...newPurchase,
      items: [...newPurchase.items, {
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0
      }]
    });
  };

  const updatePurchaseItem = (index, field, value) => {
    const updatedItems = [...newPurchase.items];
    updatedItems[index][field] = value;

    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].product_name = product.name_ar;
        updatedItems[index].unit_price = product.cost_price;
        updatedItems[index].total_price = product.cost_price * updatedItems[index].quantity;
      }
    }

    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setNewPurchase({
      ...newPurchase,
      items: updatedItems
    });
  };

  const removePurchaseItem = (index) => {
    const updatedItems = newPurchase.items.filter((_, i) => i !== index);
    setNewPurchase({
      ...newPurchase,
      items: updatedItems
    });
  };

  const updateSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setNewPurchase({
      ...newPurchase,
      supplier_id: supplierId,
      supplier_name: supplier ? supplier.name_ar : ''
    });
  };

  const calculateSubtotal = () => {
    return newPurchase.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const createPurchase = async () => {
    try {
      const purchaseData = {
        ...newPurchase,
        subtotal: calculateSubtotal(),
        total_amount: calculateSubtotal() + newPurchase.tax_amount - newPurchase.discount
      };

      await axios.post(`${API}/purchases`, purchaseData);
      setShowCreateModal(false);
      setNewPurchase({
        supplier_id: '',
        supplier_name: '',
        items: [],
        discount: 0,
        tax_amount: 0,
        payment_status: 'pending',
        paid_amount: 0,
        notes: ''
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('خطأ في إنشاء فاتورة الشراء');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">جارٍ تحميل المشتريات...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المشتريات</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة مشترى جديد
        </button>
      </div>

      {/* Purchases List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم المشترى
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المورد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ الإجمالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ المدفوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حالة الدفع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {purchase.purchase_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.total_amount.toFixed(2)} ريال
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {purchase.paid_amount.toFixed(2)} ريال
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    purchase.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : purchase.payment_status === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {purchase.payment_status === 'paid' ? 'مدفوع' : 
                     purchase.payment_status === 'partial' ? 'جزئي' : 'معلق'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(purchase.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 ml-3">
                    عرض
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    دفع
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Purchase Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مشترى جديد</h3>
              
              {/* Supplier Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المورد
                </label>
                <select
                  value={newPurchase.supplier_id}
                  onChange={(e) => updateSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر المورد</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">أصناف المشترى</h4>
                  <button
                    onClick={addItemToPurchase}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    إضافة صنف
                  </button>
                </div>

                <div className="space-y-3">
                  {newPurchase.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded">
                      <div className="col-span-4">
                        <select
                          value={item.product_id}
                          onChange={(e) => updatePurchaseItem(index, 'product_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">اختر المنتج</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="الكمية"
                          value={item.quantity}
                          onChange={(e) => updatePurchaseItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm number-input"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="السعر"
                          value={item.unit_price}
                          onChange={(e) => updatePurchaseItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm number-input"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium">
                          {item.total_price.toFixed(2)} ريال
                        </span>
                      </div>
                      <div className="col-span-2">
                        <button
                          onClick={() => removePurchaseItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخصم
                  </label>
                  <input
                    type="number"
                    value={newPurchase.discount}
                    onChange={(e) => setNewPurchase({...newPurchase, discount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md number-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الضريبة
                  </label>
                  <input
                    type="number"
                    value={newPurchase.tax_amount}
                    onChange={(e) => setNewPurchase({...newPurchase, tax_amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md number-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الدفع
                  </label>
                  <select
                    value={newPurchase.payment_status}
                    onChange={(e) => setNewPurchase({...newPurchase, payment_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">معلق</option>
                    <option value="partial">جزئي</option>
                    <option value="paid">مدفوع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإجمالي
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-md font-bold">
                    {(calculateSubtotal() + newPurchase.tax_amount - newPurchase.discount).toFixed(2)} ريال
                  </div>
                </div>
              </div>

              {/* Payment Amount if partial or paid */}
              {newPurchase.payment_status !== 'pending' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المبلغ المدفوع
                  </label>
                  <input
                    type="number"
                    value={newPurchase.paid_amount}
                    onChange={(e) => setNewPurchase({...newPurchase, paid_amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md number-input"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={newPurchase.notes}
                  onChange={(e) => setNewPurchase({...newPurchase, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={createPurchase}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  إنشاء المشترى
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;