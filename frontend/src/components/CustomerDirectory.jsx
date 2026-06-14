import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Users, Loader2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerModal from './CustomerModal';
import api from '../api';

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const requestDelete = (id) => {
    setCustomerToDelete(id);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      await api.delete(`/customers/${customerToDelete}`);
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c._id !== customerToDelete));
    } catch (err) {
      toast.error('Failed to delete customer');
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-500" />
          <h2 className="text-xl font-semibold text-zinc-900">Customer Directory</h2>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full md:w-64 pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">No customers found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</th>
                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Spent</th>
                <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {paginatedCustomers.map(c => (
                <tr key={c._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-6 text-zinc-900 font-medium">{c.name}</td>
                  <td className="py-3 px-6 text-zinc-500">{c.email}</td>
                  <td className="py-3 px-6 text-zinc-500">{c.phone || 'N/A'}</td>
                  <td className="py-3 px-6 text-zinc-900">₹{c.total_spent?.toLocaleString() || 0}</td>
                  <td className="py-3 px-6 text-right">
                    <button 
                      onClick={() => handleEdit(c)}
                      className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => requestDelete(c._id)}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors ml-2"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-sm text-zinc-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCustomerAdded={fetchCustomers}
        editCustomer={editingCustomer}
      />

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm">
          <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 w-full max-w-sm p-0 relative overflow-hidden">
            {/* Title Bar Area */}
            <div className="flex items-center justify-center pt-5 pb-3 relative border-b border-zinc-200/50">
              <button 
                onClick={() => setCustomerToDelete(null)} 
                className="absolute left-4 w-3.5 h-3.5 rounded-full bg-red-400 hover:bg-red-500 shadow-sm border border-red-500/20 transition-colors flex items-center justify-center group"
              >
                <X className="w-2.5 h-2.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <h2 className="text-sm font-semibold text-zinc-800 tracking-wide">Confirm Delete</h2>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-zinc-600 mb-6 text-center">Are you sure you want to delete this customer? This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setCustomerToDelete(null)}
                  className="px-6 py-1.5 rounded-lg text-sm font-medium text-zinc-700 bg-white/50 border border-zinc-200 hover:bg-white shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-6 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 shadow-sm border border-red-600/50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDirectory;
