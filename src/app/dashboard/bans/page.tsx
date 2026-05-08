'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Search, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BansPage() {
  const [bans, setBans] = useState<{ ip: string; reason: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBans = async () => {
    try {
      const res = await fetch('/api/admin/ban-ip');
      const data = await res.json();
      setBans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBans();
  }, []);

  const handleUnban = async (ip: string) => {
    if (!confirm(`Are you sure you want to unban IP ${ip}?`)) return;

    try {
      const res = await fetch('/api/admin/ban-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, action: 'unban' })
      });

      if (res.ok) {
        setBans(bans.filter(b => b.ip !== ip));
      }
    } catch (e) {
      alert('Error unbanning IP');
    }
  };

  const filteredBans = bans.filter(b => 
    (b.ip?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IP Ban Management</h1>
        <p className="text-zinc-400 mt-1">Manage blocked IP addresses and their reasons.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search by IP or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>
          <div className="text-sm text-zinc-500">
            Total: <span className="text-white font-bold">{bans.length}</span> active bans
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-900 bg-zinc-950">
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Ban Reason</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">Loading data...</td>
                </tr>
              ) : filteredBans.length > 0 ? (
                filteredBans.map((ban) => (
                  <tr key={ban.ip} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="font-mono font-medium">{ban.ip}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                        <Info size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300 italic">"{ban.reason}"</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(ban.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleUnban(ban.ip)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-white hover:text-black rounded-lg transition-all text-xs font-bold"
                      >
                        <Trash2 size={14} />
                        UNBAN
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    {searchTerm ? 'No results found for your search.' : 'No IPs currently banned.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
