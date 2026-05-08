'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck,
  Activity, 
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState({
    totalUsers: 0,
    activeBans: 0,
    onlineUsers: 0,
    onlineList: [] as any[],
    recentLogs: [] as any[],
    settings: { keyauth_enabled: true }
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const timestamp = new Date().getTime();
      const [usersRes, bansRes, logsRes, presenceRes, settingsRes] = await Promise.all([
        axios.get(`/api/admin/users?t=${timestamp}`).then(res => res.data).catch(() => ({ users: [] })),
        axios.get(`/api/admin/ban-ip?t=${timestamp}`).then(res => res.data).catch(() => []),
        axios.get(`/api/admin/logs?t=${timestamp}`).then(res => res.data).catch(() => []),
        axios.get(`/api/admin/presence?t=${timestamp}`).then(res => res.data).catch(() => ({})),
        axios.get(`/api/admin/settings?t=${timestamp}`).then(res => res.data).catch(() => ({ keyauth_enabled: true }))
      ]);

      const onlineList = Object.entries(presenceRes).map(([username, info]: [string, any]) => ({
        username,
        ...info
      }));

      setData({
        totalUsers: usersRes.users?.length || 0,
        activeBans: bansRes.length || 0,
        onlineUsers: onlineList.length,
        onlineList: onlineList,
        recentLogs: logsRes.slice(-5).reverse(),
        settings: settingsRes
      });
    } catch (e: any) {
      console.error('Error fetching dashboard stats:', e.message, e.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyAuth = async () => {
    const newValue = !data.settings.keyauth_enabled;
    try {
      await axios.post('/api/admin/settings', { ...data.settings, keyauth_enabled: newValue });
      setData(prev => ({
        ...prev,
        settings: { ...prev.settings, keyauth_enabled: newValue }
      }));
    } catch (e) {
      alert('Error saving settings');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { name: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-blue-500' },
    { name: 'Active IP Bans', value: data.activeBans, icon: ShieldAlert, color: 'text-red-500' },
    { name: 'Users Online', value: data.onlineUsers, icon: Activity, color: 'text-green-500' },
    { name: 'KeyAuth Login', value: data.settings.keyauth_enabled ? 'Enabled' : 'Disabled', icon: ShieldCheck, color: data.settings.keyauth_enabled ? 'text-green-500' : 'text-zinc-500', isSwitch: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
        <p className="text-zinc-400 mt-1">Real-time overview of your application ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any) => (
          <div key={stat.name} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-zinc-900 rounded-lg">
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", stat.name === 'KeyAuth Login' && !data.settings.keyauth_enabled ? 'bg-red-500' : 'bg-green-500')}></div>
                {stat.name === 'KeyAuth Login' && !data.settings.keyauth_enabled ? 'Disabled' : 'Live'}
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading && data.totalUsers === 0 ? '...' : stat.value}
                </h3>
              </div>
              {stat.isSwitch && (
                <button
                  onClick={toggleKeyAuth}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    data.settings.keyauth_enabled ? "bg-blue-600" : "bg-zinc-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      data.settings.keyauth_enabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Connections */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Recent Connections
            </h3>
          </div>
          <div className="p-0 max-h-[400px] overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.recentLogs.length > 0 ? (
                  data.recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-400">{log.ip}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300">v{log.version_checked}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-right">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-12 text-center text-zinc-500" colSpan={3}>
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Online Users */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-green-500" />
              Online Users
            </h3>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">
              {data.onlineUsers} ACTIVE
            </span>
          </div>
          <div className="p-0 max-h-[400px] overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3 text-right">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.onlineList.length > 0 ? (
                  data.onlineList.map((user, i) => (
                    <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{user.username}</td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{user.ip}</td>
                      <td className="px-6 py-4 text-zinc-500 text-right">
                        {new Date(user.lastSeen).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-12 text-center text-zinc-500" colSpan={3}>
                      No users currently online.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
