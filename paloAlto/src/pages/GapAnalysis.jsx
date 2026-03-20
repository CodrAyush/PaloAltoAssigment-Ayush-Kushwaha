import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeGap } from '../services/gapAnalyzer';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, CheckCircle2, AlertTriangle, XCircle, Loader, ArrowRight, Sparkles } from 'lucide-react';
import jobsData from '../../data/jobs.json';
import './GapAnalysis.css';

export default function GapAnalysis() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(state.userProfile.targetRole || '');

  const runAnalysis = async (roleId) => {
    if (!roleId || state.userProfile.skills.length === 0) return;
    setLoading(true);
    try {
      const result = await analyzeGap(state.userProfile.skills, roleId, !state.settings.aiAvailable);
      dispatch({ type: 'SET_GAP_RESULTS', payload: result });
      dispatch({ type: 'SET_TARGET_ROLE', payload: roleId });
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Analysis failed' } });
    }
    setLoading(false);
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    if (roleId) runAnalysis(roleId);
  };

  useEffect(() => {
    if (selectedRole && state.userProfile.skills.length > 0 && !state.gapResults) {
      runAnalysis(selectedRole);
    }
  }, []);

  const gap = state.gapResults;

  if (state.userProfile.skills.length === 0) {
    return (
      <div className="gap-page">
        <div className="page-header"><h1>Gap Analysis Dashboard</h1></div>
        <div className="empty-state glass-card">
          <BarChart3 size={64} />
          <h3>No Skills Found</h3>
          <p>Add your skills in your profile first.</p>
          <Link to="/profile" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Build Profile <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-page">
      <div className="page-header">
        <h1>Gap Analysis Dashboard</h1>
        <p>See how your skills compare against your target role</p>
      </div>

      {/* Role Selector */}
      <div className="gap-controls glass-card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Select Target Role</label>
          <select value={selectedRole} onChange={handleRoleChange}>
            <option value="">Choose a role...</option>
            {jobsData.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => runAnalysis(selectedRole)} disabled={!selectedRole || loading}>
          {loading ? <Loader size={16} className="spin" /> : <Sparkles size={16} />}
          {loading ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {loading && (
        <div className="loading-overlay"><div className="spinner" /><p>Analyzing your skills...</p></div>
      )}

      {gap && !loading && (
        <>
          {gap.mode && (
            <div className={`ai-banner ${gap.mode === 'ai' ? 'ai-banner--online' : 'ai-banner--offline'}`}>
              {gap.mode === 'ai' ? '✨ Analysis powered by AI' : '📋 Analysis using keyword matching (offline)'}
            </div>
          )}

          {/* Score + Radar Row */}
          <div className="gap-top-row">
            {/* Readiness Score */}
            <div className="gap-score-card glass-card">
              <h3>Readiness Score</h3>
              <div className="gap-score-ring">
                <svg viewBox="0 0 120 120" width="160" height="160">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={gap.readinessScore >= 70 ? 'var(--success)' : gap.readinessScore >= 40 ? 'var(--warning)' : 'var(--danger)'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(gap.readinessScore / 100) * 327} 327`}
                    transform="rotate(-90 60 60)"
                    className="gap-score-circle"
                  />
                  <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="700" fontFamily="var(--font-display)">
                    {gap.readinessScore}%
                  </text>
                  <text x="60" y="75" textAnchor="middle" fill="var(--text-muted)" fontSize="11">
                    Match Score
                  </text>
                </svg>
              </div>
              <p className="gap-score-detail">{gap.matchedRequired}/{gap.totalRequired} required skills matched</p>
            </div>

            {/* Radar Chart */}
            <div className="gap-radar-card glass-card">
              <h3>Skills Breakdown</h3>
              {gap.radarData && gap.radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={gap.radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Your Skills" dataKey="userScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Required" dataKey="requiredScore" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="gap-radar-empty">No data for radar chart</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="gap-summary glass-card">
            <h3>AI Assessment</h3>
            <p>{gap.summary}</p>
          </div>

          {/* Skill Cards */}
          <div className="gap-skills-section">
            <h3>Skill Breakdown</h3>
            <div className="gap-skills-grid">
              {/* Matched Skills */}
              {gap.matchedSkills.map((s, i) => (
                <div key={`m-${i}`} className="gap-skill-card gap-skill-card--matched">
                  <CheckCircle2 size={18} />
                  <div>
                    <span className="gap-skill-name">{s.skill}</span>
                    <span className="badge badge-success">Matched</span>
                  </div>
                </div>
              ))}
              {/* Partial */}
              {gap.partialSkills.map((s, i) => (
                <div key={`p-${i}`} className="gap-skill-card gap-skill-card--partial">
                  <AlertTriangle size={18} />
                  <div>
                    <span className="gap-skill-name">{s.skill}</span>
                    <span className="badge badge-warning">Partial</span>
                  </div>
                </div>
              ))}
              {/* Missing */}
              {gap.missingSkills.map((s, i) => (
                <div key={`x-${i}`} className="gap-skill-card gap-skill-card--missing">
                  <XCircle size={18} />
                  <div>
                    <span className="gap-skill-name">{s.skill}</span>
                    <span className={`badge ${s.importance === 'required' ? 'badge-danger' : 'badge-warning'}`}>
                      {s.importance === 'required' ? 'Required' : 'Preferred'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="gap-cta">
            <Link to="/roadmap" className="btn btn-primary btn-lg">
              Generate Learning Roadmap <ArrowRight size={18} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
