export default function ProductDetailPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-lg">Product Image</span>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Frozen Meal</h1>
            <p className="text-2xl font-semibold text-blue-600">$12.99</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              Delicious and nutritious frozen meal made with premium ingredients. 
              Ready in just minutes - perfect for busy lifestyles.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <ul className="space-y-1 text-gray-600">
              <li>Weight: 350g</li>
              <li>Cooking time: 4-5 minutes</li>
              <li>Serves: 1 person</li>
              <li>Storage: Keep frozen at -18°C</li>
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex-1">
              Add to Cart
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              ♡
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((review) => (
            <div key={review} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold">Customer {review}</p>
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                Great product! Really enjoyed the taste and quality. Would definitely order again.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
