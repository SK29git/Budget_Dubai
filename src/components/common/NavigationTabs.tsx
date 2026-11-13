import React from 'react';
import {
  Car,
  Calendar,
  CreditCard,
  Settings,
  FolderCheck,
  PanelLeftClose,
  PanelLeftOpen,
  // PanelRightClose,
  // PanelRightOpen,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const NavigationTabs: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    // isRightSidebarOpen,
    // toggleRightSidebar,
  } = useWorkspace();

  const tabs = [
    { id: 'rentals', label: 'Rentals', icon: Car },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'operations', label: 'Operations', icon: Settings },
    { id: 'cases', label: 'Cases', icon: FolderCheck },
  ];

  return (
    <div className="relative flex items-center justify-center border-b border-slate-200 bg-white h-9 px-3 shrink-0 select-none shadow-2xs">
      {/* Left Sidebar Toggle Button (Flush Left Corner) */}
      <button
        onClick={toggleLeftSidebar}
        className="absolute left-3 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        title={isLeftSidebarOpen ? 'Collapse Customer Details' : 'Expand Customer Details'}
      >
        {isLeftSidebarOpen ? (
          <PanelLeftClose className="w-4 h-4" />
        ) : (
          <PanelLeftOpen className="w-4 h-4 text-blue-600" />
        )}
      </button>

      {/* Dead Center: The Tabs Menu Only */}
      <div className="flex items-center space-x-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNavTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNavTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 h-full text-[11px] font-semibold rounded-t transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Sidebar Toggle Button (Commented out for now) */}
      {/* <button
        onClick={toggleRightSidebar}
        className="absolute right-3 p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        title={isRightSidebarOpen ? 'Collapse Customer Activity' : 'Expand Customer Activity'}
      >
        {isRightSidebarOpen ? (
          <PanelRightClose className="w-4 h-4" />
        ) : (
          <PanelRightOpen className="w-4 h-4 text-blue-600" />
        )}
      </button> */}
    </div>
  );
};
