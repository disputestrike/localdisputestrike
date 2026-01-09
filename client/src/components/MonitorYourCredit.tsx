import { TrendingUp, Shield, CheckCircle, BarChart3, Lock, Eye } from "lucide-react";

export default function MonitorYourCredit() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left side - Text content */}
          <div className="lg:w-1/2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Eye className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Real-Time Monitoring</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Monitor Your
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Credit Score
              </span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Access comprehensive credit reports and scores from all three major bureaus. 
              Track changes, identify errors, and take control of your financial future.
            </p>
            
            {/* Bureau logos - Premium style */}
            <div className="flex items-center gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-cyan-400 font-bold text-lg">Trans</span>
                <span className="text-blue-400 font-bold text-lg">Union</span>
                <span className="text-red-400 text-xs align-super">®</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-red-400 font-bold text-lg tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  EQUIFAX
                </span>
                <span className="text-blue-400 text-xs align-super">®</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 hover:bg-white/15 transition-all flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✦</span>
                </div>
                <span className="text-blue-400 font-bold text-lg">experian</span>
                <span className="text-blue-400 text-xs align-super">®</span>
              </div>
            </div>
            
            {/* Feature list */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300">Daily Updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-300">Score History</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300">Fraud Alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-gray-300">Bank-Level Security</span>
              </div>
            </div>
          </div>
          
          {/* Right side - 3D Credit Score Visualization */}
          <div className="lg:w-1/2 relative">
            {/* Main 3D gauge image */}
            <div className="relative">
              {/* Glow effect behind the gauge */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-yellow-500/20 to-red-500/30 blur-3xl scale-110"></div>
              
              {/* 3D Credit Gauge */}
              <div className="relative z-10 flex justify-center">
                <img 
                  src="/credit-gauge-3d-icon.png" 
                  alt="3D Credit Score Gauge" 
                  className="w-80 h-80 object-contain drop-shadow-2xl"
                />
              </div>
              
              {/* Score overlay on the gauge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10 shadow-2xl">
                  <div className="text-center">
                    <span className="text-gray-400 text-sm uppercase tracking-wider">Sample Score</span>
                    <div className="flex items-baseline justify-center gap-2 mt-1">
                      <span className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">750</span>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-lg font-semibold">+20</span>
                      </div>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 bg-green-500/20 rounded-full px-4 py-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-semibold text-sm">EXCELLENT</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating stat cards */}
              {/* TransUnion card */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-cyan-500/30 shadow-xl shadow-cyan-500/10 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TU</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">TransUnion</span>
                    <div className="text-white font-bold text-xl">748</div>
                  </div>
                </div>
              </div>
              
              {/* Equifax card */}
              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-red-500/30 shadow-xl shadow-red-500/10 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">EQ</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Equifax</span>
                    <div className="text-white font-bold text-xl">752</div>
                  </div>
                </div>
              </div>
              
              {/* Experian card */}
              <div className="absolute -bottom-4 left-1/4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-blue-500/30 shadow-xl shadow-blue-500/10 animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">EX</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Experian</span>
                    <div className="text-white font-bold text-xl">750</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(4px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
