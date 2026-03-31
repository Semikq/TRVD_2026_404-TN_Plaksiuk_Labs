import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  weight: number
}

interface CartState {
  items: CartItem[]
  initializeCart: () => void
  addItem: (product: Omit<CartItem, 'id' | 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Очищення невалідних даних при завантаженні
      initializeCart: () => {
        const { items } = get()
        const validItems = items.filter(item => 
          item && 
          item.productId && 
          item.name && 
          item.price !== undefined && 
          item.quantity !== undefined && 
          item.weight !== undefined
        )
        
        if (validItems.length !== items.length) {
          set({ items: validItems })
        }
      },

      addItem: (product) => {
        const { items } = get()
        
        const existingItem = items.find(item => item.productId === product.productId)

        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === product.productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, id: Date.now().toString(), quantity: 1 }]
          })
        }
        
        toast.success('Added to cart!')
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId)
        })
        toast.success('Removed from cart')
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
