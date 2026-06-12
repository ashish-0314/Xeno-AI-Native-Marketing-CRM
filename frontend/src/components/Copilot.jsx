import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const Copilot = ({ onSegmentResult }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [channel, setChannel] = useState('Email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/ai/segment', { prompt, channel });
      onSegmentResult({ ...res.data, prompt });
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert('AI Segment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">Campaign Copilot</h2>
          <p className="text-zinc-500 text-sm">Describe the audience you want to target and let AI draft your campaign message.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center bg-zinc-100 p-1 rounded-lg">
          {['Email', 'SMS', 'WhatsApp'].map(ch => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannel(ch)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${channel === ch ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          disabled={loading}
          className="w-full pl-5 pr-14 py-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 placeholder-zinc-400 text-lg transition-all"
          placeholder={`e.g. Find customers who spent over ₹1000... (AI will draft an ${channel})`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default Copilot;
