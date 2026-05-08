'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { name: 'Updater', href: '/dashboard/updater', icon: Settings },
  { name: 'IP Bans', href: '/dashboard/bans', icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-lg">
          <ShieldCheck size={24} className="text-black" />
        </div>
        <span className="text-xl font-bold tracking-tight">Admin<span className="text-zinc-500">Panel</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900 space-y-4">
        {session?.user && (
          <div className="flex items-center gap-3 px-4 py-2">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-800" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                {session.user.name?.[0]}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{session.user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">Administrador</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => {
            // Eliminar cookie legacy por si acaso
            document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            signOut({ callbackUrl: '/login' });
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-400 transition-colors bg-zinc-900/50 rounded-lg"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
