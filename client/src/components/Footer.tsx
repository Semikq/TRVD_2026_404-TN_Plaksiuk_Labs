export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">FrostiFood</span>
            </div>
            <p className="text-gray-300 mb-4">
              Ваш надійний партнер для доставки преміальних заморожених продуктів. Свіжі, зручні та смачні страви доставлені прямо до ваших дверей.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Швидкі Посилання</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Головна</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-white transition-colors">Продукти</a></li>
              <li><a href="/cart" className="text-gray-300 hover:text-white transition-colors">Кошик</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакти</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@frostifood.com</li>
              <li>Телефон: +380 (44) 123-45-67</li>
              <li>Підтримка: Доступна 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
