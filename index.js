require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const userRouter = require("./routes/user");
const quizRouter = require("./routes/quiz");
const coursesRouter = require("./routes/courses");
const collegesRouter = require("./routes/colleges");
const timelineRouter = require("./routes/timeline");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging JWT issues)
app.use((req, res, next) => {
    // Only log requests to protected endpoints that might have JWT issues
    if (req.url.includes('/submit') || req.url.includes('/quiz/class')) {
        const authHeader = req.headers.authorization;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url} - Auth: ${authHeader ? authHeader.substring(0, 20) + '...' : 'None'}`);
    }
    next();
});

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Cognitive Pathways Backend API",
        version: "1.0.0",
        status: "running",
        endpoints: {
            users: "/api/users",
            quiz: "/api/quiz",
            courses: "/api/courses",
            colleges: "/api/colleges",
            timeline: "/api/timeline"
        }
    });
});

// API Routes
app.use("/api/users", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/colleges", collegesRouter);
app.use("/api/timeline", timelineRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        availableRoutes: ["/api/users", "/api/quiz", "/api/courses", "/api/colleges", "/api/timeline"]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

const main = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is live at http://localhost:${PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${PORT}`);
            console.log(`\n🔗 Available Endpoints:`);
            console.log(`   Users: http://localhost:${PORT}/api/users`);
            console.log(`   Quiz: http://localhost:${PORT}/api/quiz`);
            console.log(`   Courses: http://localhost:${PORT}/api/courses`);
            console.log(`   Colleges: http://localhost:${PORT}/api/colleges`);
            console.log(`   Timeline: http://localhost:${PORT}/api/timeline`);
        });
    } catch (err) {
        console.error("❌ Error starting server:", err);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

main();
