import { TrendingUp, TrendingDown, CreditCard, Clock, ArrowUp, ArrowDown } from "lucide-react";

export default function MonitorYourCredit() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute top-8 right-[15%] text-yellow-400 text-4xl animate-pulse">★</div>
      <div className="absolute top-20 right-[8%] text-yellow-300 text-2xl animate-pulse delay-300">★</div>
      <div className="absolute bottom-16 right-[5%] text-yellow-400 text-3xl animate-pulse delay-500">★</div>
      <div className="absolute bottom-32 left-[8%] text-yellow-300 text-2xl animate-pulse delay-700">★</div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left side - Text content */}
          <div className="lg:w-2/5">
            {/* Orange accent bar */}
            <div className="w-12 h-1 bg-orange-500 mb-6"></div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Monitor Your Credit
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Get access to your credit reports<sup>3</sup> and credit scores from all 3 bureaus.
            </p>
            
            {/* Bureau logos */}
            <div className="flex items-center gap-8 flex-wrap">
              {/* TransUnion */}
              <div className="flex items-center gap-1">
                <span className="text-cyan-500 font-bold text-xl">Trans</span>
                <span className="text-blue-600 font-bold text-xl">Union</span>
                <span className="text-red-500 text-xs align-super">®</span>
              </div>
              
              {/* Equifax */}
              <div className="flex items-center">
                <span className="text-red-600 font-bold text-xl tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  EQUIFAX
                </span>
                <span className="text-blue-600 text-xs align-super">®</span>
              </div>
              
              {/* Experian */}
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✦</span>
                </div>
                <span className="text-blue-800 font-bold text-xl">experian</span>
                <span className="text-blue-600 text-xs align-super">®</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Credit score visualization */}
          <div className="lg:w-3/5 relative">
            <div className="relative flex items-center justify-center">
              {/* Main credit score gauge */}
              <div className="relative">
                {/* SVG Gauge */}
                <svg width="320" height="200" viewBox="0 0 320 200" className="drop-shadow-lg">
                  {/* Background arc */}
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="25%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="75%" stopColor="#84cc16" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  
                  {/* Gauge background track */}
                  <path
                    d="M 40 180 A 120 120 0 0 1 280 180"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  
                  {/* Colored gauge segments */}
                  {/* Red segment */}
                  <path
                    d="M 40 180 A 120 120 0 0 1 80 100"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* Orange segment */}
                  <path
                    d="M 80 100 A 120 120 0 0 1 130 65"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="20"
                  />
                  {/* Yellow segment */}
                  <path
                    d="M 130 65 A 120 120 0 0 1 190 65"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="20"
                  />
                  {/* Light green segment */}
                  <path
                    d="M 190 65 A 120 120 0 0 1 240 100"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="20"
                  />
                  {/* Green segment */}
                  <path
                    d="M 240 100 A 120 120 0 0 1 280 180"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  
                  {/* Indicator dot - positioned at 750 score (excellent range) */}
                  <circle cx="250" cy="115" r="8" fill="white" stroke="#22c55e" strokeWidth="3" />
                </svg>
                
                {/* Score display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <span className="text-xs text-gray-400 mb-1">Sample Score</span>
                  <div className="flex items-baseline">
                    <span className="text-7xl font-bold text-gray-900">750</span>
                    <div className="flex items-center ml-2 text-green-500">
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-lg font-semibold">20</span>
                    </div>
                  </div>
                  <span className="text-gray-600 mt-1">Your Credit Rating</span>
                  <span className="text-2xl font-bold text-green-500 mt-2">EXCELLENT</span>
                </div>
              </div>
              
              {/* Floating stat cards */}
              {/* Credit Score card - top right */}
              <div className="absolute -top-4 right-0 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-500">Credit Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">750</span>
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
              
              {/* Credit Usage card - middle right */}
              <div className="absolute top-24 -right-8 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-500">Credit Usage</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">31%</span>
                    <ArrowDown className="w-4 h-4 text-cyan-500" />
                  </div>
                </div>
              </div>
              
              {/* Payment History card - bottom right */}
              <div className="absolute bottom-0 right-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment History</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
