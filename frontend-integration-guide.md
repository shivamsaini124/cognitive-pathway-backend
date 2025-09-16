# Frontend Integration Guide

## 🔄 Complete Quiz Flow Integration

### Step 1: Install Axios in Frontend
```bash
npm install axios
```

### Step 2: Create API Service (React Example)

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions for quiz
export const quizApi = {
  // Get quiz questions
  getQuizQuestions: (quizType) => api.get(`/quiz/${quizType}`),
  
  // Submit Class 10 quiz
  submitClass10Quiz: (answers) => api.post('/quiz/class10/submit', { answers }),
  
  // Submit Class 12 quiz
  submitClass12Quiz: (answers, stream) => api.post('/quiz/class12/submit', { answers, stream }),
  
  // Get user's quiz attempts
  getQuizAttempts: () => api.get('/quiz/attempts')
};

// API functions for auth
export const authApi = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials)
};

export default api;
```

### Step 3: Quiz Component (React Example)

```jsx
// components/QuizComponent.jsx
import React, { useState, useEffect } from 'react';
import { quizApi } from '../services/api';

const QuizComponent = ({ quizType }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [stream, setStream] = useState(''); // For Class 12

  useEffect(() => {
    fetchQuestions();
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await quizApi.getQuizQuestions(quizType);
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(''));
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      
      let response;
      if (quizType === 'class10') {
        response = await quizApi.submitClass10Quiz(answers);
      } else {
        response = await quizApi.submitClass12Quiz(answers, stream);
      }
      
      setResults(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (results) {
    return (
      <div className="quiz-results">
        <h2>🎉 Quiz Results</h2>
        <div className="result-card">
          <h3>📊 Recommended Stream: {results.recommendedStream}</h3>
          
          {results.topCourses && (
            <div>
              <h4>📚 Top Recommended Courses:</h4>
              <ul>
                {results.topCourses.map((course, index) => (
                  <li key={index}>{course}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4>💡 AI Insights:</h4>
            <p>{results.aiInsights}</p>
          </div>
        </div>
        
        <button onClick={() => {
          setResults(null);
          setCurrentQuestion(0);
          setAnswers(new Array(questions.length).fill(''));
        }}>
          Take Quiz Again
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="quiz-header">
        <h2>{quizType === 'class10' ? 'Class 10' : 'Class 12'} Career Quiz</h2>
        <p>Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      {/* Stream Selection for Class 12 */}
      {quizType === 'class12' && currentQuestion === 0 && (
        <div className="stream-selection">
          <label>Your current stream:</label>
          <select value={stream} onChange={(e) => setStream(e.target.value)} required>
            <option value="">Select Stream</option>
            <option value="Science">Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
          </select>
        </div>
      )}

      <div className="question-card">
        <h3>{currentQ.question}</h3>
        
        <div className="options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button 
          onClick={previousQuestion} 
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button 
            onClick={nextQuestion} 
            disabled={!answers[currentQuestion]}
          >
            Next
          </button>
        ) : (
          <button 
            onClick={submitQuiz}
            disabled={
              answers.some(answer => !answer) || 
              (quizType === 'class12' && !stream)
            }
            className="submit-btn"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
```

### Step 4: Authentication Component

```jsx
// components/AuthComponent.jsx
import React, { useState } from 'react';
import { authApi } from '../services/api';

const AuthComponent = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('authToken', response.data.token);
        onAuthSuccess();
      } else {
        await authApi.register(formData);
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthComponent;
```

### Step 5: Main App Component

```jsx
// App.jsx
import React, { useState, useEffect } from 'react';
import AuthComponent from './components/AuthComponent';
import QuizComponent from './components/QuizComponent';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setSelectedQuiz(null);
  };

  if (!isAuthenticated) {
    return <AuthComponent onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (selectedQuiz) {
    return (
      <div>
        <nav>
          <button onClick={() => setSelectedQuiz(null)}>← Back to Quiz Selection</button>
          <button onClick={handleLogout}>Logout</button>
        </nav>
        <QuizComponent quizType={selectedQuiz} />
      </div>
    );
  }

  return (
    <div className="app">
      <nav>
        <h1>Cognitive Pathways</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      
      <div className="quiz-selection">
        <h2>Choose Your Quiz</h2>
        
        <div className="quiz-cards">
          <div className="quiz-card" onClick={() => setSelectedQuiz('class10')}>
            <h3>Class 10 Quiz</h3>
            <p>Discover your ideal stream for Class 11 & 12</p>
            <button>Take Quiz</button>
          </div>
          
          <div className="quiz-card" onClick={() => setSelectedQuiz('class12')}>
            <h3>Class 12 Quiz</h3>
            <p>Find perfect courses and career paths</p>
            <button>Take Quiz</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Step 6: CSS Styling (Optional)

```css
/* App.css */
.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 20px;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.question-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.options {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.option-btn {
  padding: 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  border-color: #4CAF50;
}

.option-btn.selected {
  border-color: #4CAF50;
  background-color: #e8f5e8;
}

.quiz-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.quiz-results {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.result-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}
```

## 🚀 Testing Your Integration

1. **Start Backend**: 
   ```bash
   npm run dev  # In backend directory
   ```

2. **Start Frontend**: 
   ```bash
   npm start    # In frontend directory
   ```

3. **Test Flow**:
   - Register/Login user
   - Select quiz type
   - Answer questions
   - Submit and see AI-generated results

## 🔗 API Endpoints Summary

```javascript
// Quiz Flow Endpoints
GET /api/quiz/class10          // Get Class 10 questions
GET /api/quiz/class12          // Get Class 12 questions
POST /api/quiz/class10/submit  // Submit Class 10 answers → Get AI recommendations
POST /api/quiz/class12/submit  // Submit Class 12 answers + stream → Get AI recommendations

// Auth Endpoints
POST /api/users/register       // Register new user
POST /api/users/login          // Login user → Get JWT token

// Additional Endpoints
GET /api/courses               // Get course catalog
GET /api/colleges              // Get college database
GET /api/timeline              // Get educational timeline
```

## 📱 Mobile-Friendly Tips

- Use responsive design for mobile compatibility
- Add loading states for better UX
- Implement proper error handling
- Consider using React Query for better state management
- Add offline support with service workers
