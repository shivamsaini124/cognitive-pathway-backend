const { Router } = require("express");
const { TimelineModel } = require("../db");

const timelineRouter = Router();

// GET /api/timeline - Get all timeline events
timelineRouter.get("/", async (req, res) => {
    try {
        const { category, upcoming, limit, page } = req.query;
        
        // Build query object
        const query = { isActive: true };
        
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        
        if (upcoming === 'true') {
            query.date = { $gte: new Date() };
        }

        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        // Execute query
        const events = await TimelineModel.find(query)
            .select('-__v')
            .sort({ date: 1 }) // Sort by date ascending (nearest first)
            .limit(limitNumber)
            .skip(skip);

        // Get total count for pagination
        const totalEvents = await TimelineModel.countDocuments(query);

        res.json({
            message: "Timeline events retrieved successfully",
            count: events.length,
            totalEvents: totalEvents,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalEvents / limitNumber),
            events: events
        });

    } catch (error) {
        console.error('Error fetching timeline events:', error);
        res.status(500).json({
            message: "Internal server error while fetching timeline events"
        });
    }
});

// GET /api/timeline/upcoming - Get upcoming events (next 30 days)
timelineRouter.get("/upcoming", async (req, res) => {
    try {
        const { limit } = req.query;
        const limitNumber = parseInt(limit) || 10;
        
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const events = await TimelineModel.find({
            isActive: true,
            date: { 
                $gte: now,
                $lte: thirtyDaysFromNow
            }
        })
        .select('-__v')
        .sort({ date: 1 })
        .limit(limitNumber);

        res.json({
            message: "Upcoming events retrieved successfully",
            count: events.length,
            period: "Next 30 days",
            events: events
        });

    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            message: "Internal server error while fetching upcoming events"
        });
    }
});

// GET /api/timeline/categories - Get all event categories
timelineRouter.get("/categories", async (req, res) => {
    try {
        const categories = await TimelineModel.distinct("category");
        
        res.json({
            message: "Event categories retrieved successfully",
            categories: categories.filter(cat => cat).sort()
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: "Internal server error while fetching categories"
        });
    }
});

// GET /api/timeline/:id - Get specific timeline event by ID
timelineRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const event = await TimelineModel.findById(id).select('-__v');
        
        if (!event) {
            return res.status(404).json({
                message: "Timeline event not found"
            });
        }

        res.json({
            message: "Timeline event retrieved successfully",
            event: event
        });

    } catch (error) {
        console.error('Error fetching timeline event:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid event ID format"
            });
        }
        
        res.status(500).json({
            message: "Internal server error while fetching timeline event"
        });
    }
});

// GET /api/timeline/month/:year/:month - Get events for specific month
timelineRouter.get("/month/:year/:month", async (req, res) => {
    try {
        const { year, month } = req.params;
        
        // Validate year and month
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                message: "Invalid year or month format"
            });
        }

        // Create date range for the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

        const events = await TimelineModel.find({
            isActive: true,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .select('-__v')
        .sort({ date: 1 });

        res.json({
            message: `Events for ${monthNum}/${yearNum} retrieved successfully`,
            month: monthNum,
            year: yearNum,
            count: events.length,
            events: events
        });

    } catch (error) {
        console.error('Error fetching monthly events:', error);
        res.status(500).json({
            message: "Internal server error while fetching monthly events"
        });
    }
});

// GET /api/timeline/search/:searchTerm - Search timeline events
timelineRouter.get("/search/:searchTerm", async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const { limit, page } = req.query;
        
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        // Search in title and description
        const searchQuery = {
            isActive: true,
            $or: [
                { title: new RegExp(searchTerm, 'i') },
                { description: new RegExp(searchTerm, 'i') },
                { category: new RegExp(searchTerm, 'i') }
            ]
        };

        const events = await TimelineModel.find(searchQuery)
            .select('-__v')
            .sort({ date: 1 })
            .limit(limitNumber)
            .skip(skip);

        const totalEvents = await TimelineModel.countDocuments(searchQuery);

        res.json({
            message: `Search results for "${searchTerm}"`,
            searchTerm: searchTerm,
            count: events.length,
            totalEvents: totalEvents,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalEvents / limitNumber),
            events: events
        });

    } catch (error) {
        console.error('Error searching timeline events:', error);
        res.status(500).json({
            message: "Internal server error while searching timeline events"
        });
    }
});

module.exports = timelineRouter;
