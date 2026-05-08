import { 
  Users, 
  ShieldAlert, 
  Activity, 
  TrendingUp 
} from 'lucide-react';

const stats = [
  { name: 'Total Users', value: '1,234', icon: Users, change: '+12%', color: 'text-blue-500' },
  { name: 'Recent Bans', value: '42', icon: ShieldAlert, change: '+2', color: 'text-red-500' },
  { name: 'Active Today', value: '573', icon: Activity, change: '+5.4%', color: 'text-green-500' },
  { name: 'New Licenses', value: '128', icon: TrendingUp, change: '+18%', color: 'text-purple-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
        <p className="text-zinc-400 mt-1">General overview of your application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-zinc-900 rounded-lg">
                <stat.icon size={24} className={stat.color} />
              </div>
              <span className="text-green-500 text-xs font-semibold px-2 py-1 bg-green-500/10 rounded-full">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-900 last:border-0">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold">
                  JS
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Juan_Soto has joined</p>
                  <p className="text-xs text-zinc-500">5 minutes ago</p>
                </div>
                <div className="text-xs text-zinc-500">Trial</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-zinc-900 to-zinc-950">
          <h3 className="text-lg font-bold mb-4">System Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">API Servers</span>
                <span className="text-green-500 font-medium">Operational</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full w-[98%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Database Load</span>
                <span className="text-zinc-400 font-medium">12%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full w-[12%]"></div>
              </div>
            </div>
            <button className="w-full mt-4 text-sm text-zinc-400 hover:text-white transition-colors">
              View detailed report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
