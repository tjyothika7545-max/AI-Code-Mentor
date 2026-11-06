import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function QuizView() {
  const [topic, setTopic] = useState('Data Structures & Big-O');
  const [language, setLanguage] = useState('python');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(5);

  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const commonTopics = [
    'Data Structures & Big-O',
    'Recursion & Call Stacks',
    'Pointers & Memory Allocation',
    'Object-Oriented Programming (OOP)',
    'Async Event Loop & Promises',
    'Dynamic Programming & Memoization',
    'Sorting & Searching Algorithms',
  ];

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setQuiz(null);
    setUserAnswers({});
    setSubmissionResult(null);

    try {
      const res = await api.generateQuiz({
        topic,
        language,
        difficulty,
        count: questionCount,
      });
      setQuiz(res.quiz);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    if (submissionResult) return; // Prevent changing after submission
    setUserAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.submitQuiz({
        quizId: quiz.id,
        answers: userAnswers,
      });
      setSubmissionResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-viewport">
      <div className="quiz-container">
        {/* Quiz Setup Panel */}
        <div className="quiz-setup-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className="avatar-circle mentor">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Dynamic AI Quiz Arena
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Customize your quiz topic and difficulty to test programming concepts with instant feedback.
              </p>
            </div>
          </div>

          <div className="quiz-grid-form">
            <div className="form-group">
              <label>Topic</label>
              <select
                className="select-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {commonTopics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Language</label>
              <select
                className="select-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="general">General CS</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                className="select-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Questions</label>
              <select
                className="select-input"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              style={{ height: '38px' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '16px', color: '#F87171', fontSize: '0.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Scorecard Results Banner (Shown once submitted) */}
        {submissionResult && (
          <div className="score-card" style={{ marginBottom: '24px' }}>
            <div className="score-circle">
              <span className="score-number">{submissionResult.score}</span>
              <span className="score-total">/ {submissionResult.total}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '6px' }}>
              {submissionResult.percentage >= 80
                ? '🎉 Excellent Mastery!'
                : submissionResult.percentage >= 50
                ? '👍 Good Effort!'
                : '📚 Keep Practicing!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '18px' }}>
              You answered {submissionResult.score} out of {submissionResult.total} questions correctly ({submissionResult.percentage}%).
            </p>
            <button
              className="btn-secondary"
              onClick={handleGenerateQuiz}
              style={{ margin: '0 auto' }}
            >
              <RotateCcw size={15} />
              <span>Take Another Quiz</span>
            </button>
          </div>
        )}

        {/* Questions List */}
        {quiz && quiz.questions && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {quiz.topic} ({quiz.language.toUpperCase()}) • {quiz.difficulty.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Answered: {Object.keys(userAnswers).length} of {quiz.questions.length}
              </span>
            </div>

            {quiz.questions.map((q, idx) => {
              const qIdStr = String(q.id);
              const selectedOption = userAnswers[qIdStr];
              const feedbackItem = submissionResult?.feedback?.find(
                (f) => String(f.id) === qIdStr
              );

              return (
                <div key={q.id || idx} className="question-card">
                  <div className="question-title">
                    <span style={{ color: 'var(--accent-indigo)', marginRight: '8px' }}>
                      Q{idx + 1}.
                    </span>
                    {q.question}
                  </div>

                  {q.code_snippet && (
                    <div className="question-code-box">
                      <pre>{q.code_snippet}</pre>
                    </div>
                  )}

                  <div className="options-list">
                    {q.options?.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      let optionClass = 'option-item';

                      if (submissionResult) {
                        const isCorrectOption = feedbackItem?.correct_option === opt.id;
                        if (isCorrectOption) {
                          optionClass += ' correct';
                        } else if (isSelected && !isCorrectOption) {
                          optionClass += ' incorrect';
                        }
                      } else if (isSelected) {
                        optionClass += ' selected';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={optionClass}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                        >
                          <div className="option-letter">{opt.id}</div>
                          <div style={{ flex: 1 }}>{opt.text}</div>
                          {submissionResult && feedbackItem?.correct_option === opt.id && (
                            <CheckCircle2 size={18} style={{ color: 'var(--status-success)' }} />
                          )}
                          {submissionResult && isSelected && feedbackItem?.correct_option !== opt.id && (
                            <XCircle size={18} style={{ color: 'var(--status-danger)' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card after submit */}
                  {submissionResult && feedbackItem && (
                    <div className="explanation-box">
                      <div style={{ fontWeight: 600, color: 'var(--accent-indigo)', marginBottom: '4px' }}>
                        💡 Explanation
                      </div>
                      <p>{feedbackItem.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!submissionResult && (
              <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '40px' }}>
                <button
                  className="btn-primary"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || Object.keys(userAnswers).length === 0}
                  style={{ padding: '10px 32px', fontSize: '1rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Grading Quiz...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Submit Answers</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
