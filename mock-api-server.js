/**
 * Mock API Server for Zenith NEET AI
 * 
 * This provides a simple HTTP server that responds to API calls from the frontend
 * with mock data. Perfect for development when no real backend is available.
 * 
 * Run: node mock-api-server.js
 * Server will start on http://localhost:3000
 */

import http from 'http';
import url from 'url';

// Mock data store
const mockData = {
  questions: [
    {
      id: 1,
      subject: "Biology",
      chapter: "Cell Biology",
      topic: "Mitochondria",
      originalText: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Chloroplast", "Ribosome"],
      correctAnswer: 1,
      explanation: "Mitochondria is known as the powerhouse of the cell because it produces energy in the form of ATP.",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      subject: "Chemistry",
      chapter: "Organic Chemistry",
      topic: "Hydrocarbons",
      originalText: "Which of these is an alkane?",
      options: ["Ethene", "Ethane", "Ethyne", "Benzene"],
      correctAnswer: 1,
      explanation: "Alkanes have the general formula CnH2n+2. Ethane (C2H6) is an alkane.",
      createdAt: new Date().toISOString()
    }
  ],
  studySessions: [
    {
      id: 1,
      subject: "Biology",
      durationSeconds: 3600,
      sessionType: "practice",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      subject: "Chemistry",
      durationSeconds: 1800,
      sessionType: "review",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  weakAreas: []
};

// Helper to send JSON response
function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// Router handler
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Health check
  if (pathname === '/api/health') {
    return sendJSON(res, { status: 'ok', message: 'Mock API server is running' });
  }

  // ─── Questions ────────────────────────────────────────────────────────────

  if (pathname === '/api/questions') {
    if (req.method === 'GET') {
      return sendJSON(res, mockData.questions);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const newQuestion = {
            id: Math.max(...mockData.questions.map(q => q.id), 0) + 1,
            ...data,
            createdAt: new Date().toISOString()
          };
          mockData.questions.push(newQuestion);
          sendJSON(res, newQuestion, 201);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
        }
      });
      return;
    }
  }

  if (pathname === '/api/questions/stats') {
    const bySubject = {};
    mockData.questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });
    return sendJSON(res, {
      total: mockData.questions.length,
      bySubject: Object.entries(bySubject).map(([subject, count]) => ({ subject, count })),
      recentlyAdded: 2
    });
  }

  if (pathname === '/api/questions/tree') {
    const subjects = {};
    mockData.questions.forEach(q => {
      if (!subjects[q.subject]) {
        subjects[q.subject] = { chapters: {}, count: 0 };
      }
      subjects[q.subject].count++;
      if (!subjects[q.subject].chapters[q.chapter]) {
        subjects[q.subject].chapters[q.chapter] = { topics: new Set(), count: 0 };
      }
      subjects[q.subject].chapters[q.chapter].count++;
      if (q.topic) {
        subjects[q.subject].chapters[q.chapter].topics.add(q.topic);
      }
    });
    const result = Object.entries(subjects).map(([subject, data]) => ({
      subject,
      count: data.count,
      chapters: Object.entries(data.chapters).map(([chapter, cData]) => ({
        chapter,
        count: cData.count,
        topics: Array.from(cData.topics)
      }))
    }));
    return sendJSON(res, result);
  }

  const questionIdMatch = pathname.match(/^\/api\/questions\/(\d+)$/);
  if (questionIdMatch) {
    const id = parseInt(questionIdMatch[1]);
    if (req.method === 'PATCH') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const question = mockData.questions.find(q => q.id === id);
        if (!question) return sendJSON(res, { error: 'Not found' }, 404);
        try {
          const data = JSON.parse(body);
          Object.assign(question, data);
          sendJSON(res, question);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
        }
      });
      return;
    } else if (req.method === 'DELETE') {
      const idx = mockData.questions.findIndex(q => q.id === id);
      if (idx === -1) return sendJSON(res, { error: 'Not found' }, 404);
      mockData.questions.splice(idx, 1);
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
      res.end();
      return;
    }
  }

  // ─── Practice ─────────────────────────────────────────────────────────────

  if (pathname === '/api/practice/start' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { subjectChapters, limit = 10 } = JSON.parse(body);
        let filtered = mockData.questions;
        if (subjectChapters?.length) {
          filtered = mockData.questions.filter(q =>
            subjectChapters.some(sc => sc.subject === q.subject && sc.chapter === q.chapter)
          );
        }
        sendJSON(res, filtered.slice(0, limit));
      } catch (e) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
      }
    });
    return;
  }

  if (pathname === '/api/practice/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { questionId, selectedAnswer } = JSON.parse(body);
        const question = mockData.questions.find(q => q.id === questionId);
        if (!question) return sendJSON(res, { error: 'Not found' }, 404);
        sendJSON(res, {
          correct: selectedAnswer === question.correctAnswer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        });
      } catch (e) {
        sendJSON(res, { error: 'Invalid JSON' }, 400);
      }
    });
    return;
  }

  // ─── Weak Areas ───────────────────────────────────────────────────────────

  if (pathname === '/api/weak-areas') {
    if (req.method === 'GET') {
      return sendJSON(res, mockData.weakAreas);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const newArea = {
            id: Math.max(...mockData.weakAreas.map(a => a.id || 0), 0) + 1,
            ...data,
            resolved: false,
            createdAt: new Date().toISOString()
          };
          mockData.weakAreas.push(newArea);
          sendJSON(res, newArea, 201);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
        }
      });
      return;
    }
  }

  if (pathname === '/api/weak-areas/stats') {
    return sendJSON(res, []);
  }

  const weakIdMatch = pathname.match(/^\/api\/weak-areas\/(\d+)$/);
  if (weakIdMatch) {
    const id = parseInt(weakIdMatch[1]);
    if (req.method === 'PATCH') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const area = mockData.weakAreas.find(a => a.id === id);
        if (!area) return sendJSON(res, { error: 'Not found' }, 404);
        try {
          const data = JSON.parse(body);
          Object.assign(area, data);
          sendJSON(res, area);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
        }
      });
      return;
    } else if (req.method === 'DELETE') {
      const idx = mockData.weakAreas.findIndex(a => a.id === id);
      if (idx === -1) return sendJSON(res, { error: 'Not found' }, 404);
      mockData.weakAreas.splice(idx, 1);
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
      res.end();
      return;
    }
  }

  // ─── Study Sessions ───────────────────────────────────────────────────────

  if (pathname === '/api/study-sessions') {
    if (req.method === 'GET') {
      const limit = parseInt(query.limit) || 50;
      return sendJSON(res, mockData.studySessions.slice(0, limit));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const newSession = {
            id: Math.max(...mockData.studySessions.map(s => s.id), 0) + 1,
            ...data,
            createdAt: new Date().toISOString()
          };
          mockData.studySessions.push(newSession);
          sendJSON(res, newSession, 201);
        } catch (e) {
          sendJSON(res, { error: 'Invalid JSON' }, 400);
        }
      });
      return;
    }
  }

  if (pathname === '/api/study-sessions/stats') {
    const totalSeconds = mockData.studySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const todaySeconds = mockData.studySessions
      .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.durationSeconds, 0);
    const bySubject = {};
    mockData.studySessions.forEach(s => {
      const key = s.subject || 'General';
      bySubject[key] = (bySubject[key] || 0) + s.durationSeconds;
    });
    return sendJSON(res, {
      totalSeconds,
      todaySeconds,
      streakDays: 7,
      bySubject: Object.entries(bySubject).map(([subject, totalSeconds]) => ({ subject, totalSeconds })),
      recentSessions: mockData.studySessions.slice(0, 5)
    });
  }

  // ─── AI Endpoints ─────────────────────────────────────────────────────────

  if (pathname === '/api/ai/extract' && req.method === 'POST') {
    return sendJSON(res, [
      {
        originalText: "What is photosynthesis?",
        options: ["Process of plant growth", "Process of producing food using sunlight", "Process of plant respiration", "None of the above"],
        correctAnswer: 1,
        explanation: "Photosynthesis is the process by which plants produce their own food using sunlight, water, and carbon dioxide."
      }
    ]);
  }

  if (pathname === '/api/ai/generate-image' && req.method === 'POST') {
    return sendJSON(res, {
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EAI Generated Image%3C/text%3E%3C/svg%3E'
    });
  }

  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    return sendJSON(res, {
      reply: "This is a mock response. In a real setup, this would be powered by an AI model like GPT-4 or Gemini. You can configure your AI provider in the Settings page."
    });
  }

  // 404
  sendJSON(res, { error: 'Not found', path: pathname }, 404);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✨ Mock API Server running on http://localhost:${PORT}`);
  console.log(`📚 Frontend should be running on http://localhost:4173`);
  console.log(`\nThis server provides mock data for development.\n`);
});
