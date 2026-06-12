import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, ChevronDown, ChevronRight, Search } from 'lucide-react';

const CampaignHistory = () => {
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/logs');
        setLogs(res.data.logs || []);
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch campaign history', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, []);

  const badgeColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Delivered: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Clicked: 'bg-blue-100 text-blue-800'
  };

  const toggleExpand = (id) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group logs by campaign_id (fallback to message for old data)
  const groupedLogs = logs.reduce((acc, log) => {
    const campaignId = log.campaign_id || log.message;
    if (!acc[campaignId]) {
      acc[campaignId] = {
        id: campaignId,
        messageA: '',
        messageB: '',
        prompt: log.prompt,
        channel: log.channel || 'Email',
        firstSent: log.createdAt, 
        logs: [],
        revenue: 0,
        revenueA: 0,
        revenueB: 0,
        clicksA: 0,
        clicksB: 0,
        sentA: 0,
        sentB: 0
      };
      if (!log.variant) acc[campaignId].messageA = log.message; // old data
    }
    acc[campaignId].logs.push(log);

    if (log.variant === 'A') {
      if (!acc[campaignId].messageA) acc[campaignId].messageA = log.message;
      acc[campaignId].sentA++;
      if (log.status === 'Clicked') acc[campaignId].clicksA++;
    } else if (log.variant === 'B') {
      if (!acc[campaignId].messageB) acc[campaignId].messageB = log.message;
      acc[campaignId].sentB++;
      if (log.status === 'Clicked') acc[campaignId].clicksB++;
    }

    return acc;
  }, {});

  // Attach Revenue from Orders
  orders.forEach(order => {
    if (order.campaign_id && groupedLogs[order.campaign_id]) {
      const camp = groupedLogs[order.campaign_id];
      camp.revenue += order.amount;

      // Find which variant drove the order
      const orderCustomerId = typeof order.customer_id === 'object' ? order.customer_id._id : order.customer_id;
      const log = camp.logs.find(l => (l.customer_id?._id || l.customer_id) === orderCustomerId);
      if (log) {
        if (log.variant === 'A') camp.revenueA += order.amount;
        if (log.variant === 'B') camp.revenueB += order.amount;
      }
    }
  });

  const campaigns = Object.values(groupedLogs).sort((a, b) => new Date(b.firstSent) - new Date(a.firstSent));

  const filteredCampaigns = campaigns.filter(campaign => {
    const searchLower = searchQuery.toLowerCase();
    const title = campaign.prompt || (campaign.messageB ? "A/B Test Campaign" : (campaign.messageA || "Campaign"));
    return title.toLowerCase().includes(searchLower) || 
           campaign.channel.toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 mt-8 overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-500" />
          <h2 className="text-xl font-semibold text-zinc-900">Campaign History</h2>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      {paginatedCampaigns.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">No campaigns found.</div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {paginatedCampaigns.map(campaign => (
            <div key={campaign.id} className="flex flex-col">
              <div 
                className="flex items-center justify-between p-4 hover:bg-zinc-50 cursor-pointer transition-colors"
                onClick={() => toggleExpand(campaign.id)}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="text-zinc-400">
                    {expandedCampaigns[campaign.id] ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900 truncate max-w-md">
                          {campaign.prompt || (campaign.messageB ? "A/B Test Campaign" : (campaign.messageA || "Campaign"))}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-sm">
                          {campaign.channel}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{new Date(campaign.firstSent).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {campaign.revenue > 0 && (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">
                          Revenue: ₹{campaign.revenue.toLocaleString()}
                        </span>
                      )}
                      <div className="text-sm text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full whitespace-nowrap">
                        {campaign.logs.length} recipient{campaign.logs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedCampaigns[campaign.id] && (
                <div className="bg-zinc-50 p-4 border-t border-zinc-100">
                  {campaign.messageB && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg border border-zinc-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Variant A</span>
                          <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{campaign.sentA} Sent</span>
                        </div>
                        <p className="text-sm text-zinc-700 mb-4">{campaign.messageA}</p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex flex-col"><span className="text-zinc-500 text-xs">Clicks</span><span className="font-medium">{campaign.clicksA}</span></div>
                          <div className="flex flex-col"><span className="text-zinc-500 text-xs">Revenue</span><span className="font-medium text-green-600">₹{campaign.revenueA}</span></div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-zinc-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Variant B</span>
                          <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{campaign.sentB} Sent</span>
                        </div>
                        <p className="text-sm text-zinc-700 mb-4">{campaign.messageB}</p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex flex-col"><span className="text-zinc-500 text-xs">Clicks</span><span className="font-medium">{campaign.clicksB}</span></div>
                          <div className="flex flex-col"><span className="text-zinc-500 text-xs">Revenue</span><span className="font-medium text-green-600">₹{campaign.revenueB}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200">
                          <th className="py-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sent To</th>
                          {campaign.messageB && <th className="py-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Variant</th>}
                          <th className="py-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                          <th className="py-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-sm">
                        {campaign.logs.map(log => (
                          <tr key={log._id} className="hover:bg-white transition-colors">
                            <td className="py-2 px-4 text-zinc-900 font-medium">
                              {log.customer_id ? log.customer_id.name : 'Unknown User'}
                              <span className="text-xs text-zinc-500 font-normal ml-2">{log.customer_id?.email}</span>
                            </td>
                            {campaign.messageB && (
                              <td className="py-2 px-4 text-zinc-500 font-medium">
                                {log.variant}
                              </td>
                            )}
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[log.status] || 'bg-gray-100 text-gray-800'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-zinc-500 text-xs whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50">
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-zinc-200 rounded text-sm font-medium text-zinc-600 disabled:opacity-50 hover:bg-zinc-100"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-zinc-200 rounded text-sm font-medium text-zinc-600 disabled:opacity-50 hover:bg-zinc-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
