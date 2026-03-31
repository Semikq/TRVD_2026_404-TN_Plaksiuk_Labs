import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

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
  orderItems: OrderItem[]
  address?: {
    street: string
    city: string
    zipCode: string
  }
  payment?: {
    status: string
    paymentMethod: string
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  PENDING: 'Очікує',
  CONFIRMED: 'Підтверджено',
  PREPARING: 'Готується',
  READY_FOR_PICKUP: 'Готове до видачі',
  OUT_FOR_DELIVERY: 'В дорозі',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Скасовано'
}

const deliveryTypeLabels = {
  DELIVERY: 'Доставка',
  PICKUP: 'Самовивіз'
}

export default function OrdersPage() {
  const { user, token } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) {
        setLoading(false)
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
        setError('Не вдалося завантажити замовлення')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, token])

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">
          <p>Будь ласка, увійдіть, щоб побачити свої замовлення</p>
          <Link 
            to="/login"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Увійти
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Мої Замовлення</h1>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Мої Замовлення</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>У вас ще немає замовлень</p>
          <Link 
            to="/products"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {Math.round(order.totalAmount * 39)}₴
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Тип доставки:</span> {deliveryTypeLabels[order.deliveryType as keyof typeof deliveryTypeLabels]}
                  </p>
                  {order.address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Адреса:</span> {order.address.street}, {order.address.city}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Товари:</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-3">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs';
                                placeholder.textContent = item.product.name.charAt(0).toUpperCase();
                                e.currentTarget.parentNode.replaceChild(placeholder, e.currentTarget);
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs font-medium">
                              {item.product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{item.product.name}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">{Math.round(item.price * item.quantity * 39)}₴</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
