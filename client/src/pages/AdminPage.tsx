import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

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

interface ProductFormData {
  name: string
  description: string
  price: string
  weight: string
  categoryId: string
  imageUrl: string
}

export default function AdminPage() {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    weight: '',
    categoryId: '',
    imageUrl: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Перевірка доступу адміністратора
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }
  }, [user, navigate])

  // Завантаження товарів та категорій
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

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
        setError('Не вдалося завантажити дані')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Обробка форми
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Додавання товару
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const data = await response.json()
      setProducts(prev => [...prev, data.product])
      setShowAddForm(false)
      setFormData({
        name: '',
        description: '',
        price: '',
        weight: '',
        categoryId: '',
        imageUrl: ''
      })
      alert('Товар успішно додано!')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Помилка при додаванні товару')
    } finally {
      setSubmitting(false)
    }
  }

  // Редагування товару
  const handleEditProduct = async (productId: string) => {
    if (!token) return

    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const data = await response.json()
      setProducts(prev => prev.map(product => 
        product.id === productId ? data.product : product
      ))
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        weight: '',
        categoryId: '',
        imageUrl: ''
      })
      alert('Товар успішно оновлено!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Помилка при оновленні товару')
    } finally {
      setSubmitting(false)
    }
  }

  // Видалення товару
  const handleDeleteProduct = async (productId: string) => {
    if (!token) return
    
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts(prev => prev.filter(product => product.id !== productId))
      alert('Товар успішно видалено!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Помилка при видаленні товару')
    }
  }

  // Початок редагування
  const startEditing = (product: Product) => {
    setEditingProduct(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      weight: product.weight.toString(),
      categoryId: product.category.id,
      imageUrl: product.imageUrl || ''
    })
  }

  // Скасування редагування
  const cancelEditing = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      weight: '',
      categoryId: '',
      imageUrl: ''
    })
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Управління Товарами
            </h1>
            <p className="text-gray-600 mt-2">Додавайте, редагуйте та видаляйте товари</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Додати Товар</span>
          </button>
        </div>
      </div>

      {/* Форма додавання товару */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Додати Новий Товар</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ціна (грн)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Вага (г)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL зображення (необов'язково)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Додавання...' : 'Додати'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список товарів */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Зображення товару */}
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
              {editingProduct === product.id ? (
                /* Форма редагування */
                <form onSubmit={(e) => { e.preventDefault(); handleEditProduct(product.id); }} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="Ціна"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Вага"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Зберегти
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-300 text-gray-700 py-1 px-2 rounded text-sm hover:bg-gray-400 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Скасувати
                    </button>
                  </div>
                </form>
              ) : (
                /* Відображення товару */
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{product.price} грн</p>
                      <p className="text-sm text-gray-500">{product.weight}г</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Категорія:</p>
                      <p className="text-sm font-medium">{product.category.name}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Видалити
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Товарів поки немає</h3>
          <p className="text-gray-500 mb-4">Додайте перший товар, щоб почати</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Додати Товар
          </button>
        </div>
      )}
    </div>
  )
}
