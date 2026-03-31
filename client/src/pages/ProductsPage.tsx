import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Filter } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

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

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const navigate = useNavigate()

  const ITEMS_PER_PAGE = 6 // 3 картки в рядку × 2 рядки

  // Завантаження товарів та категорій
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/categories')
        ])

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json()
        ])

        setProducts(productsData.products || [])
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Не вдалося завантажити товари')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  // Фільтрація продуктів
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Пагінація
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

  // Скинути сторінку при зміні фільтрів
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Наші Продукти</h1>
        <p className="text-lg text-gray-600">Відкрийте наш преміальний вибір заморожених продуктів</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Пошук продуктів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Всі категорії</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Помилка завантаження</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Спробувати знову
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-center p-4"><span class="text-sm font-medium">${product.name}</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-center p-4">
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {product.category.name}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{Math.round(product.price * 39)}₴</span>
                    <button 
                      onClick={() => handleAddToCart(product.id, product.name, product.price, product.weight)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Додати
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Продукти не знайдено</h3>
              <p className="text-gray-600 mb-4">
                Спробуйте змінити параметри пошуку або фільтрів
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Скинути фільтри
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredProducts.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            {/* Попередня кнопка */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Попередня
            </button>

            {/* Номери сторінок */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1
              
              // Показувати тільки певні номери сторінок
              if (
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              }
              
              // Показувати "..." для пропущених сторінок
              if (
                (pageNumber === currentPage - 2 && currentPage > 3) ||
                (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={pageNumber} className="px-2 text-gray-400">
                    ...
                  </span>
                )
              }
              
              return null
            })}

            {/* Наступна кнопка */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Наступна
            </button>
          </div>

          {/* Інформація про поточну сторінку */}
          <div className="mt-4 text-sm text-gray-600">
            Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} з {filteredProducts.length} товарів
          </div>
        </div>
      )}
    </div>
  )
}
