# Cognitive Pathways Backend

A comprehensive Node.js backend for the Cognitive Pathways educational guidance platform, built with Express, MongoDB, and Google's Gemini AI.

## 🚀 Features

- **User Management**: Registration, login, and JWT authentication
- **AI-Powered Quizzes**: Class 10 and Class 12 career guidance quizzes
- **Course Catalog**: Comprehensive course database with stream filtering
- **College Database**: College information with location-based search
- **Timeline Events**: Educational deadlines and important dates
- **Gemini AI Integration**: Smart career recommendations and insights

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (React/etc)   │◄──►│   (Express.js)   │◄──►│   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Gemini AI      │
                       │   (Google)       │
                       └──────────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Google Gemini API key

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update the `.env` file with your credentials:

```env
PORT=3000
JWT_USER_PASSWORD=your_jwt_secret
DB_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

**Important**: Get your Gemini API key from [Google AI Studio](https://ai.google.dev/)

### 3. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

### 4. Start the Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

### 5. Production Start

```bash
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Include JWT token in request headers:
```
Authorization: Bearer <token>
```

---

## 🔐 User Endpoints

### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 🧠 Quiz Endpoints

### Get Quiz Questions
```http
GET /api/quiz/class10
GET /api/quiz/class12
```

### Submit Class 10 Quiz
```http
POST /api/quiz/class10/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": ["Mathematics", "Problem solving", "Doctor/Engineer"]
}
```

**Response:**
```json
{
  "message": "Class 10 quiz processed successfully",
  "recommendedStream": "Science",
  "aiInsights": "Based on your responses, Science stream offers..."
}
```

### Submit Class 12 Quiz
```http
POST /api/quiz/class12/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": ["Technology", "Mathematics", "Engineering"],
  "stream": "Science"
}
```

**Response:**
```json
{
  "message": "Class 12 quiz processed successfully",
  "recommendedStream": "Engineering",
  "topCourses": [
    "Computer Science Engineering",
    "Information Technology",
    "Mechanical Engineering"
  ],
  "aiInsights": "Your responses indicate strong technical aptitude..."
}
```

---

## 📚 Course Endpoints

### Get All Courses
```http
GET /api/courses
GET /api/courses?stream=Science&limit=10&page=1
```

### Get Course Streams
```http
GET /api/courses/streams
```

### Search Courses
```http
GET /api/courses/search/computer
```

### Get Specific Course
```http
GET /api/courses/:courseId
```

---

## 🏫 College Endpoints

### Get All Colleges
```http
GET /api/colleges
GET /api/colleges?location=Delhi&type=Government&limit=10
```

### Get College Locations
```http
GET /api/colleges/locations
```

### Get Top Colleges
```http
GET /api/colleges/top/10
```

### Search Colleges
```http
GET /api/colleges/search/engineering
```

---

## 📅 Timeline Endpoints

### Get Timeline Events
```http
GET /api/timeline
GET /api/timeline?upcoming=true&category=exam&limit=5
```

### Get Upcoming Events
```http
GET /api/timeline/upcoming?limit=10
```

### Get Monthly Events
```http
GET /api/timeline/month/2024/12
```

### Search Events
```http
GET /api/timeline/search/JEE
```

---

## 🤖 Gemini AI Integration

The system uses Google's Gemini AI for:

- **Stream Recommendations**: Analyzes Class 10 responses to suggest Science/Commerce/Arts
- **Course Suggestions**: Provides personalized course recommendations for Class 12 students  
- **Career Insights**: Generates detailed guidance and motivation
- **Fallback Handling**: Graceful degradation when AI is unavailable

### AI Processing Flow:
1. User submits quiz answers
2. Answers sent to Gemini AI with contextual prompt
3. AI returns structured recommendations
4. Results saved to database (optional)
5. Response sent to frontend

---

## 🗃️ Database Schema

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed)
}
```

### QuizQuestion
```javascript
{
  question: String,
  options: [String],
  quizType: 'class10' | 'class12'
}
```

### Course
```javascript
{
  name: String,
  stream: String,
  description: String,
  careers: [String],
  duration: String,
  eligibility: String
}
```

### College
```javascript
{
  name: String,
  location: String,
  programs: [String],
  facilities: [String],
  type: String,
  ranking: Number
}
```

### Timeline
```javascript
{
  title: String,
  date: Date,
  description: String,
  category: String,
  isActive: Boolean
}
```

---

## 🔄 Development Workflow

### Available Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Populate database with sample data
```

### File Structure
```
cognitive-pathway-backend/
├── db.js                 # Database models and schemas
├── index.js              # Main server file
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── routes/
│   ├── user.js          # User authentication routes
│   ├── quiz.js          # Quiz management routes
│   ├── courses.js       # Course catalog routes
│   ├── colleges.js      # College database routes
│   └── timeline.js      # Timeline events routes
├── services/
│   └── geminiService.js # AI integration service
├── middlewares/
│   └── user.js          # JWT authentication middleware
└── scripts/
    └── seedData.js      # Database seeding script
```

---

## 🚨 Error Handling

All endpoints include comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid token)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (server/database issues)

Example error response:
```json
{
  "message": "Invalid request body",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Cross-origin request handling
- **Rate Limiting**: Prevent API abuse (recommended for production)

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB
- [ ] Set up proper logging
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DB_URL=mongodb+srv://...
JWT_USER_PASSWORD=strong_secret_key
GEMINI_API_KEY=your_production_key
```

---

## 📞 Support

For issues and questions:
1. Check the API documentation above
2. Verify your environment configuration
3. Ensure database connectivity
4. Confirm Gemini API key is valid

---

## 🧪 Testing the API

### Quick Health Check
```bash
curl http://localhost:3000/
```

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Quiz Questions
```bash
curl http://localhost:3000/api/quiz/class10
```

---

## 🌟 Next Steps for Enhancement

1. **Add API Rate Limiting**
2. **Implement Caching (Redis)**
3. **Add Comprehensive Logging**
4. **Create API Tests**
5. **Add Email Verification**
6. **Implement Password Reset**
7. **Add Admin Panel Endpoints**
8. **Include Analytics Tracking**

---

**Happy Coding! 🎉**
