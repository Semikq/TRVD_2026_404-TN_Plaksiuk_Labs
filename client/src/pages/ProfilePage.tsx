import { useAuthStore } from '../stores/authStore'
import { useState, useEffect } from 'react'
import { LogOut, Settings, Shield, AlertCircle, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user, token, updateProfile, logout } = useAuthStore()
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Завантаження замовлень користувача
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) {
        setOrdersLoading(false)
        return
      }

      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data.orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrdersError('Не вдалося завантажити замовлення')
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user, token])

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      phone: ''
    }

    // Валідація імені
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ім'я є обов'язковим полем"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Ім'я повинно містити щонайменше 2 символи"
    } else if (!/^[а-яА-ЯёЁa-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "Ім'я може містити лише літери, пробіли, апостроф та дефіс"
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "Ім'я не може бути довшим за 50 символів"
    }

    // Валідація прізвища
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Прізвище є обов'язковим полем"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Прізвище повинно містити щонайменше 2 символи"
    } else if (!/^[а-яА-ЯёЁa-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Прізвище може містити лише літери, пробіли, апостроф та дефіс"
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Прізвище не може бути довшим за 50 символів"
    }

    // Валідація телефону (опціонально, але якщо заповнено - перевіряємо)
    if (formData.phone.trim()) {
      const phoneRegex = /^\+380\d{9}$|^0\d{9}$|^(\d{3}[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2})$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "Введіть правильний номер телефону (формат: +380XXXXXXXXX або 0XXXXXXXXX)"
      }
    }

    setErrors(newErrors)
    return !newErrors.firstName && !newErrors.lastName && !newErrors.phone
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Очищуємо помилку для поля, коли користувач починає вводити
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валідація форми перед відправкою
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    const success = await updateProfile(formData)
    
    if (success) {
      // Форма успішно оновлена
      setIsSubmitting(false)
      setShowSuccessModal(true)
      // Автоматично закриваємо модальне вікно через 3 секунди
      setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
    } else {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Скинути форму до початкових значень
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    })
  }

  const handleLogout = () => {
    logout()
    // Перенаправлення на головну сторінку відбудеться автоматично через Header компонент
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Мій Профіль</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Особиста Інформація</h2>
                <p className="text-gray-600 text-sm">Керуйте вашими особистими даними</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${errors.firstName ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                    Ім'я
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Введіть ім'я"
                    />
                    {errors.firstName && (
                      <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          {errors.firstName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${errors.lastName ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                    Прізвище
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Введіть прізвище"
                    />
                    {errors.lastName && (
                      <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          {errors.lastName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                    readOnly
                  />
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${errors.phone ? 'bg-red-500' : 'bg-purple-500'}`}></span>
                  Телефон
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-10 border-2 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="+380 XX XXX XX XX"
                  />
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  {errors.phone && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg z-10">
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {errors.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8c0 2.385-1.06 4.517-2.734 5.947L4 12z"></path>
                        </svg>
                        Оновлення...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Оновити Профіль
                      </>
                    )}
                  </span>
                </button>
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Account Settings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {/* <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              Налаштування
            </h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Безпека</p>
                    <p className="text-sm text-gray-600">Змінити пароль</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 7.716 6 9v5.158c0 .538.214 1.055.595 1.436L4 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Сповіщення</p>
                    <p className="text-sm text-gray-600">Налаштувати сповіщення</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors group">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Історія</p>
                    <p className="text-sm text-gray-600">Історія замовлень</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div> */}

          {/* Logout Button */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Обліковий запис</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Тип облікового запису</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Shield className="w-4 h-4 mr-1 text-green-600" />
                    {user?.role === 'CLIENT' ? 'Клієнт' : user?.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Статус</p>
                  <p className="text-sm font-medium text-green-600">Активний</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Дата реєстрації</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Невідомо'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="text-sm font-mono text-gray-600">#{user?.id?.slice(-8)}</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Вийти з профілю
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Після виходу всі дані будуть очищені з цього пристрою
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Останні Замовлення
        </h2>
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            </div>
          ) : ordersError ? (
            <div className="text-center py-8 text-red-500">
              <p>{ordersError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Спробувати знову
              </button>
            </div>
          ) : !user ? (
            <div className="text-center py-8 text-gray-500">
              <p>Будь ласка, увійдіть, щоб побачити свої замовлення</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>У вас ще немає замовлень</p>
              <Link 
                to="/products"
                className="mt-2 inline-block text-blue-600 hover:text-blue-700"
              >
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? 'Очікує' :
                         order.status === 'CONFIRMED' ? 'Підтверджено' :
                         order.status === 'DELIVERED' ? 'Доставлено' :
                         order.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {Math.round(order.totalAmount * 39)}₴
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{order.orderItems?.length || 0} товарів</p>
                  </div>
                </div>
              ))}
              {orders.length > 3 && (
                <div className="text-center">
                  <Link 
                    to="/orders"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Переглянути всі замовлення
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeSuccessModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Профіль успішно оновлено!</h3>
              <p className="text-gray-600 mb-6">
                Ваші особисті дані були успішно збережені в системі
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={closeSuccessModal}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Добре
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Вікно автоматично закриється через 3 секунди
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
