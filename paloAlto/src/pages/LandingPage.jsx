import { Link } from 'react-router-dom';
import { Sparkles, BarChart3, Route, MessageSquare, ArrowRight, Zap, Shield, Target } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <div className="landing__gradient-bg" />
      <nav className="landing__nav">
        <div className="landing__nav-logo">
          <div className="sidebar__logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="landing__nav-title">Skill-Bridge</span>
        </div>
        <div className="landing__nav-links">
          <Link to="/profile" className="btn btn-secondary btn-sm">Get Started</Link>
        </div>
      </nav>

      <section className="landing__hero">
        <div className="landing__hero-badge animate-fadeInUp">
          <Zap size={14} />
          <span>AI-Powered Career Navigation</span>
        </div>
        <h1 className="landing__hero-title animate-fadeInUp delay-1">
          Bridge the Gap Between
          <br />
          <span className="landing__hero-gradient">Where You Are</span> & <span className="landing__hero-gradient2">Where You Want to Be</span>
        </h1>
        <p className="landing__hero-desc animate-fadeInUp delay-2">
          Upload your resume, discover your skill gaps against your dream role,
          get a personalized learning roadmap, and practice with AI-generated mock interviews.
        </p>
        <div className="landing__hero-actions animate-fadeInUp delay-3">
          <Link to="/profile" className="btn btn-primary btn-lg">
            <Sparkles size={18} />
            Start Your Journey
            <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">
            Explore Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="landing__stats animate-fadeInUp delay-4">
          <div className="landing__stat">
            <span className="landing__stat-number">100+</span>
            <span className="landing__stat-label">Job Descriptions</span>
          </div>
          <div className="landing__stat-divider" />
          <div className="landing__stat">
            <span className="landing__stat-number">60+</span>
            <span className="landing__stat-label">Courses & Certs</span>
          </div>
          <div className="landing__stat-divider" />
          <div className="landing__stat">
            <span className="landing__stat-number">300+</span>
            <span className="landing__stat-label">Interview Questions</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <h2 className="landing__features-title">Everything You Need to Level Up</h2>
        <p className="landing__features-desc">
          A complete toolkit for students, career switchers, and mentors.
        </p>
        <div className="landing__features-grid">
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--purple">
              <BarChart3 size={24} />
            </div>
            <h3>Gap Analysis Dashboard</h3>
            <p>Compare your skills against real job requirements with visual radar charts and match percentages.</p>
          </div>
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--cyan">
              <Route size={24} />
            </div>
            <h3>Dynamic Learning Roadmap</h3>
            <p>Get a personalized timeline of courses and certifications to fill your gaps, organized by priority.</p>
          </div>
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--green">
              <MessageSquare size={24} />
            </div>
            <h3>Mock Interview Practice</h3>
            <p>Practice with AI-generated technical questions based on your specific skill gaps and target role.</p>
          </div>
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--orange">
              <Shield size={24} />
            </div>
            <h3>Offline Fallback</h3>
            <p>Works without AI too — every feature has a built-in fallback using our curated data library.</p>
          </div>
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--pink">
              <Target size={24} />
            </div>
            <h3>Smart Skill Matching</h3>
            <p>Synonym-aware matching understands that "K8s" = "Kubernetes" and "JS" = "JavaScript".</p>
          </div>
          <div className="landing__feature-card glass-card">
            <div className="landing__feature-icon landing__feature-icon--blue">
              <Zap size={24} />
            </div>
            <h3>Progress Tracking</h3>
            <p>Track your learning progress, save interview scores, and watch your readiness score grow over time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing__cta">
        <div className="landing__cta-card glass-card">
          <h2>Ready to Navigate Your Career?</h2>
          <p>Start by uploading your resume or building your skill profile.</p>
          <Link to="/profile" className="btn btn-primary btn-lg">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <p>Built with ❤️ for Skill-Bridge Career Navigator</p>
      </footer>
    </div>
  );
}
