const { Router } = require("express");
const { CourseModel } = require("../db");

const coursesRouter = Router();

// GET /api/courses - Get all courses with optional stream filter
coursesRouter.get("/", async (req, res) => {
    try {
        const { stream, limit, page } = req.query;
        
        // Build query object
        const query = {};
        if (stream) {
            // Case-insensitive search for stream
            query.stream = new RegExp(stream, 'i');
        }

        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        // Execute query
        const courses = await CourseModel.find(query)
            .select('-__v')
            .sort({ name: 1 })
            .limit(limitNumber)
            .skip(skip);

        // Get total count for pagination
        const totalCourses = await CourseModel.countDocuments(query);

        res.json({
            message: "Courses retrieved successfully",
            count: courses.length,
            totalCourses: totalCourses,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCourses / limitNumber),
            courses: courses
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            message: "Internal server error while fetching courses"
        });
    }
});

// GET /api/courses/streams - Get all available streams
coursesRouter.get("/streams", async (req, res) => {
    try {
        const streams = await CourseModel.distinct("stream");
        
        res.json({
            message: "Available streams retrieved successfully",
            streams: streams.sort()
        });

    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(500).json({
            message: "Internal server error while fetching streams"
        });
    }
});

// GET /api/courses/:id - Get specific course by ID
coursesRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const course = await CourseModel.findById(id).select('-__v');
        
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.json({
            message: "Course retrieved successfully",
            course: course
        });

    } catch (error) {
        console.error('Error fetching course:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid course ID format"
            });
        }
        
        res.status(500).json({
            message: "Internal server error while fetching course"
        });
    }
});

// GET /api/courses/search/:searchTerm - Search courses by name or description
coursesRouter.get("/search/:searchTerm", async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const { limit, page } = req.query;
        
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        // Search in name and description
        const searchQuery = {
            $or: [
                { name: new RegExp(searchTerm, 'i') },
                { description: new RegExp(searchTerm, 'i') },
                { careers: { $in: [new RegExp(searchTerm, 'i')] } }
            ]
        };

        const courses = await CourseModel.find(searchQuery)
            .select('-__v')
            .sort({ name: 1 })
            .limit(limitNumber)
            .skip(skip);

        const totalCourses = await CourseModel.countDocuments(searchQuery);

        res.json({
            message: `Search results for "${searchTerm}"`,
            searchTerm: searchTerm,
            count: courses.length,
            totalCourses: totalCourses,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCourses / limitNumber),
            courses: courses
        });

    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({
            message: "Internal server error while searching courses"
        });
    }
});

module.exports = coursesRouter;
