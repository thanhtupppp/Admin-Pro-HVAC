import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ViewType } from '../types';
import { MENU_GROUPS, MenuGroup } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  currentUser?: { name: string; role: string; } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, currentUser }) => {
  // Load expanded groups from localStorage or default
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('expandedMenuGroups');
      return saved ? JSON.parse(saved) : ['content', 'ai']; // Default: expand content & AI
    } catch {
      return ['content', 'ai'];
    }
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('expandedMenuGroups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleNavigation = (view: ViewType) => {
    onNavigate(view);
  };

  return (
    <aside className="w-64 bg-bg-panel border-r border-border-base h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border-base">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-brand-primary text-xl">
              thermostat
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-brand-primary">Admin Pro</h1>
            <p className="text-xs text-text-muted">HVAC Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scroll">
        {MENU_GROUPS.map(group => {
          const isExpanded = expandedGroups.includes(group.id);

          // Single item (like Dashboard)
          if (group.viewType) {
            const isActive = currentView === group.viewType;
            return (
              <button
                key={group.id}
                onClick={() => handleNavigation(group.viewType!)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }
                `}
              >
                <span className="material-symbols-outlined text-xl">
                  {group.icon}
                </span>
                <span className="flex-1 text-left">{group.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                )}
              </button>
            );
          }

          // Group with submenu
          const hasActiveItem = group.items?.some(item => item.id === currentView);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-200"
              >
                <span className="material-symbols-outlined text-xl">
                  {group.icon}
                </span>
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Submenu Items */}
              <div 
                className={`
                  overflow-hidden transition-all duration-200
                  ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="pl-3 space-y-1">
                  {group.items?.map(item => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm transition-all duration-200
                          ${isActive
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-medium'
                            : 'text-text-muted hover:bg-bg-hover hover:text-text-primary'
                          }
                        `}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {currentUser && (
        <div className="p-4 border-t border-border-base">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-soft">
            <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-primary">
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">{currentUser.name}</div>
              <div className="text-xs text-text-muted">{currentUser.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
