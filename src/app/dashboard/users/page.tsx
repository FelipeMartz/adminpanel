'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Loader2, 
  UserX, 
  UserCheck, 
  Calendar, 
  Hash, 
  Activity,
  Key
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
      setError(err.response?.data?.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanUser = async (username: string) => {
    const reason = prompt(`Ban reason for ${username}?`, "Banned from admin panel");
    if (reason === null) return;

    try {
      const response = await axios.post('/api/admin/ban', { username, reason });
      if (response.data.success) {
        setStatus(`User ${username} banned`);
        fetchUsers();
      }
    } catch (err: any) {
      setError('Error banning user');
    }
  };

  const handleBanIp = async (ip: string) => {
    if (!ip || ip === 'N/A') return alert('This user has no registered IP');
    
    const reason = prompt(`Ban reason for IP ${ip}?`, "Violation of terms");
    if (reason === null) return;

    try {
      const response = await axios.post('/api/admin/ban-ip', { ip, action: 'ban', reason });
      if (response.data.success) {
        setStatus(`IP ${ip} banned successfully`);
      }
    } catch (err: any) {
      setError('Error banning IP');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastip?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-zinc-400 mt-1">Manage all users registered in your application.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500"
          title="Refresh list"
        >
          <Activity size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search by name or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
              Total: <span className="text-white font-bold">{users.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-900 bg-zinc-950">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">IP</th>
                <th className="px-6 py-4 font-medium">Expiry</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.username} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.username}</p>
                          <p className="text-[10px] text-zinc-500">ID: {user.id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold w-fit",
                          user.banned ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                        )}>
                          {user.banned ? 'BANNED' : 'ACTIVE'}
                        </span>
                        {user.online && (
                          <div className="flex items-center gap-1.5 ml-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-green-500 font-medium">Online</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      {user.lastip || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {user.expiry ? new Date(user.expiry * 1000).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleBanIp(user.lastip)}
                          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-all"
                          title="Ban IP"
                        >
                          <ShieldAlert size={16} />
                        </button>
                        <button 
                          onClick={() => handleBanUser(user.username)}
                          disabled={user.banned}
                          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-all disabled:opacity-20"
                          title="Ban User"
                        >
                          <UserX size={16} />
                        </button>
                        <button 
                          className="p-2 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-500 rounded-lg transition-all"
                          title="Reset HWID"
                        >
                          <Key size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(error || status) && (
        <div className={cn(
          "fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-8 duration-500",
          error ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
        )}>
          {error || status}
        </div>
      )}
    </div>
  );
}
