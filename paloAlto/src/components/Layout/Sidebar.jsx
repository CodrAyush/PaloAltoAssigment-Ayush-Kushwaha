import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, BarChart3, Route, MessageSquare, Settings, ChevronLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/dashboard', label: 'Gap Analysis', icon: BarChart3 },
  { path: '/roadmap', label: 'Learning Roadmap', icon: Route },
  { path: '/interview', label: 'Mock Interview', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <NavLink to="/" className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <Sparkles size={22} />
          </div>
          {!collapsed && <span className="sidebar__logo-text">Skill-Bridge</span>}
        </NavLink>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} className={collapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__version">
            <Sparkles size={14} />
            <span>v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
