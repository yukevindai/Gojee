import { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mock data for the itinerary
  const mockItinerary = {
    'dine out then something fun': [
      {
        step: 1,
        title: 'Dinner at The Garden Terrace',
        description: 'Upscale Mediterranean restaurant with rooftop seating',
        time: '7:00 PM - 8:30 PM',
        location: '123 Harbor Street, Downtown',
        highlights: ['Chef\'s tasting menu', 'Wine pairing available', 'City skyline views'],
        icon: '🍽️',
        category: 'Dining'
      },
      {
        step: 2,
        title: 'Jazz Night at Blue Note Lounge',
        description: 'Live jazz performance in an intimate setting',
        time: '9:00 PM - 11:00 PM',
        location: '456 Music Avenue, Arts District',
        highlights: ['Featured artist: Sarah Morrison Quartet', 'Craft cocktails', 'Reservations recommended'],
        icon: '🎷',
        category: 'Entertainment'
      }
    ],
    'relax and unwind': [
      {
        step: 1,
        title: 'Spa Treatment at Serenity Haven',
        description: 'Premium massage and aromatherapy session',
        time: '2:00 PM - 3:30 PM',
        location: '789 Wellness Boulevard',
        highlights: ['Deep tissue massage', 'Essential oils therapy', 'Complimentary tea service'],
        icon: '💆',
        category: 'Wellness'
      },
      {
        step: 2,
        title: 'Sunset at Coastal Park',
        description: 'Peaceful walk along the waterfront trails',
        time: '6:00 PM - 7:30 PM',
        location: 'Ocean View Park, Coastal Drive',
        highlights: ['Scenic ocean views', 'Meditation spots', 'Wildlife watching'],
        icon: '🌅',
        category: 'Nature'
      }
    ]
  }

  const handlePlan = () => {
    setLoading(true)
    setTimeout(() => {
      const key = Object.keys(mockItinerary).find(k =>
        input.toLowerCase().includes(k) || k.includes(input.toLowerCase())
      )
      setItinerary(key ? mockItinerary[key] : mockItinerary['dine out then something fun'])
      setLoading(false)
    }, 1200)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handlePlan()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-lg rounded-full mb-4 sm:mb-6 border border-white/20">
            <span className="text-3xl sm:text-4xl">✨</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Post-Exam Planner
          </h1>
          <p className="text-lg sm:text-xl text-white/80 font-light">
            Your personal concierge for the perfect celebration
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 border border-white/20">
          <label className="block text-gray-700 text-sm font-semibold mb-3 uppercase tracking-wide">
            What would you like to do?
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Dine out then something fun"
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all text-base sm:text-lg font-medium placeholder-gray-400"
            />
            <button
              onClick={handlePlan}
              disabled={!input.trim() || loading}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Planning...
                </span>
              ) : (
                'Plan My Day'
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Try:</span>
            {['Dine out then something fun', 'Relax and unwind'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs sm:text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Itinerary Display */}
        {itinerary && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Premium Itinerary</h2>
              <p className="text-white/70 text-sm sm:text-base">Curated just for you</p>
            </div>

            {itinerary.map((item, index) => (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform hover:scale-102 transition-all duration-300"
              >
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start gap-4 sm:gap-6">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                        {item.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                            {item.category}
                          </span>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                            <span className="text-2xl sm:text-3xl">{item.icon}</span>
                            {item.title}
                          </h3>
                          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 font-medium">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Time and Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-sm sm:text-base">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-700">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-sm sm:text-base">{item.location}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wide">
                          Highlights
                        </h4>
                        <ul className="space-y-1.5 sm:space-y-2">
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 sm:gap-3 text-gray-700">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm sm:text-base">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer Action */}
            <div className="text-center pt-4 sm:pt-6">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-lg text-white rounded-xl sm:rounded-2xl font-semibold border-2 border-white/30 hover:bg-white/30 transition-all text-sm sm:text-base">
                Share This Itinerary
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!itinerary && !loading && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 opacity-50">🎉</div>
            <p className="text-lg sm:text-xl text-white/60 font-light">
              Enter your plans above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
