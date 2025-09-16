const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, index: true},
    password: String,
    createdAt: { type: Date, default: Date.now }
});


const UserModel = mongoose.model("user", userSchema);

// Quiz Question Schema
const quizQuestionSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    quizType: { type: String, enum: ['class10', 'class12'], required: true, index: true },
    createdAt: { type: Date, default: Date.now }
});

// Create compound index for better performance
quizQuestionSchema.index({ quizType: 1, createdAt: 1 });

const QuizQuestionModel = mongoose.model("quizQuestion", quizQuestionSchema);

// Course Schema
const courseSchema = new Schema({
    name: { type: String, required: true },
    stream: { type: String, required: true },
    description: { type: String, required: true },
    careers: [{ type: String }],
    duration: String,
    eligibility: String,
    createdAt: { type: Date, default: Date.now }
});

const CourseModel = mongoose.model("course", courseSchema);

// College Schema
const collegeSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    programs: [{ type: String }],
    facilities: [{ type: String }],
    type: String, // Government, Private, etc.
    ranking: Number,
    createdAt: { type: Date, default: Date.now }
});

const CollegeModel = mongoose.model("college", collegeSchema);

// Timeline Schema
const timelineSchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'general' }, // exam, admission, etc.
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const TimelineModel = mongoose.model("timeline", timelineSchema);

// Quiz Attempt Schema (Optional)
const quizAttemptSchema = new Schema({
    userId: { type: ObjectId, ref: 'user', required: true, index: true },
    quizType: { type: String, enum: ['class10', 'class12', '10th', 'career'], required: true, index: true },
    answers: [{ type: String }],
    result: {
        recommendedStream: String,
        topCourses: [String],
        aiInsights: String
    },
    geminiResponse: {
        type: String,
        default: null
    },
    timestamp: { type: Date, default: Date.now, index: true }
});

// Create compound indexes for better performance
quizAttemptSchema.index({ userId: 1, timestamp: -1 });
quizAttemptSchema.index({ quizType: 1, timestamp: -1 });

const QuizAttemptModel = mongoose.model("quizAttempt", quizAttemptSchema);

module.exports = {
    UserModel,
    QuizQuestionModel,
    CourseModel,
    CollegeModel,
    TimelineModel,
    QuizAttemptModel
};
