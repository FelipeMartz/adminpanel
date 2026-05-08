'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Loader2, 
  Activity,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldBan
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (err: any) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);

    if (status || error) {
      const timer = setTimeout(() => { setStatus(''); setError(''); }, 3000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, [status, error]);

  const handleRename = async (originalUsername: string) => {
    const newName = prompt(`Enter new name for ${originalUsername}:`);
    if (!newName) return;

    try {
      const response = await axios.post('/api/admin/users/action', { 
        originalUsername, 
        action: 'rename', 
        value: newName 
      });
      if (response.data.success) {
        setStatus(`User ${originalUsername} renamed to ${newName}`);
        fetchUsers();
      }
    } catch (err: any) {
      setError('Error renaming user');
    }
  };

  const handleBan = async (ip: string) => {
    if (!ip || ip === 'Unknown') return alert('No IP address found for this user');
    if (!confirm(`Are you sure you want to ban IP: ${ip}?`)) return;

    try {
      const response = await axios.post('/api/admin/users/action', { 
        action: 'ban', 
        value: ip 
      });
      if (response.data.success) {
        setStatus(`IP ${ip} has been banned`);
        fetchUsers();
      }
    } catch (err: any) {
      setError('Error banning IP');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ip.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            Users Management
          </h1>
          <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              {users.filter(u => u.online).length} Active
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5 bg-zinc-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-900 bg-black/40">
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Username</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">IP Address</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Last Seen</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-xs italic">
                    Loading records...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.originalUsername} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          user.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-zinc-700"
                        )}></div>
                        <span className={cn(
                          "font-medium tracking-tight",
                          user.online ? "text-white" : "text-zinc-400"
                        )}>
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      {user.ip}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {user.lastSeen === 'N/A' ? 'Never' : new Date(user.lastSeen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleRename(user.originalUsername)}
                          className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded transition-all"
                          title="Rename User"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleBan(user.ip)}
                          className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded transition-all"
                          title="Ban IP"
                        >
                          <ShieldBan size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-xs">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(error || status) && (
        <div className={cn(
          "fixed bottom-6 right-6 px-4 py-2 rounded-lg text-xs font-bold border animate-in slide-in-from-bottom-4 duration-300",
          error ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/10 border-white/20 text-white"
        )}>
          {error || status}
        </div>
      )}
    </div>
  );
}
