import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateRoadmap } from '../services/roadmapGenerator';
import { Link } from 'react-router-dom';
import { Route as RouteIcon, CheckCircle2, Circle, Clock, DollarSign, ExternalLink, Filter, Loader, ArrowRight, Sparkles } from 'lucide-react';
import './LearningRoadmap.css';

export default function LearningRoadmap() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [costFilter, setCostFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const gap = state.gapResults;

  const loadRoadmap = async () => {
    if (!gap || !gap.missingSkills || gap.missingSkills.length === 0) return;
    setLoading(true);
    try {
      const result = await generateRoadmap(
        gap.missingSkills,
        state.userProfile.skills,
        gap.role?.title || '',
        !state.settings.aiAvailable
      );
      dispatch({ type: 'SET_ROADMAP', payload: result.items });
      dispatch({ type: 'SHOW_TOAST', payload: {
        type: 'success',
        message: `Generated ${result.items.length} course recommendations (${result.mode})`,
      }});
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Failed to generate roadmap' } });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (gap && gap.missingSkills && state.roadmap.items.length === 0) {
      loadRoadmap();
    }
  }, []);

  if (!gap) {
    return (
      <div className="roadmap-page">
        <div className="page-header"><h1>Learning Roadmap</h1></div>
        <div className="empty-state glass-card">
          <RouteIcon size={64} />
          <h3>Run Gap Analysis First</h3>
          <p>Complete the gap analysis to generate your personalized learning roadmap.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go to Gap Analysis <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Group items by phase
  const items = state.roadmap.items || [];
  let filteredItems = items;

  if (costFilter === 'free') {
    filteredItems = filteredItems.filter(i => i.cost === 'Free');
  } else if (costFilter === 'paid') {
    filteredItems = filteredItems.filter(i => i.cost !== 'Free');
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredItems = filteredItems.filter(i =>
      i.title.toLowerCase().includes(term) ||
      i.targetSkill.toLowerCase().includes(term) ||
      i.provider.toLowerCase().includes(term)
    );
  }

  const phases = {};
  filteredItems.forEach(item => {
    const phase = item.phase || 'Uncategorized';
    if (!phases[phase]) phases[phase] = [];
    phases[phase].push(item);
  });

  const completedCount = state.roadmap.completedIds.length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="roadmap-page">
      <div className="page-header">
        <h1>Learning Roadmap</h1>
        <p>Your personalized path to becoming a {gap.role?.title || 'professional'}</p>
      </div>

      {/* Progress Bar */}
      <div className="roadmap-progress glass-card">
        <div className="roadmap-progress__header">
          <h3>Progress</h3>
          <span className="roadmap-progress__count">{completedCount}/{totalCount} completed</span>
        </div>
        <div className="roadmap-progress__bar">
          <div className="roadmap-progress__fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="roadmap-progress__pct">{progressPct}%</span>
      </div>

      {/* Filters */}
      <div className="roadmap-filters glass-card">
        <div className="roadmap-filter-row">
          <Filter size={16} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="roadmap-search"
          />
          <select value={costFilter} onChange={(e) => setCostFilter(e.target.value)}>
            <option value="all">All Costs</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={loadRoadmap} disabled={loading}>
            {loading ? <Loader size={14} className="spin" /> : <Sparkles size={14} />}
            Regenerate
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay"><div className="spinner" /><p>Generating roadmap...</p></div>
      )}

      {/* Timeline */}
      {!loading && Object.keys(phases).length > 0 && (
        <div className="roadmap-timeline">
          {Object.entries(phases).map(([phase, courseItems]) => (
            <div key={phase} className="roadmap-phase">
              <div className="roadmap-phase__header">
                <div className="roadmap-phase__dot" />
                <h3>{phase}</h3>
                <span className="badge badge-accent">{courseItems.length} courses</span>
              </div>
              <div className="roadmap-phase__items">
                {courseItems.map(item => {
                  const isCompleted = state.roadmap.completedIds.includes(item.id);
                  return (
                    <div key={item.id} className={`roadmap-item glass-card ${isCompleted ? 'roadmap-item--completed' : ''}`}>
                      <button
                        className="roadmap-item__check"
                        onClick={() => dispatch({ type: 'TOGGLE_ROADMAP_ITEM', payload: item.id })}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <div className="roadmap-item__info">
                        <div className="roadmap-item__title-row">
                          <h4>{item.title}</h4>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="roadmap-item__link">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="roadmap-item__meta">
                          <span className="roadmap-item__provider">{item.provider}</span>
                          <span className="roadmap-item__dot">·</span>
                          <span><Clock size={12} /> {item.duration}</span>
                          <span className="roadmap-item__dot">·</span>
                          <span className={item.cost === 'Free' ? 'roadmap-item__free' : ''}>
                            <DollarSign size={12} /> {item.cost}
                          </span>
                        </div>
                        <div className="roadmap-item__tags">
                          <span className="skill-tag">{item.targetSkill}</span>
                          <span className={`badge ${item.difficulty === 'Beginner' ? 'badge-success' : item.difficulty === 'Advanced' ? 'badge-danger' : 'badge-warning'}`}>
                            {item.difficulty}
                          </span>
                          {item.importance === 'required' && <span className="badge badge-danger">Required</span>}
                        </div>
                        {item.aiReason && (
                          <p className="roadmap-item__reason">💡 {item.aiReason}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && Object.keys(phases).length === 0 && items.length === 0 && (
        <div className="empty-state glass-card">
          <p>No courses found. Try regenerating the roadmap.</p>
        </div>
      )}
    </div>
  );
}
