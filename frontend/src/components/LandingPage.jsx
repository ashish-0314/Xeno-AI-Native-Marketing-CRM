import React from 'react';
import { Bot, SplitSquareHorizontal, BarChart3, ChevronRight, UserPlus, Sparkles, Send } from 'lucide-react';

const LandingPage = ({ onLaunch }) => {
  return (
    <div className="relative overflow-hidden flex flex-col items-center rounded-3xl pb-12">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Header/Hero Section */}
        <div className="text-center max-w-3xl mx-auto mt-16 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-zinc-200/80 shadow-sm backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-zinc-600 uppercase">Xeno OS 1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight mb-6 drop-shadow-sm">
            AI-Native <br className="hidden md:block"/> Marketing CRM
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Target your audience with natural language, generate beautiful A/B tests instantly, and track revenue automatically. The modern marketing operating system.
          </p>
          <button 
            onClick={onLaunch}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#007AFF] text-white rounded-2xl text-lg font-semibold hover:bg-blue-600 shadow-lg shadow-blue-500/30 border border-blue-400/50 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            Launch App <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Feature Grid (A, B, C) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-24">
          {/* Feature A */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mb-6 shadow-inner border border-white">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">AI Copilot Segmentation</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              Target your customers using simple natural language prompts instead of complex rules or SQL queries. "Find customers who spent over ₹500".
            </p>
          </div>

          {/* Feature B */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-6 shadow-inner border border-white">
              <SplitSquareHorizontal className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Automated A/B Testing</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              The AI automatically generates two perfectly tuned message variants for every campaign, allowing you to seamlessly test which copy performs better.
            </p>
          </div>

          {/* Feature C */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6 shadow-inner border border-white">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Omnichannel Revenue</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              Queue and deliver messages across Email and SMS effortlessly while automatically tracking delivery status and attributing real revenue to each campaign.
            </p>
          </div>
        </div>

        {/* How to Use Section (macOS Window Style) */}
        <div className="w-full max-w-4xl mx-auto bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden mb-20">
          <div className="flex items-center pt-5 pb-3 px-6 relative border-b border-zinc-200/50 bg-white/40">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-zinc-800 tracking-wide">How to Use.app</h2>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
              
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2 block">Step 1</span>
                  <h4 className="text-lg font-bold text-zinc-900 mb-2">Build Your Directory</h4>
                  <p className="text-zinc-600 text-sm leading-relaxed">Add your customers via the Customer Directory tab. The CRM tracks their contact info and total spend history automatically.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2 block">Step 2</span>
                  <h4 className="text-lg font-bold text-zinc-900 mb-2">Ask the Copilot</h4>
                  <p className="text-zinc-600 text-sm leading-relaxed">Navigate to Campaigns and tell the AI Copilot exactly who you want to target. It will find the users and draft two message variants.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Send className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-zinc-100">
                  <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2 block">Step 3</span>
                  <h4 className="text-lg font-bold text-zinc-900 mb-2">Launch & Track</h4>
                  <p className="text-zinc-600 text-sm leading-relaxed">Review the drafted messages, pick a channel, and hit send! Watch your Campaign History update with real-time delivery and revenue data.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
