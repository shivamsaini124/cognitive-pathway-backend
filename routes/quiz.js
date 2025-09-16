const { Router } = require("express");
const { z } = require("zod");
const { QuizQuestionModel, QuizAttemptModel } = require("../db");
const geminiService = require("../services/geminiService");
const { userAuth } = require("../middlewares/user");

// Simple in-memory cache for quiz questions (since they rarely change)
const quizCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const quizRouter = Router();

// Cache management functions
const clearQuizCache = (quizType = null) => {
    if (quizType) {
        quizCache.delete(`quiz_${quizType}`);
        console.log(`[Cache] Cleared cache for quiz type: ${quizType}`);
    } else {
        quizCache.clear();
        console.log('[Cache] Cleared all quiz cache');
    }
};

// Health check endpoint for quiz service
quizRouter.get('/health', async (req, res) => {
    const startTime = Date.now();
    try {
        // Test database connectivity
        const count = await QuizQuestionModel.countDocuments();
        const responseTime = Date.now() - startTime;
        
        res.json({
            success: true,
            message: 'Quiz service is healthy',
            database: {
                connected: true,
                totalQuestions: count,
                responseTime: `${responseTime}ms`
            },
            cache: {
                size: quizCache.size,
                keys: Array.from(quizCache.keys())
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Quiz service health check failed',
            error: error.message,
            database: { connected: false }
        });
    }
});

// GET /api/quiz/:quizType - Get all questions for specified quiz type (optimized with caching)
quizRouter.get("/:quizType", async (req, res) => {
    const startTime = Date.now();
    
    // Set CORS headers explicitly for frontend compatibility
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    try {
        const { quizType } = req.params;
        console.log(`[Quiz Request] Fetching ${quizType} questions...`);

        // Validate quiz type quickly
        if (!['class10', 'class12'].includes(quizType)) {
            console.log(`[Error] Invalid quiz type: ${quizType}`);
            return res.status(400).json({
                success: false,
                message: "Invalid quiz type. Must be 'class10' or 'class12'",
                quizType: quizType
            });
        }

        // Check cache first
        const cacheKey = `quiz_${quizType}`;
        const cached = quizCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            console.log(`[Cache Hit] Quiz ${quizType} served from cache in ${Date.now() - startTime}ms`);
            return res.status(200).json({
                success: true,
                message: `${quizType} quiz questions retrieved successfully`,
                count: cached.data.length,
                questions: cached.data,
                cached: true,
                timestamp: new Date().toISOString()
            });
        }

        // Fetch from database with optimized query
        console.log(`[Cache Miss] Fetching quiz ${quizType} from database...`);
        const questions = await QuizQuestionModel.find({ quizType })
            .select('question options quizType') // Include _id for frontend compatibility
            .lean() // Return plain JS objects for better performance
            .sort({ createdAt: 1 }) // Consistent ordering
            .exec(); // Explicit execution

        console.log(`[Database] Found ${questions.length} questions for ${quizType}`);

        if (questions.length === 0) {
            console.log(`[Warning] No questions found for ${quizType}`);
            return res.status(404).json({
                success: false,
                message: `No questions found for ${quizType} quiz`,
                count: 0,
                questions: [],
                quizType: quizType
            });
        }

        // Cache the results
        quizCache.set(cacheKey, {
            data: questions,
            timestamp: Date.now()
        });

        const responseTime = Date.now() - startTime;
        console.log(`[Success] Quiz ${quizType} fetched from database in ${responseTime}ms`);

        // Return consistent response format
        res.status(200).json({
            success: true,
            message: `${quizType} quiz questions retrieved successfully`,
            count: questions.length,
            questions: questions,
            cached: false,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`[Error] Quiz fetch failed in ${responseTime}ms:`, error);
        
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching quiz questions",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
            count: 0,
            questions: [],
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/quiz/class10/submit - Submit Class 10 quiz
quizRouter.post("/class10/submit", userAuth, async (req, res) => {
    try {
        const bodySchema = z.object({
            answers: z.array(z.string()).min(1, "At least one answer is required")
        });

        const parsedBody = bodySchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedBody.error.errors
            });
        }

        const { answers } = parsedBody.data;
        const userId = req.userId;

        // Process quiz with Gemini AI
        const aiResult = await geminiService.processClass10Quiz(answers);

        // Optionally save quiz attempt to database
        try {
            await QuizAttemptModel.create({
                userId: userId,
                quizType: 'class10',
                answers: answers,
                result: {
                    recommendedStream: aiResult.recommendedStream,
                    aiInsights: aiResult.aiInsights
                }
            });
        } catch (saveError) {
            console.error('Error saving quiz attempt:', saveError);
            // Continue anyway, don't fail the response
        }

        res.json({
            message: "Class 10 quiz processed successfully",
            recommendedStream: aiResult.recommendedStream,
            aiInsights: aiResult.aiInsights
        });

    } catch (error) {
        console.error('Error processing Class 10 quiz:', error);
        res.status(500).json({
            message: "Internal server error while processing quiz",
            recommendedStream: "Unknown",
            aiInsights: "AI insights not available at the moment."
        });
    }
});

// POST /api/quiz/class12/submit - Submit Class 12 quiz
quizRouter.post("/class12/submit", userAuth, async (req, res) => {
    try {
        const bodySchema = z.object({
            answers: z.array(z.string()).min(1, "At least one answer is required"),
            stream: z.string().min(1, "Current stream is required")
        });

        const parsedBody = bodySchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedBody.error.errors
            });
        }

        const { answers, stream } = parsedBody.data;
        const userId = req.userId;

        // Process quiz with Gemini AI
        const aiResult = await geminiService.processClass12Quiz(answers, stream);

        // Optionally save quiz attempt to database
        try {
            await QuizAttemptModel.create({
                userId: userId,
                quizType: 'class12',
                answers: answers,
                result: {
                    recommendedStream: aiResult.recommendedStream,
                    topCourses: aiResult.topCourses,
                    aiInsights: aiResult.aiInsights
                }
            });
        } catch (saveError) {
            console.error('Error saving quiz attempt:', saveError);
            // Continue anyway, don't fail the response
        }

        res.json({
            message: "Class 12 quiz processed successfully",
            recommendedStream: aiResult.recommendedStream,
            topCourses: aiResult.topCourses || [],
            aiInsights: aiResult.aiInsights
        });

    } catch (error) {
        console.error('Error processing Class 12 quiz:', error);
        res.status(500).json({
            message: "Internal server error while processing quiz",
            recommendedStream: "Unknown",
            topCourses: [],
            aiInsights: "AI insights not available at the moment."
        });
    }
});

