import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  CompassIcon,
  TargetIcon,
  ZapIcon,
  ClockIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  CalendarIcon,
} from './icons/Icons';

const Sidebar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboardIcon },
    { name: 'Learn', path: '/learn', icon: BookOpenIcon },
    { name: 'VISION', isHeader: true },
    { name: 'Life Compass', path: '/vision/life-compass', icon: CompassIcon },
    { name: 'Future Sketch', path: '/vision/future-sketch', icon: TargetIcon },
    { name: 'Quarterly Quests', path: '/vision/quarterly-quests', icon: ZapIcon },
    { name: 'ACTION', isHeader: true },
    { name: 'Weekly', path: '/action/weekly-plan', icon: CalendarIcon },
    { name: 'Daily', path: '/action/daily-plan', icon: CheckCircleIcon },
    { name: 'Focus Timer', path: '/action/focus-timer', icon: ClockIcon },
  ];
  
  const closeSidebar = () => setIsOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white">LifeOS</h1>
      </div>
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link, index) =>
          link.isHeader ? (
            <h2 key={index} className="px-2 pt-4 text-xs font-bold tracking-wider text-gray-500 uppercase">
              {link.name}
            </h2>
          ) : (
            <NavLink
              key={index}
              to={link.path!}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.name}
            </NavLink>
          )
        )}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="mb-2 text-xs text-gray-400 truncate">
            {loading ? (
                <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse"></div>
            ) : (
                user?.email
            )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm font-medium text-left text-gray-400 rounded-md hover:bg-gray-700 hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="fixed z-30 p-2 text-white bg-gray-800 rounded-full shadow-lg top-4 left-4">
          {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-20 h-full w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col md:w-64 flex-shrink-0`}
      >
        {sidebarContent}
      </aside>
       {isOpen && <div className="fixed inset-0 z-10 bg-black/50 md:hidden" onClick={closeSidebar}></div>}
    </>
  );
};

export default Sidebar;