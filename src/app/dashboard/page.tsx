'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
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
    recentLogs: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bansRes, logsRes, presenceRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/ban-ip'),
          fetch('/downloads/logs.json').then(res => res.json()).catch(() => []),
          fetch('/downloads/presence.json').then(res => res.json()).catch(() => ({}))
        ]);

        setData({
          totalUsers: usersRes.data.users?.length || 0,
          activeBans: bansRes.data.length || 0,
          onlineUsers: Object.keys(presenceRes).length || 0,
          recentLogs: logsRes.slice(-5).reverse()
        });
      } catch (e) {
        console.error('Error fetching dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { name: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-blue-500' },
    { name: 'Active IP Bans', value: data.activeBans, icon: ShieldAlert, color: 'text-red-500' },
    { name: 'Users Online', value: data.onlineUsers, icon: Activity, color: 'text-green-500' },
    { name: 'System Status', value: 'Live', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
        <p className="text-zinc-400 mt-1">Real-time overview of your application ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-zinc-900 rounded-lg">
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Live
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1">
                {loading ? '...' : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
            <h3 className="font-bold">Recent Connections</h3>
            <Clock size={16} className="text-zinc-500" />
          </div>
          <div className="p-0">
            <table className="w-full text-left text-xs">
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

        <div className="glass-card p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-center items-center text-center space-y-6 border-white/5">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Secure Infrastructure</h3>
            <p className="text-zinc-400 text-sm mt-2 max-w-xs">
              Your API is currently processing requests and enforcing IP-level security policies.
            </p>
          </div>
          <div className="flex gap-4 w-full max-w-xs">
            <div className="flex-1 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Latency</p>
              <p className="text-sm font-bold">24ms</p>
            </div>
            <div className="flex-1 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Uptime</p>
              <p className="text-sm font-bold">99.9%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