// POST /api/quiz/submit-quiz - Unified quiz submission endpoint
quizRouter.post("/submit-quiz", userAuth, async (req, res) => {
    try {
        // Validation schema
        const bodySchema = z.object({
            quizType: z.enum(['10th', 'career'], {
                errorMap: () => ({ message: "Quiz type must be either '10th' or 'career'" })
            }),
            responses: z.array(z.string()).min(1, "At least one response is required"),
            stream: z.string().optional() // Required for career quiz, optional for 10th grade quiz
        });

        const parsedBody = bodySchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid request body",
                errors: parsedBody.error.errors
            });
        }

        const { quizType, responses, stream } = parsedBody.data;
        const userId = req.userId;

        console.log(`[Quiz Submission] User: ${userId}, Type: ${quizType}, Answers: ${responses.length}`);

        // Additional validation for career quiz
        if (quizType === 'career' && !stream) {
            return res.status(400).json({
                success: false,
                message: "Stream is required for career quiz"
            });
        }

        // Step 1: Save raw quiz answers to MongoDB FIRST
        let quizRecord;
        try {
            const quizAttemptData = {
                userId: userId,
                quizType: quizType,
                answers: responses,
                result: {
                    recommendedStream: null,
                    topCourses: [],
                    aiInsights: 'Processing...'
                },
                geminiResponse: null
            };
            
            quizRecord = await QuizAttemptModel.create(quizAttemptData);
            console.log(`[Quiz Saved] Record ID: ${quizRecord._id}`);
        } catch (saveError) {
            console.error('Database error while saving quiz attempt:', saveError);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        // Step 2: Call Gemini API
        let aiResult;
        let geminiResponseText = '';
        try {
            if (quizType === '10th') {
                // Call Gemini for Class 10 quiz
                console.log('[Gemini] Processing Class 10 quiz...');
                aiResult = await geminiService.processClass10Quiz(responses);
                geminiResponseText = JSON.stringify(aiResult);
                console.log('[Gemini] Class 10 result:', aiResult);
            } else if (quizType === 'career') {
                // Call Gemini for Career quiz
                console.log('[Gemini] Processing Career quiz...');
                aiResult = await geminiService.processClass12Quiz(responses, stream);
                geminiResponseText = JSON.stringify(aiResult);
                console.log('[Gemini] Career result:', aiResult);
            }
        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);
            return res.status(500).json({
                success: false,
                message: "Gemini error"
            });
        }

        // Step 3: Update MongoDB record with Gemini response
        try {
            await QuizAttemptModel.findByIdAndUpdate(quizRecord._id, {
                result: {
                    recommendedStream: aiResult.recommendedStream,
                    topCourses: aiResult.topCourses || [],
                    aiInsights: aiResult.aiInsights
                },
                geminiResponse: geminiResponseText
            });
            console.log('[Database] Updated quiz record with Gemini response');
        } catch (updateError) {
            console.error('Database error while updating quiz with Gemini response:', updateError);
            // Don't fail the request - we have the AI result, just couldn't update DB
        }

        // Step 4: Return success response with Gemini AI suggestions
        const response = {
            success: true,
            message: `${quizType === '10th' ? 'Class 10' : 'Career'} quiz processed successfully`,
            suggestions: {
                recommendedStream: aiResult.recommendedStream,
                topCourses: aiResult.topCourses || [],
                aiInsights: aiResult.aiInsights
            }
        };

        console.log('[Success] Returning response to frontend');
        res.json(response);

    } catch (error) {
        console.error('Unexpected error in quiz submission:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while processing quiz"
        });
    }
});

// GET /api/quiz/attempts - Get user's quiz attempts (optimized)
quizRouter.get("/attempts", userAuth, async (req, res) => {
    const startTime = Date.now();
    
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 items
        const skip = (page - 1) * limit;

        // Optimized query with lean() for better performance
        const attempts = await QuizAttemptModel.find({ userId })
            .sort({ timestamp: -1 })
            .select('quizType result.recommendedStream timestamp -_id') // Only select needed fields
            .lean() // Return plain JS objects
            .skip(skip)
            .limit(limit);

        const responseTime = Date.now() - startTime;
        console.log(`[Quiz Attempts] Fetched ${attempts.length} attempts in ${responseTime}ms`);

        res.json({
            success: true,
            message: "Quiz attempts retrieved successfully",
            attempts: attempts,
            pagination: {
                page,
                limit,
                count: attempts.length
            },
            responseTime: `${responseTime}ms`
        });

    } catch (error) {
        console.error(`[Error] Quiz attempts fetch failed in ${Date.now() - startTime}ms:`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching quiz attempts",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = quizRouter;
