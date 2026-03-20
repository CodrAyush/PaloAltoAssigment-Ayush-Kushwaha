import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getInterviewQuestions, evaluateAnswer } from '../services/interviewEngine';
import { MessageSquare, Send, Loader, RotateCcw, ChevronRight, Trophy, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';
import './MockInterview.css';

export default function MockInterview() {
  const { state, dispatch } = useApp();
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [started, setStarted] = useState(false);

  const skills = state.userProfile.skills.length > 0 ? state.userProfile.skills : ['General'];

  const startInterview = async () => {
    setLoading(true);
    try {
      const result = await getInterviewQuestions(skills, interviewType, difficulty, 5, !state.settings.aiAvailable);
      setQuestions(result.questions);
      setCurrentQ(0);
      setFeedback([]);
      setSessionDone(false);
      setStarted(true);
      setAnswer('');
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Failed to load questions' } });
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const evaluation = await evaluateAnswer(questions[currentQ], answer);
      const newFeedback = [...feedback, { question: questions[currentQ], answer, evaluation }];
      setFeedback(newFeedback);

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswer('');
      } else {
        // Session complete
        setSessionDone(true);
        const totalScore = newFeedback.reduce((sum, f) => sum + f.evaluation.score, 0);
        const avg = Math.round(totalScore / newFeedback.length);
        dispatch({
          type: 'ADD_INTERVIEW_SESSION',
          payload: {
            id: Date.now(),
            date: new Date().toISOString(),
            type: interviewType,
            difficulty,
            totalScore,
            avgScore: avg,
            questions: newFeedback.length,
          }
        });
      }
    } catch (err) {
      dispatch({ type: 'SHOW_TOAST', payload: { type: 'error', message: 'Failed to evaluate answer' } });
    }
    setEvaluating(false);
  };

  const totalScore = feedback.reduce((sum, f) => sum + f.evaluation.score, 0);
  const avgScore = feedback.length > 0 ? Math.round(totalScore / feedback.length) : 0;

  // Not started view
  if (!started) {
    return (
      <div className="interview-page">
        <div className="page-header">
          <h1>Mock Interview</h1>
          <p>Practice with AI-generated technical questions tailored to your skills</p>
        </div>

        <div className="interview-setup glass-card animate-fadeIn">
          <h3>Configure Your Interview</h3>
          <div className="interview-setup__grid">
            <div className="form-group">
              <label>Interview Type</label>
              <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="System Design">System Design</option>
                <option value="All">Mixed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="All">Mixed</option>
              </select>
            </div>
          </div>
          <div className="interview-setup__skills">
            <label>Your Skills ({skills.length})</label>
            <div className="skills-cloud">
              {skills.slice(0, 10).map(s => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
              {skills.length > 10 && <span className="skill-tag">+{skills.length - 10} more</span>}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startInterview} disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : <MessageSquare size={18} />}
            {loading ? 'Loading Questions...' : 'Start Interview'}
          </button>
        </div>

        {/* Past Sessions */}
        {state.interviewHistory.length > 0 && (
          <div className="interview-history">
            <h3>Past Sessions</h3>
            <div className="interview-history__list">
              {state.interviewHistory.slice(0, 5).map(session => (
                <div key={session.id} className="interview-history__item glass-card">
                  <div className="interview-history__info">
                    <span className="interview-history__type">{session.type}</span>
                    <span className="interview-history__date">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="interview-history__score">
                    <Trophy size={14} />
                    <span>{session.avgScore}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Session complete — score card
  if (sessionDone) {
    return (
      <div className="interview-page">
        <div className="page-header">
          <h1>Interview Complete!</h1>
        </div>
        <div className="interview-scorecard glass-card animate-scaleIn">
          <div className="interview-scorecard__header">
            <Trophy size={48} className="interview-scorecard__trophy" />
            <h2>{avgScore}/10</h2>
            <p>Average Score</p>
          </div>
          <div className="interview-scorecard__stats">
            <div className="interview-scorecard__stat">
              <span className="interview-scorecard__stat-value">{feedback.length}</span>
              <span className="interview-scorecard__stat-label">Questions</span>
            </div>
            <div className="interview-scorecard__stat">
              <span className="interview-scorecard__stat-value">{totalScore}</span>
              <span className="interview-scorecard__stat-label">Total Score</span>
            </div>
            <div className="interview-scorecard__stat">
              <span className="interview-scorecard__stat-value">{difficulty}</span>
              <span className="interview-scorecard__stat-label">Difficulty</span>
            </div>
          </div>
        </div>

        {/* Per-question feedback */}
        <div className="interview-feedback-list">
          {feedback.map((f, i) => (
            <div key={i} className="interview-feedback-item glass-card">
              <div className="interview-feedback-q">
                <span className="interview-feedback-num">Q{i + 1}</span>
                <p>{f.question.question}</p>
              </div>
              <div className="interview-feedback-a">
                <strong>Your Answer:</strong>
                <p>{f.answer}</p>
              </div>
              <div className="interview-feedback-eval">
                <div className="interview-feedback-score">
                  Score: <strong>{f.evaluation.score}/{f.evaluation.maxScore}</strong>
                </div>
                <p>{f.evaluation.feedback}</p>
                {f.evaluation.strengths?.length > 0 && (
                  <div className="interview-feedback-list-items">
                    {f.evaluation.strengths.map((s, j) => (
                      <span key={j} className="interview-feedback-strength"><CheckCircle2 size={12} /> {s}</span>
                    ))}
                  </div>
                )}
                {f.evaluation.improvements?.length > 0 && (
                  <div className="interview-feedback-list-items">
                    {f.evaluation.improvements.map((s, j) => (
                      <span key={j} className="interview-feedback-improve"><AlertTriangle size={12} /> {s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="interview-actions">
          <button className="btn btn-secondary" onClick={() => { setStarted(false); setSessionDone(false); }}>
            <RotateCcw size={16} /> New Interview
          </button>
        </div>
      </div>
    );
  }

  // Active interview — Q&A
  const q = questions[currentQ];
  return (
    <div className="interview-page">
      <div className="page-header">
        <h1>Mock Interview</h1>
        <p>Question {currentQ + 1} of {questions.length}</p>
      </div>

      {/* Progress */}
      <div className="interview-progress">
        {questions.map((_, i) => (
          <div key={i} className={`interview-progress__dot ${i < currentQ ? 'done' : ''} ${i === currentQ ? 'active' : ''}`} />
        ))}
      </div>

      {/* Question Card */}
      <div className="interview-question glass-card animate-fadeIn">
        <div className="interview-question__meta">
          <span className="badge badge-accent">{q.type}</span>
          <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`}>
            {q.difficulty}
          </span>
          {q.skill && <span className="skill-tag">{q.skill}</span>}
        </div>
        <h2 className="interview-question__text">{q.question}</h2>
        {q.hint && (
          <div className="interview-question__hint">
            <Lightbulb size={14} />
            <span>{q.hint}</span>
          </div>
        )}
      </div>

      {/* Answer Area */}
      <div className="interview-answer glass-card">
        <textarea
          rows={6}
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="interview-answer__actions">
          <span className="interview-answer__count">{answer.split(/\s+/).filter(Boolean).length} words</span>
          <button className="btn btn-primary" onClick={submitAnswer} disabled={evaluating || !answer.trim()}>
            {evaluating ? <Loader size={16} className="spin" /> : <Send size={16} />}
            {evaluating ? 'Evaluating...' : (currentQ < questions.length - 1 ? 'Submit & Next' : 'Submit & Finish')}
          </button>
        </div>
      </div>

      {/* Previous feedback */}
      {feedback.length > 0 && (
        <div className="interview-prev-feedback">
          <h4>Previous: Q{currentQ} — Score: {feedback[feedback.length - 1].evaluation.score}/10</h4>
          <p>{feedback[feedback.length - 1].evaluation.feedback}</p>
        </div>
      )}
    </div>
  );
}
