import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const CustomerModal = ({ isOpen, onClose, onCustomerAdded, editCustomer }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', total_spent: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editCustomer) {
      setFormData({
        name: editCustomer.name || '',
        email: editCustomer.email || '',
        phone: editCustomer.phone || '',
        total_spent: editCustomer.total_spent || ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '', total_spent: '' });
    }
  }, [editCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editCustomer) {
        await api.put(`/customers/${editCustomer._id}`, {
          ...formData,
          total_spent: Number(formData.total_spent) || 0
        });
        toast.success('Customer updated successfully!');
      } else {
        await api.post('/customers', {
          ...formData,
          total_spent: Number(formData.total_spent) || 0
        });
        toast.success('Customer added successfully!');
      }
      onCustomerAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 backdrop-blur-xsm">
      <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 w-full max-w-md p-0 relative overflow-hidden">
        {/* Title Bar Area */}
        <div className="flex items-center justify-center pt-5 pb-3 relative border-b border-zinc-200/50">
          <button
            onClick={onClose}
            className="absolute left-4 w-3.5 h-3.5 rounded-full bg-red-400 hover:bg-red-500 shadow-sm border border-red-500/20 transition-colors flex items-center justify-center group"
          >
            <X className="w-2.5 h-2.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-800 tracking-wide">{editCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 ml-1">Name</label>
            <input required type="text" className="w-full px-3 py-2 bg-white/60 border border-zinc-200/80 shadow-inner rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 ml-1">Email</label>
            <input required type="email" className="w-full px-3 py-2 bg-white/60 border border-zinc-200/80 shadow-inner rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 ml-1">Phone</label>
            <input type="text" className="w-full px-3 py-2 bg-white/60 border border-zinc-200/80 shadow-inner rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 ml-1">Total Spent</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
              <input type="number" className="w-full pl-7 pr-3 py-2 bg-white/60 border border-zinc-200/80 shadow-inner rounded-lg text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-400" value={formData.total_spent} onChange={e => setFormData({ ...formData, total_spent: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-zinc-700 bg-white/50 border border-zinc-200 hover:bg-white shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-6 py-1.5 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-70 shadow-sm border border-blue-600/50 transition-colors"
            >
              {loading ? 'Saving...' : (editCustomer ? 'Save' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
