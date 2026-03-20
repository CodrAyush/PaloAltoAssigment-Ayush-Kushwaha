import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Upload, Trash2, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import aiService from '../services/aiService';
import './Settings.css';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [importText, setImportText] = useState('');

  const toggleAI = () => {
    const newVal = !state.settings.aiAvailable;
    dispatch({ type: 'SET_AI_AVAILABLE', payload: newVal });
    if (newVal) aiService.reset();
    dispatch({ type: 'SHOW_TOAST', payload: { type: 'success', message: newVal ? 'AI mode enabled' : 'Switched to offline mode' }});
  };

  const handleExport = () => {
    const { toast, ...data } = state;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `skillbridge-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = () => {
    try {
      dispatch({ type: 'IMPORT_DATA', payload: JSON.parse(importText) });
      setImportText('');
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'success', message: 'Imported!' }});
    } catch { dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Invalid JSON' }}); }
  };

  return (
    <div className="settings-page">
      <div className="page-header"><h1>Settings</h1><p>Manage preferences and data</p></div>

      <div className="settings-section glass-card">
        <h3>AI Service</h3>
        <div className="settings-toggle-row">
          <div className="settings-toggle-info">
            {state.settings.aiAvailable ? <Wifi size={20} className="settings-icon--success" /> : <WifiOff size={20} className="settings-icon--warning" />}
            <div><strong>{state.settings.aiAvailable ? 'AI Mode' : 'Offline'}</strong>
            <p>{state.settings.aiAvailable ? 'Using Gemini AI' : 'Using fallback algorithms'}</p></div>
          </div>
          <button className={`settings-toggle ${state.settings.aiAvailable ? 'settings-toggle--on' : ''}`} onClick={toggleAI}>
            <div className="settings-toggle__knob" />
          </button>
        </div>
      </div>

      <div className="settings-section glass-card">
        <h3>Data</h3>
        <div className="settings-data-actions">
          <button className="btn btn-secondary" onClick={handleExport}><Download size={16} /> Export</button>
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Import (paste JSON)</label>
          <textarea rows={3} value={importText} onChange={e => setImportText(e.target.value)} placeholder='Paste exported JSON...' />
          <button className="btn btn-secondary btn-sm" onClick={handleImport} disabled={!importText.trim()} style={{ marginTop: '.5rem' }}><Upload size={14} /> Import</button>
        </div>
      </div>

      <div className="settings-section settings-section--danger glass-card">
        <h3>Danger Zone</h3>
        <button className="btn btn-danger" onClick={() => { if(window.confirm('Delete all data?')) { dispatch({ type: 'CLEAR_ALL_DATA' }); }}}><Trash2 size={16} /> Clear All</button>
      </div>

      <div className="settings-section glass-card">
        <h3>Profile Summary</h3>
        <div className="settings-summary">
          <div className="settings-summary__item"><span>Skills</span><strong>{state.userProfile.skills.length}</strong></div>
          <div className="settings-summary__item"><span>Target Role</span><strong>{state.userProfile.targetRole || 'Not set'}</strong></div>
          <div className="settings-summary__item"><span>Roadmap Items</span><strong>{state.roadmap.items.length}</strong></div>
          <div className="settings-summary__item"><span>Interviews</span><strong>{state.interviewHistory.length}</strong></div>
        </div>
      </div>
    </div>
  );
}
