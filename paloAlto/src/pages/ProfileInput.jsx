import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseResume } from '../services/resumeParser';
import { Upload, User, X, Plus, FileText, Sparkles, ArrowRight, Loader } from 'lucide-react';
import jobsData from '../../data/jobs.json';
import './ProfileInput.css';

export default function ProfileInput() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeText, setResumeText] = useState(state.userProfile.resumeText || '');
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [parseMode, setParseMode] = useState(null);
  const [errors, setErrors] = useState({});

  // Manual profile fields
  const [education, setEducation] = useState(state.userProfile.education || '');
  const [targetRole, setTargetRole] = useState(state.userProfile.targetRole || '');

  const validate = () => {
    const errs = {};
    if (activeTab === 'resume' && !resumeText.trim()) {
      errs.resume = 'Please paste your resume text';
    }
    if (activeTab === 'manual' && state.userProfile.skills.length === 0 && !newSkill.trim()) {
      errs.skills = 'Add at least one skill';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setErrors({ resume: 'Please paste your resume text' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const result = await parseResume(resumeText, !state.settings.aiAvailable);
      setParseMode(result.mode);
      dispatch({ type: 'SET_PROFILE', payload: {
        skills: result.skills,
        experience: result.experience,
        education: result.education,
        projects: result.projects,
        resumeText,
      }});
      dispatch({ type: 'SHOW_TOAST', payload: {
        type: 'success',
        message: `Extracted ${result.skills.length} skills (${result.mode} mode)`,
      }});
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Failed to parse resume' }});
    }
    setLoading(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      dispatch({ type: 'ADD_SKILL', payload: newSkill.trim() });
      setNewSkill('');
    }
  };

  const handleSaveProfile = () => {
    dispatch({ type: 'SET_PROFILE', payload: { education, targetRole } });
    dispatch({ type: 'SHOW_TOAST', payload: { type: 'success', message: 'Profile saved!' }});
  };

  const handleContinue = () => {
    if (state.userProfile.skills.length === 0) {
      setErrors({ skills: 'Add at least one skill before continuing' });
      return;
    }
    if (!targetRole) {
      setErrors({ targetRole: 'Select a target role' });
      return;
    }
    dispatch({ type: 'SET_PROFILE', payload: { education, targetRole } });
    navigate('/dashboard');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setErrors({ resume: 'Only .txt files are supported' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Build your skill profile by uploading a resume or adding skills manually</p>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'resume' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          <FileText size={16} />
          Resume Upload
        </button>
        <button
          className={`profile-tab ${activeTab === 'manual' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <User size={16} />
          Manual Entry
        </button>
      </div>

      <div className="profile-content">
        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="profile-section glass-card animate-fadeIn">
            <h3>Paste or Upload Your Resume</h3>
            <p className="profile-section__desc">
              We'll extract your skills, experience, and education automatically.
            </p>
            <div className="form-group">
              <textarea
                rows={10}
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className={errors.resume ? 'input-error' : ''}
              />
              {errors.resume && <div className="error-message">{errors.resume}</div>}
            </div>
            <div className="profile-section__actions">
              <label className="btn btn-secondary">
                <Upload size={16} />
                Upload .txt
                <input type="file" accept=".txt" onChange={handleFileUpload} hidden />
              </label>
              <button className="btn btn-primary" onClick={handleParseResume} disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : <Sparkles size={16} />}
                {loading ? 'Parsing...' : 'Parse Resume'}
              </button>
            </div>
            {parseMode && (
              <div className={`ai-banner ${parseMode === 'ai' ? 'ai-banner--online' : 'ai-banner--offline'}`}>
                {parseMode === 'ai' ? '✨ Parsed using AI' : '📋 Parsed using keyword matching (offline mode)'}
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="profile-section glass-card animate-fadeIn">
            <h3>Build Your Profile Manually</h3>
            <div className="form-group">
              <label>Add Skills</label>
              <form onSubmit={handleAddSkill} className="skill-input-row">
                <input
                  type="text"
                  placeholder="e.g. React, Python, AWS..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Add
                </button>
              </form>
              {errors.skills && <div className="error-message">{errors.skills}</div>}
            </div>
            <div className="form-group">
              <label>Education</label>
              <input
                type="text"
                placeholder="e.g. B.Tech in Computer Science"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Skills Display (always visible) */}
        <div className="profile-section glass-card">
          <div className="profile-section__header">
            <h3>Your Skills ({state.userProfile.skills.length})</h3>
            {state.userProfile.skills.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch({ type: 'SET_SKILLS', payload: [] })}
              >
                Clear All
              </button>
            )}
          </div>
          {state.userProfile.skills.length > 0 ? (
            <div className="skills-cloud">
              {state.userProfile.skills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button onClick={() => dispatch({ type: 'REMOVE_SKILL', payload: skill })}>×</button>
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No skills added yet. Upload a resume or add skills manually.</p>
            </div>
          )}
        </div>

        {/* Target Role Selection */}
        <div className="profile-section glass-card">
          <h3>Target Role</h3>
          <p className="profile-section__desc">Which role are you aiming for?</p>
          <div className="form-group">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className={errors.targetRole ? 'input-error' : ''}
            >
              <option value="">Select a target role...</option>
              {jobsData.map(job => (
                <option key={job.id} value={job.id}>{job.title} ({job.category})</option>
              ))}
            </select>
            {errors.targetRole && <div className="error-message">{errors.targetRole}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn btn-secondary" onClick={handleSaveProfile}>
            Save Profile
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleContinue}>
            Continue to Gap Analysis
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
