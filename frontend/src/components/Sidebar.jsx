import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  Receipt, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Projects', path: '/projects', icon: FolderKanban },
    { title: 'Financial Analytics', path: '/analytics', icon: BarChart3 },
    { title: 'Cash Flow', path: '/cashflow', icon: TrendingUp },
    { title: 'Transactions', path: '/transactions', icon: Receipt },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-1.5 border-2 border-slate-900 shadow-lg transition-colors focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand Logo / Title */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/80">
        <div className="bg-blue-600 text-white p-2 rounded-xl font-bold text-xl flex items-center justify-center shrink-0">
          JP
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-lg text-slate-50 tracking-wide">JADWA</h1>
            <p className="text-xs text-slate-400 font-medium">Financial Platform</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`
              }
              title={isCollapsed ? item.title : ''}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">{item.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Session */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => console.log('Logout clicked')}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="truncate whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;