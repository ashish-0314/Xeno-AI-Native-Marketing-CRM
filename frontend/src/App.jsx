import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Plus, Rocket, LayoutDashboard, Users, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

import DashboardStats from './components/DashboardStats';
import Copilot from './components/Copilot';
import CustomerTable from './components/CustomerTable';
import CustomerModal from './components/CustomerModal';
import CampaignHistory from './components/CampaignHistory';
import CustomerDirectory from './components/CustomerDirectory';
import LandingPage from './components/LandingPage';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isModalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [draftMessageA, setDraftMessageA] = useState('');
  const [draftMessageB, setDraftMessageB] = useState('');
  const [channel, setChannel] = useState('Email');
  const [sending, setSending] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [refreshDirectory, setRefreshDirectory] = useState(0);

  const [draftHistory, setDraftHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastPrompt, setLastPrompt] = useState('');
  const [rewritingA, setRewritingA] = useState(false);
  const [rewritingB, setRewritingB] = useState(false);

  const handleSegmentResult = (data) => {
    const newCustomers = data.customers || [];
    setCustomers(newCustomers);
    
    const extractText = (msg) => {
      if (!msg) return '';
      if (typeof msg === 'string') return msg;
      if (typeof msg === 'object') return msg.body || msg.text || msg.message || JSON.stringify(msg);
      return String(msg);
    };

    const newA = extractText(data.draft_message_A || data.draft_message);
    const newB = extractText(data.draft_message_B || data.draft_message);
    
    setDraftMessageA(newA);
    setDraftMessageB(newB);
    setChannel(data.channel || 'Email');
    if (data.prompt) setLastPrompt(data.prompt);
    setShowResults(true);

    const newHistory = draftHistory.slice(0, historyIndex + 1);
    newHistory.push({ a: newA, b: newB });
    setDraftHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.success(`Found ${newCustomers.length} matching customers`);
  };

  const extractText = (msg) => {
    if (!msg) return '';
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object') return msg.body || msg.text || msg.message || JSON.stringify(msg);
    return String(msg);
  };

  const handleRewriteSingle = async (variant) => {
    if (variant === 'A') setRewritingA(true); else setRewritingB(true);
    try {
      const res = await api.post('/ai/rewrite', { prompt: lastPrompt, channel });
      
      const newMsg = extractText(res.data.draft_message);
      
      const newA = variant === 'A' ? newMsg : draftMessageA;
      const newB = variant === 'B' ? newMsg : draftMessageB;
      
      setDraftMessageA(newA);
      setDraftMessageB(newB);
      
      const newHistory = draftHistory.slice(0, historyIndex + 1);
      newHistory.push({ a: newA, b: newB });
      setDraftHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      toast.success(`Generated new Variant ${variant}!`);
    } catch (err) {
      toast.error(`Failed to rewrite Variant ${variant}`);
    } finally {
      if (variant === 'A') setRewritingA(false); else setRewritingB(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDraftMessageA(draftHistory[newIndex].a);
      setDraftMessageB(draftHistory[newIndex].b);
    }
  };

  const handleRedo = () => {
    if (historyIndex < draftHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDraftMessageA(draftHistory[newIndex].a);
      setDraftMessageB(draftHistory[newIndex].b);
    }
  };

  const handleSendCampaign = async () => {
    if (customers.length === 0) return toast.error('No customers to send to');
    if (!draftMessageA.trim() || !draftMessageB.trim()) return toast.error('Both message variants must be filled');

    setSending(true);
    try {
      const customerIds = customers.map(c => c._id);
      await api.post('/campaign/send', {
        customerIds,
        messageA: draftMessageA,
        messageB: draftMessageB,
        channel,
        prompt: lastPrompt
      });
      toast.success('A/B Campaign launched successfully!');
      
      // Reset view
      setShowResults(false);
      setCustomers([]);
      setDraftMessageA('');
      setDraftMessageB('');
    } catch (err) {
      toast.error('Failed to launch campaign');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onCustomerAdded={() => {
          setRefreshDirectory(prev => prev + 1);
        }} 
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-3xl font-bold text-zinc-900 tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setActiveTab('landing')}
          >
            Xeno CRM
          </h1>
          <p className="text-zinc-500 mt-1">AI-Native Marketing Campaigns</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex border-b border-zinc-200 mb-8 gap-6">
        <button 
          onClick={() => setActiveTab('landing')}
          className={`pb-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'landing' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Home className="w-4 h-4" /> Home
        </button>
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'campaigns' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Campaigns
        </button>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`pb-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'customers' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          <Users className="w-4 h-4" /> Customer Directory
        </button>
      </div>

      {activeTab === 'landing' && (
        <div className="fade-in">
          <LandingPage onLaunch={() => setActiveTab('campaigns')} />
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="fade-in">
          <DashboardStats />
          <Copilot onSegmentResult={handleSegmentResult} />

          {showResults && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in mb-8">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  Target Audience <span className="bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full">{customers.length}</span>
                </h3>
                <CustomerTable customers={customers} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900">A/B Draft Messages</h3>
                  <div className="flex gap-2">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="text-xs px-2 py-1 bg-zinc-100 rounded text-zinc-600 hover:bg-zinc-200 disabled:opacity-30">Undo</button>
                    <button onClick={handleRedo} disabled={historyIndex >= draftHistory.length - 1} className="text-xs px-2 py-1 bg-zinc-100 rounded text-zinc-600 hover:bg-zinc-200 disabled:opacity-30">Redo</button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase">Variant A (Editable - 50%)</label>
                        <button 
                          onClick={() => handleRewriteSingle('A')} 
                          disabled={rewritingA || !lastPrompt}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {rewritingA ? 'Rewriting...' : '✨ Rewrite AI'}
                        </button>
                      </div>
                      <textarea 
                        className="w-full resize-none bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm h-48 lg:h-64 leading-relaxed"
                        value={draftMessageA}
                        onChange={(e) => {
                          setDraftMessageA(e.target.value);
                        }}
                        placeholder="Message Variant A..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-semibold text-zinc-500 uppercase">Variant B (Editable - 50%)</label>
                        <button 
                          onClick={() => handleRewriteSingle('B')} 
                          disabled={rewritingB || !lastPrompt}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50"
                        >
                          {rewritingB ? 'Rewriting...' : '✨ Rewrite AI'}
                        </button>
                      </div>
                      <textarea 
                        className="w-full resize-none bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm h-48 lg:h-64 leading-relaxed"
                        value={draftMessageB}
                        onChange={(e) => setDraftMessageB(e.target.value)}
                        placeholder="Message Variant B..."
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSendCampaign}
                    disabled={sending || customers.length === 0 || !String(draftMessageA).trim() || !String(draftMessageB).trim()}
                    className="w-full bg-indigo-600 text-white py-3 mt-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
                  >
                    {sending ? 'Sending...' : 'Launch A/B Campaign'} 
                    {!sending && <Rocket className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <CampaignHistory />
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="fade-in">
          <CustomerDirectory key={refreshDirectory} />
        </div>
      )}
    </div>
  );
}

export default App;
