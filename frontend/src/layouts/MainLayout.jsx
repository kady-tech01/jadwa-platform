import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Fixed Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Dynamic Main Content Area with responsive margin and padding */}
      <main
        className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;