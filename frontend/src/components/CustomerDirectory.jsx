import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerModal from './CustomerModal';

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/customers');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/customers/${id}`);
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete customer');
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-zinc-100 flex items-center gap-2">
        <Users className="w-5 h-5 text-zinc-500" />
        <h2 className="text-xl font-semibold text-zinc-900">Customer Directory</h2>
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
              {customers.map(c => (
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
                      onClick={() => handleDelete(c._id)}
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

      <CustomerModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCustomerAdded={fetchCustomers}
        editCustomer={editingCustomer}
      />
    </div>
  );
};

export default CustomerDirectory;
