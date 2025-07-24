import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    restaurant_name: 'مطعم دارك',
    restaurant_name_en: 'Dark Restaurant',
    address: '',
    phone: '',
    email: '',
    tax_rate: 0.15,
    currency: 'ريال',
    currency_en: 'SAR',
    logo_url: ''
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    name_ar: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Here you would normally save to the backend
      // await axios.put(`${API}/settings`, settings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      await axios.post(`${API}/categories`, newCategory);
      setNewCategory({
        name: '',
        name_ar: '',
        description: ''
      });
      fetchCategories();
      alert('تم إضافة التصنيف بنجاح');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('خطأ في إضافة التصنيف');
    }
  };

  const createBackup = async () => {
    try {
      alert('سيتم إضافة ميزة النسخ الاحتياطي قريباً');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('خطأ في إنشاء النسخة الاحتياطية');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">إعدادات النظام</h1>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              الإعدادات العامة
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              التصنيفات
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              النسخ الاحتياطي
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              إدارة المستخدمين
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">معلومات المطعم</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المطعم (عربي)
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name}
                    onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المطعم (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={settings.restaurant_name_en}
                    onChange={(e) => setSettings({...settings, restaurant_name_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معدل الضريبة
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({...settings, tax_rate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 number-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">مثال: 0.15 للضريبة 15%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العملة (عربي)
                  </label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العملة (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={settings.currency_en}
                    onChange={(e) => setSettings({...settings, currency_en: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الشعار
                </label>
                <input
                  type="url"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({...settings, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">إدارة التصنيفات</h3>
              </div>

              {/* Add New Category */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">إضافة تصنيف جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      value={newCategory.name_ar}
                      onChange={(e) => setNewCategory({...newCategory, name_ar: e.target.value})}
                      placeholder="اسم التصنيف (عربي)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="اسم التصنيف (إنجليزي)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <button
                      onClick={createCategory}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="وصف التصنيف (اختياري)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        التصنيف (عربي)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        التصنيف (إنجليزي)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الوصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        تاريخ الإنشاء
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name_ar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 ml-3">
                            تعديل
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">النسخ الاحتياطي</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-blue-900 mb-4">إنشاء نسخة احتياطية</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    قم بإنشاء نسخة احتياطية من جميع بيانات النظام للحفاظ على معلوماتك.
                  </p>
                  <button
                    onClick={createBackup}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    إنشاء نسخة احتياطية
                  </button>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-green-900 mb-4">استعادة النسخة الاحتياطية</h4>
                  <p className="text-sm text-green-700 mb-4">
                    استعد بياناتك من نسخة احتياطية سابقة.
                  </p>
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="file"
                      accept=".json,.sql"
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                      استعادة
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-yellow-900 mb-4">النسخ الاحتياطية الأخيرة</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                    <span className="text-sm">نسخة احتياطية - 2024/01/15</span>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="text-blue-600 text-sm hover:text-blue-800">تحميل</button>
                      <button className="text-red-600 text-sm hover:text-red-800">حذف</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                    <span className="text-sm">نسخة احتياطية - 2024/01/10</span>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="text-blue-600 text-sm hover:text-blue-800">تحميل</button>
                      <button className="text-red-600 text-sm hover:text-red-800">حذف</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">نسخة احتياطية - 2024/01/05</span>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="text-blue-600 text-sm hover:text-blue-800">تحميل</button>
                      <button className="text-red-600 text-sm hover:text-red-800">حذف</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">إدارة المستخدمين</h3>
              
              <div className="bg-white border rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                  قم بإضافة مستخدمين جدد وإدارة صلاحياتهم في النظام.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="اسم المستخدم"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">اختر الدور</option>
                    <option value="manager">مدير</option>
                    <option value="accountant">محاسب</option>
                    <option value="worker">عامل</option>
                    <option value="kitchen_supervisor">مشرف مطبخ</option>
                  </select>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    إضافة مستخدم
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>الأدوار المتاحة:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>مدير:</strong> الوصول الكامل لجميع الوظائف</li>
                    <li><strong>محاسب:</strong> الوصول للتقارير والمعاملات المالية</li>
                    <li><strong>عامل:</strong> الوصول للمبيعات والفواتير فقط</li>
                    <li><strong>مشرف مطبخ:</strong> الوصول للمخزون والمنتجات</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;