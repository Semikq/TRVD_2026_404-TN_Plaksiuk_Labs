import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Truck, Clock, Shield } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  weight: number
  imageUrl?: string
  isAvailable: boolean
  category: {
    id: string
    name: string
  }
}

export default function HomePage() {
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Завантаження товарів
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (productId: string, name: string, price: number, weight: number) => {
    if (!user) {
      navigate('/register')
      return
    }

    addItem({
      productId,
      name,
      price,
      weight
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Преміальні Заморожені Продукти
              <span className="block text-blue-200">Доставлені Свіжими</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Відкрийте наш вибір якісних заморожених страв, доставлених прямо до ваших дверей
            </p>
            <div className="space-x-4">
              <Link
                to="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Купити зараз
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                Почати
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-16" style={{margin: "30px 30px"}}>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Чому обирають FrostiFood?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❄️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Свіжозаморожені</h3>
            <p className="text-gray-600">
              Наша технологія швидкого заморожування зберігає поживні речовини та смак для максимальної свіжості.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Швидка доставка</h3>
            <p className="text-gray-600">
              Доставка того ж дня доступна для замовлень, розміщених до 14:00.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Приготовано шеф-кухарями</h3>
            <p className="text-gray-600">
              Всі страви приготовані професійними кухарями з якісних інгредієнтів.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Популярні Продукти
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
            Оберіть з нашого асортименту якісних заморожених продуктів
          </p>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-center p-4"><span class="text-sm">${product.name}</span></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-center p-4">
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-blue-600">{Math.round(product.price * 39)}₴</span>
                      <span className="text-sm text-gray-500">{product.weight}г</span>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product.id, product.name, product.price, product.weight)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Додати до кошика
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingCart className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Товари не знайдено</h3>
              <p className="text-gray-600 mb-4">
                Наразі немає доступних товарів
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="text-center mt-12">
              <Link 
                to="/products"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Переглянути всі товари
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-blue-600 rounded-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">
          Готові спробувати FrostiFood?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Приєднуйтесь до тисяч задоволених клієнтів, які насолоджуються якісними замороженими стравами.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
          Почати сьогодні
        </button>
      </section>
    </div>
  )
}
