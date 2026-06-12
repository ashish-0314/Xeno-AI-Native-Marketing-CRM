import React from 'react';

const CustomerTable = ({ customers }) => {
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-8 text-center text-zinc-500">
        No customers match the segment criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</th>
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-sm">
            {customers.map(c => (
              <tr key={c._id} className="hover:bg-zinc-50 transition-colors">
                <td className="py-3 px-6 text-zinc-900 font-medium">{c.name}</td>
                <td className="py-3 px-6 text-zinc-500">{c.email}</td>
                <td className="py-3 px-6 text-zinc-500">{c.phone || 'N/A'}</td>
                <td className="py-3 px-6 text-zinc-900">₹{c.total_spent?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
