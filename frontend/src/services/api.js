/**
 * Centralized API service for AI Code Mentor
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Health & Config Check
  checkHealth: () => request('/health'),

  // Code Analysis (Explain, Debug, Optimize, Complexity, Generate)
  analyzeCode: ({ task, language, code, prompt, sessionId }) =>
    request('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        task,
        language,
        code,
        prompt,
        session_id: sessionId,
      }),
    }),

  // Contextual Follow-Up Chat
  sendChatMessage: ({ sessionId, message, code, language }) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        message,
        code,
        language,
      }),
    }),

  // Quiz Generation & Submission
  generateQuiz: ({ topic, language, difficulty, count = 5 }) =>
    request('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, language, difficulty, count }),
    }),

  submitQuiz: ({ quizId, answers }) =>
    request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId, answers }),
    }),

  getQuizHistory: (limit = 10) =>
    request(`/quiz/history?limit=${limit}`),

  // Session & History Management
  getHistory: ({ limit = 20, task, language } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (task) params.append('task', task);
    if (language) params.append('language', language);
    return request(`/history?${params.toString()}`);
  },

  getSession: (sessionId) => request(`/sessions/${sessionId}`),

  deleteSession: (sessionId) =>
    request(`/sessions/${sessionId}`, { method: 'DELETE' }),

  clearAllHistory: () =>
    request('/history/clear', { method: 'DELETE' }),
};
