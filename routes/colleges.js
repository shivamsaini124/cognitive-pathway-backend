const { Router } = require("express");
const { CollegeModel } = require("../db");

const collegesRouter = Router();

// GET /api/colleges - Get all colleges with optional location filter
collegesRouter.get("/", async (req, res) => {
    try {
        const { location, type, limit, page } = req.query;
        
        // Build query object
        const query = {};
        if (location) {
            // Case-insensitive search for location
            query.location = new RegExp(location, 'i');
        }
        if (type) {
            // Case-insensitive search for type
            query.type = new RegExp(type, 'i');
        }

        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;

        // Execute query
        const colleges = await CollegeModel.find(query)
            .select('-__v')
            .sort({ ranking: 1, name: 1 })
            .limit(limitNumber)
            .skip(skip);

        // Get total count for pagination
        const totalColleges = await CollegeModel.countDocuments(query);

        res.json({
            message: "Colleges retrieved successfully",
            count: colleges.length,
            totalColleges: totalColleges,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalColleges / limitNumber),
            colleges: colleges
        });

    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({
            message: "Internal server error while fetching colleges"
        });
    }
});

// GET /api/colleges/locations - Get all available locations
collegesRouter.get("/locations", async (req, res) => {
    try {
        const locations = await CollegeModel.distinct("location");
        
        res.json({
            message: "Available locations retrieved successfully",
            locations: locations.sort()
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            message: "Internal server error while fetching locations"
        });
    }
});

// GET /api/colleges/types - Get all college types
collegesRouter.get("/types", async (req, res) => {
    try {
        const types = await CollegeModel.distinct("type");
        
        res.json({
            message: "Available college types retrieved successfully",
            types: types.filter(type => type).sort() // Filter out null/undefined types
        });

    } catch (error) {
        console.error('Error fetching college types:', error);
        res.status(500).json({
            message: "Internal server error while fetching college types"
        });
    }
});

// GET /api/colleges/:id - Get specific college by ID
collegesRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const college = await CollegeModel.findById(id).select('-__v');
        
        if (!college) {
            return res.status(404).json({
                message: "College not found"
            });
        }

        res.json({
            message: "College retrieved successfully",
            college: college
        });

    } catch (error) {
        console.error('Error fetching college:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Invalid college ID format"
            });
        }
        
        res.status(500).json({
            message: "Internal server error while fetching college"
        });
    }
});

// GET /api/colleges/search/:searchTerm - Search colleges by name or programs
collegesRouter.get("/search/:searchTerm", async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const { limit, page } = req.query;
        
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 20;
        const skip = (pageNumber - 1) * limitNumber;

        // Search in name, location, and programs
        const searchQuery = {
            $or: [
                { name: new RegExp(searchTerm, 'i') },
                { location: new RegExp(searchTerm, 'i') },
                { programs: { $in: [new RegExp(searchTerm, 'i')] } },
                { facilities: { $in: [new RegExp(searchTerm, 'i')] } }
            ]
        };

        const colleges = await CollegeModel.find(searchQuery)
            .select('-__v')
            .sort({ ranking: 1, name: 1 })
            .limit(limitNumber)
            .skip(skip);

        const totalColleges = await CollegeModel.countDocuments(searchQuery);

        res.json({
            message: `Search results for "${searchTerm}"`,
            searchTerm: searchTerm,
            count: colleges.length,
            totalColleges: totalColleges,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalColleges / limitNumber),
            colleges: colleges
        });

    } catch (error) {
        console.error('Error searching colleges:', error);
        res.status(500).json({
            message: "Internal server error while searching colleges"
        });
    }
});

// GET /api/colleges/top/:count - Get top colleges by ranking
collegesRouter.get("/top/:count", async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 10;
        
        if (count > 100) {
            return res.status(400).json({
                message: "Maximum count allowed is 100"
            });
        }

        const colleges = await CollegeModel.find({ ranking: { $ne: null } })
            .select('-__v')
            .sort({ ranking: 1 })
            .limit(count);

        res.json({
            message: `Top ${count} colleges retrieved successfully`,
            count: colleges.length,
            colleges: colleges
        });

    } catch (error) {
        console.error('Error fetching top colleges:', error);
        res.status(500).json({
            message: "Internal server error while fetching top colleges"
        });
    }
});

module.exports = collegesRouter;
