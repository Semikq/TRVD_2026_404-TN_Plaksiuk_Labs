import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

interface FormData {
  deliveryType: string
  address: string
  phone: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

interface FormErrors {
  address?: string
  phone?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

export default function CheckoutPage() {
  const { user, token } = useAuthStore()
  const { items, clearCart, initializeCart } = useCartStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    deliveryType: 'Доставка Додому',
    address: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Очищення кошика від невалідних даних при завантаженні
  useEffect(() => {
    initializeCart()
  }, [initializeCart])

  // Розрахунок загальної суми
  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return itemsTotal
  }

  // Валідація українського номера телефону
  const validateUkrainianPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '')
    const ukrainianPhoneRegex = /^(380|80|\+380)?[3-9]\d{8}$/
    return ukrainianPhoneRegex.test(cleanPhone) && cleanPhone.length >= 9
  }

  // Валідація номера картки
  const validateCardNumber = (cardNumber: string): boolean => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleanCardNumber)
  }

  // Валідація терміну дії
  const validateExpiryDate = (expiryDate: string): boolean => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!expiryRegex.test(expiryDate)) return false
    
    const [month, year] = expiryDate.split('/')
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    
    if (yearNum < currentYear) return false
    if (yearNum === currentYear && monthNum < currentMonth) return false
    
    return true
  }

  // Валідація CVV
  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.address.trim()) {
      newErrors.address = 'Введіть адресу доставки'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введіть номер телефону'
    } else if (!validateUkrainianPhone(formData.phone)) {
      newErrors.phone = 'Введіть коректний український номер телефону (наприклад: +380501234567)'
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Введіть номер картки'
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Введіть коректний номер картки (13-19 цифр)'
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Введіть термін дії'
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Введіть коректний термін дії (ММ/РР)'
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'Введіть CVV код'
    } else if (!validateCVV(formData.cvv)) {
      newErrors.cvv = 'Введіть коректний CVV код (3-4 цифри)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Очищення помилки при зміні поля (крім deliveryType)
    if (field !== 'deliveryType' && errors[field as keyof Omit<FormErrors, 'deliveryType'>]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Форматування номера картки з пробілами
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\s/g, '')
    const chunks = cleanValue.match(/.{1,4}/g) || []
    return chunks.join(' ').substr(0, 19)
  }

  // Форматування номера телефону
  const formatPhoneNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    let formattedValue = ''

    if (cleanValue.startsWith('380')) {
      formattedValue = '+380'
      if (cleanValue.length > 3) formattedValue += ` (${cleanValue.slice(3, 5)}`
      if (cleanValue.length > 5) formattedValue += `) ${cleanValue.slice(5, 8)}`
      if (cleanValue.length > 8) formattedValue += `-${cleanValue.slice(8, 10)}`
      if (cleanValue.length > 10) formattedValue += `-${cleanValue.slice(10, 12)}`
    } else if (cleanValue.startsWith('0')) {
      formattedValue = '0'
      if (cleanValue.length > 1) formattedValue += ` (${cleanValue.slice(1, 3)}`
      if (cleanValue.length > 3) formattedValue += `) ${cleanValue.slice(3, 6)}`
      if (cleanValue.length > 6) formattedValue += `-${cleanValue.slice(6, 8)}`
      if (cleanValue.length > 8) formattedValue += `-${cleanValue.slice(8, 10)}`
    } else {
      // Для інших форматів додаємо +380 якщо довжина достатня
      if (cleanValue.length >= 9) {
        formattedValue = '+380'
        if (cleanValue.length >= 2) formattedValue += ` (${cleanValue.slice(-9, -7)}`
        if (cleanValue.length >= 4) formattedValue += `) ${cleanValue.slice(-7, -4)}`
        if (cleanValue.length >= 6) formattedValue += `-${cleanValue.slice(-4, -2)}`
        if (cleanValue.length >= 8) formattedValue += `-${cleanValue.slice(-2)}`
      } else {
        formattedValue = cleanValue
      }
    }

    return formattedValue
  }

  // Форматування терміну дії
  const formatExpiryDate = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4)
    }
    return cleanValue
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!user || !token) {
      alert('Будь ласка, увійдіть в систему для оформлення замовлення')
      navigate('/login')
      return
    }

    if (items.length === 0) {
      alert('Кошик порожній')
      return
    }

    setIsSubmitting(true)
    
    try {
      const total = calculateTotal()
      const orderData = {
        deliveryType: formData.deliveryType,
        address: formData.address,
        phone: formData.phone,
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create order')
      }

      // Очищення кошика після успішного замовлення
      clearCart()
      
      // Перенаправлення на сторінку замовлень
      alert(`Замовлення ${data.order.orderNumber} успішно створено!`)
      navigate('/orders')
      
    } catch (error) {
      console.error('Помилка оформлення замовлення:', error)
      alert(error instanceof Error ? error.message : 'Помилка при оформленні замовлення')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформлення Замовлення</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Інформація про Доставку</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип Доставки
                </label>
                <select 
                  value={formData.deliveryType}
                  onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Доставка Додому</option>
                  <option>Самовивіз</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адреса Доставки
                </label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Введіть вашу повну адресу"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер Телефону
                </label>
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    handleInputChange('phone', formatted)
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+380 (50) 123-45-67"
                  maxLength={19}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Формати: +380501234567, 0501234567, або вводьте цифри
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Інформація про Оплату</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер Картки
                </label>
                <input 
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value)
                    handleInputChange('cardNumber', formatted)
                  }}
                  maxLength={19}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Термін Дії
                  </label>
                  <input 
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value)
                      handleInputChange('expiryDate', formatted)
                    }}
                    maxLength={5}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ММ/РР"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input 
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      handleInputChange('cvv', value)
                    }}
                    maxLength={4}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Підсумок Замовлення</h2>
          
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Кошик порожній</p>
              <button 
                type="button"
                onClick={() => navigate('/products')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Перейти до товарів
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                    </div>
                    <span>{Math.round(item.price * item.quantity * 39)}₴</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Вартість товарів</span>
                  <span>{Math.round(items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 39)}₴</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-lg font-semibold mb-6">
                <span>Разом</span>
                <span>{Math.round(calculateTotal() * 39)}₴</span>
              </div>
            </>
          )}
          
          <button 
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-semibold ${
              isSubmitting || items.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Оформлення...' : 'Оформити Замовлення'}
          </button>
        </div>
      </div>
    </form>
  )
}
