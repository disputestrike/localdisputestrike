import { TrendingUp, Shield, CheckCircle, BarChart3, Lock, Eye, Sparkles, ArrowUpRight } from "lucide-react";

export default function MonitorYourCredit() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1a]">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a1628]"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)"/%3E%3C/svg%3E")' }}></div>
      </div>
      
      <div className="relative z-10 py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-orange-500/20 rounded-full px-5 py-2.5 shadow-lg shadow-orange-500/5">
                <div className="relative">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <div className="absolute inset-0 animate-ping">
                    <Eye className="w-4 h-4 text-orange-400 opacity-50" />
                  </div>
                </div>
                <span className="text-orange-300 text-sm font-semibold tracking-wide">Real-Time Monitoring</span>
              </div>
              
              {/* Main Headline - Fortune 100 Typography */}
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  <span className="text-white">Monitor Your</span>
                  <br />
                  <span className="relative">
                    <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                      Credit Score
                    </span>
                    {/* Underline accent */}
                    <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none">
                      <path d="M2 10C50 2 100 2 150 6C200 10 250 6 298 2" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                          <stop offset="50%" stopColor="#fbbf24" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.8"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h2>
              </div>
              
              {/* Subheadline */}
              <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                Access comprehensive credit reports and scores from all three major bureaus. 
                Track changes, identify errors, and take control of your financial future.
              </p>
              
              {/* Credit Bureau Logos - Premium Glass Cards */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* TransUnion */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-500 cursor-pointer">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-1">
                    <span className="text-cyan-400 font-bold text-lg tracking-tight">Trans</span>
                    <span className="text-blue-400 font-bold text-lg tracking-tight">Union</span>
                    <span className="text-cyan-400 text-[10px] font-bold align-super ml-0.5">®</span>
                  </div>
                </div>
                
                {/* Equifax */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/[0.08] hover:border-red-500/30 transition-all duration-500 cursor-pointer">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center">
                    <span className="text-red-400 font-bold text-lg tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>EQUIFAX</span>
                    <span className="text-red-400 text-[10px] font-bold align-super ml-0.5">®</span>
                  </div>
                </div>
                
                {/* Experian */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/[0.08] hover:border-blue-500/30 transition-all duration-500 cursor-pointer">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-blue-400 font-bold text-lg">experian</span>
                    <span className="text-blue-400 text-[10px] font-bold align-super">®</span>
                  </div>
                </div>
              </div>
              
              {/* Feature Grid - Premium Design */}
              <div className="grid grid-cols-2 gap-5 pt-4">
                {[
                  { icon: CheckCircle, label: "Daily Updates", color: "emerald", desc: "Real-time sync" },
                  { icon: BarChart3, label: "Score History", color: "blue", desc: "Track progress" },
                  { icon: Shield, label: "Fraud Alerts", color: "purple", desc: "24/7 protection" },
                  { icon: Lock, label: "Bank-Level Security", color: "orange", desc: "256-bit SSL" },
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="group relative bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{feature.label}</span>
                        <span className="text-gray-500 text-sm">{feature.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Photo-Realistic Hero Image */}
            <div className="relative lg:pl-8">
              {/* Glow effects behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-emerald-500/20 rounded-3xl blur-3xl opacity-60"></div>
              
              {/* Main Hero Image Container */}
              <div className="relative">
                {/* Photo-realistic image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                  <img 
                    src="/credit-monitoring-hero.webp" 
                    alt="Professional monitoring credit score on premium device" 
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/40 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating Score Card - Premium Glass Design */}
                <div className="absolute -bottom-6 -left-6 z-20">
                  <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/50">
                    {/* Subtle gradient glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                    
                    <div className="relative">
                      <span className="text-gray-400 text-xs uppercase tracking-widest font-medium">Sample Score</span>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">750</span>
                        <div className="flex items-center gap-1 text-emerald-400">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-lg font-bold">+20</span>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/15 rounded-full px-4 py-1.5 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                        <span className="text-emerald-400 font-bold text-sm tracking-wide">EXCELLENT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bureau Score Cards - Floating */}
                {/* TransUnion */}
                <div className="absolute -top-4 -right-4 z-20 animate-float">
                  <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/20 shadow-xl shadow-cyan-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <span className="text-white font-bold">TU</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">TransUnion</span>
                        <span className="text-white font-bold text-xl">748</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Equifax */}
                <div className="absolute top-1/3 -right-8 z-20 animate-float-delayed">
                  <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-red-500/20 shadow-xl shadow-red-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <span className="text-white font-bold">EQ</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Equifax</span>
                        <span className="text-white font-bold text-xl">752</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Experian */}
                <div className="absolute bottom-1/4 -right-6 z-20 animate-float-slow">
                  <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-blue-500/20 shadow-xl shadow-blue-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white font-bold">EX</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Experian</span>
                        <span className="text-white font-bold text-xl">750</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
          animation-delay: 3s;
        }
        
        /* Feature icon colors */
        .bg-emerald-500\\/10 { background-color: rgb(16 185 129 / 0.1); }
        .bg-blue-500\\/10 { background-color: rgb(59 130 246 / 0.1); }
        .bg-purple-500\\/10 { background-color: rgb(168 85 247 / 0.1); }
        .bg-orange-500\\/10 { background-color: rgb(249 115 22 / 0.1); }
        .text-emerald-400 { color: rgb(52 211 153); }
        .text-blue-400 { color: rgb(96 165 250); }
        .text-purple-400 { color: rgb(192 132 252); }
        .text-orange-400 { color: rgb(251 146 60); }
      `}</style>
    </section>
  );
}
