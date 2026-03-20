import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Wifi, WifiOff, ChevronRight } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/profile': 'My Profile',
  '/dashboard': 'Gap Analysis',
  '/roadmap': 'Learning Roadmap',
  '/interview': 'Mock Interview',
  '/settings': 'Settings',
};

export default function Header() {
  const { state } = useApp();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Skill-Bridge';

  return (
    <header className="header">
      <div className="header__left">
        <nav className="header__breadcrumb">
          <Link to="/" className="header__breadcrumb-link">Home</Link>
          <ChevronRight size={14} />
          <span className="header__breadcrumb-current">{title}</span>
        </nav>
      </div>
      <div className="header__right">
        <div className={`ai-status ${state.settings.aiAvailable ? 'ai-status--online' : 'ai-status--offline'}`}>
          {state.settings.aiAvailable ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{state.settings.aiAvailable ? 'AI Online' : 'Offline Mode'}</span>
        </div>
      </div>
    </header>
  );
}
