import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, User, Phone, MapPin, Calendar } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  deliveryType: string
  createdAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  address?: {
    id: string
    street: string
    city: string
    zipCode: string
  }
  orderItems: OrderItem[]
  payment: {
    id: string
    amount: number
    status: string
    paymentMethod: string
  }
}

export default function AdminDashboard() {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  // Перевірка доступу адміністратора
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }
  }, [user, navigate])

  // Завантаження замовлень
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return

      try {
        const response = await fetch('http://localhost:5000/api/admin/orders', {
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
        setError('Не вдалося завантажити замовлення')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [token])

  // Оновлення статусу замовлення
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!token) return

    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const data = await response.json()
      
      // Оновлюємо замовлення в списку
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? data.order : order
        )
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Помилка при оновленні статусу замовлення')
    } finally {
      setUpdatingOrder(null)
    }
  }

  // Мапа статусів для відображення
  const statusLabels = {
    'PENDING': 'Очікує',
    'CONFIRMED': 'Підтверджено',
    'PREPARING': 'Готується',
    'READY_FOR_PICKUP': 'Готово до видачі',
    'OUT_FOR_DELIVERY': 'В дорозі',
    'DELIVERED': 'Доставлено',
    'CANCELLED': 'Скасовано'
  }

  const statusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-purple-100 text-purple-800',
    'READY_FOR_PICKUP': 'bg-orange-100 text-orange-800',
    'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="w-8 h-8 mr-3 text-blue-600" />
          Панель Адміністратора
        </h1>
        <p className="text-gray-600 mt-2">Управління замовленнями користувачів</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Очікують</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Підтверджено</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Доставлено</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(order => order.status === 'DELIVERED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Всього</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Список замовлень */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Замовлення</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Замовлень поки немає</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Інформація про замовлення */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </span>
                    </div>

                    {/* Інформація про клієнта */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4 mr-2" />
                          <span>{order.user.firstName} {order.user.lastName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="w-4 h-4 mr-2">@</span>
                          <span>{order.user.email}</span>
                        </div>
                        {order.user.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{order.user.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {order.address && (
                        <div>
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                            <div>
                              <p>{order.address.street}</p>
                              <p>{order.address.city}, {order.address.zipCode}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Товари */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Товари:</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              {item.product.imageUrl ? (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs font-medium">
                                  {item.product.name.charAt(0).toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs font-medium">
                                  {item.product.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="ml-3">{item.product.name}</span>
                              <span className="ml-2 text-gray-500">x{item.quantity}</span>
                            </div>
                            <span className="font-medium">{Math.round(item.price * item.quantity * 39)}₴</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between font-semibold">
                          <span>Загальна сума:</span>
                          <span>{Math.round(order.totalAmount * 39)}₴</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Дії */}
                  <div className="lg:ml-6 mt-4 lg:mt-0">
                    <div className="flex flex-col space-y-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            disabled={updatingOrder === order.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            {updatingOrder === order.id ? 'Оновлення...' : 'Підтвердити'}
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            disabled={updatingOrder === order.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            {updatingOrder === order.id ? 'Оновлення...' : 'Відхилити'}
                          </button>
                        </>
                      )}
                      
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          disabled={updatingOrder === order.id}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                        >
                          {updatingOrder === order.id ? 'Оновлення...' : 'Почати готування'}
                        </button>
                      )}
                      
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, order.deliveryType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP')}
                          disabled={updatingOrder === order.id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          {updatingOrder === order.id ? 'Оновлення...' : 
                           order.deliveryType === 'DELIVERY' ? 'Відправити' : 'Готово до видачі'}
                        </button>
                      )}
                      
                      {(order.status === 'READY_FOR_PICKUP' || order.status === 'OUT_FOR_DELIVERY') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          disabled={updatingOrder === order.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {updatingOrder === order.id ? 'Оновлення...' : 'Доставлено'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
