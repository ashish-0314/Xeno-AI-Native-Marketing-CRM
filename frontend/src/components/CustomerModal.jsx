import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerModal = ({ isOpen, onClose, onCustomerAdded, editCustomer }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', total_spent: '' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
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
        await axios.put(`http://localhost:3000/api/customers/${editCustomer._id}`, {
          ...formData,
          total_spent: Number(formData.total_spent) || 0
        });
        toast.success('Customer updated successfully!');
      } else {
        await axios.post('http://localhost:3000/api/customers', {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-zinc-900 mb-6">{editCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
            <input required type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input required type="email" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label>
            <input type="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Total Spent</label>
            <input type="number" className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.total_spent} onChange={e => setFormData({ ...formData, total_spent: e.target.value })} />
          </div>
          <button disabled={loading} type="submit" className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors">
            {loading ? 'Saving...' : (editCustomer ? 'Save Changes' : 'Add Customer')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
