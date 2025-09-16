require("dotenv").config();
const mongoose = require("mongoose");
const { 
    QuizQuestionModel, 
    CourseModel, 
    CollegeModel, 
    TimelineModel 
} = require("../db");

const DB_URL = process.env.DB_URL;

const seedData = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB");

        // Clear existing data
        await Promise.all([
            QuizQuestionModel.deleteMany({}),
            CourseModel.deleteMany({}),
            CollegeModel.deleteMany({}),
            TimelineModel.deleteMany({})
        ]);
        console.log("Cleared existing data");

        // Seed Quiz Questions for Class 10
        const class10Questions = [
            {
                question: "Which subject do you enjoy the most?",
                options: ["Mathematics", "Science", "Social Studies", "Languages", "Arts"],
                quizType: "class10"
            },
            {
                question: "What type of activities interest you the most?",
                options: ["Problem solving and calculations", "Experiments and research", "Reading and writing", "Creative activities", "Business and economics"],
                quizType: "class10"
            },
            {
                question: "What is your career goal?",
                options: ["Doctor/Engineer", "Teacher/Professor", "Business owner", "Artist/Designer", "Government officer"],
                quizType: "class10"
            },
            {
                question: "How do you prefer to learn?",
                options: ["Hands-on experiments", "Theoretical concepts", "Group discussions", "Visual presentations", "Individual study"],
                quizType: "class10"
            },
            {
                question: "What motivates you the most?",
                options: ["Solving complex problems", "Helping others", "Financial success", "Creative expression", "Recognition and status"],
                quizType: "class10"
            },
            {
                question: "Which skill do you want to develop further?",
                options: ["Analytical thinking", "Communication", "Leadership", "Creativity", "Technical skills"],
                quizType: "class10"
            }
        ];

        // Seed Quiz Questions for Class 12
        const class12Questions = [
            {
                question: "What type of work environment do you prefer?",
                options: ["Office/Corporate", "Laboratory/Research", "Field work", "Creative studio", "Hospital/Clinic"],
                quizType: "class12"
            },
            {
                question: "What are your strongest skills?",
                options: ["Mathematics and Logic", "Science and Research", "Communication", "Leadership", "Creative thinking"],
                quizType: "class12"
            },
            {
                question: "Which career path appeals to you most?",
                options: ["Technology and Engineering", "Healthcare", "Business and Management", "Education", "Arts and Media"],
                quizType: "class12"
            },
            {
                question: "How important is work-life balance to you?",
                options: ["Very important", "Somewhat important", "Not very important", "Depends on the career", "I prefer challenging work"],
                quizType: "class12"
            },
            {
                question: "What type of impact do you want to make?",
                options: ["Solve technical problems", "Help people directly", "Build businesses", "Educate others", "Create and inspire"],
                quizType: "class12"
            },
            {
                question: "What is your preferred study approach?",
                options: ["Intensive focused study", "Practical application", "Research and analysis", "Collaborative learning", "Self-paced learning"],
                quizType: "class12"
            }
        ];

        await QuizQuestionModel.insertMany([...class10Questions, ...class12Questions]);
        console.log("Seeded quiz questions");

        // Seed Courses
        const courses = [
            // Science Stream Courses
            {
                name: "Computer Science Engineering",
                stream: "Science",
                description: "Study of algorithms, programming, software development, and computer systems",
                careers: ["Software Developer", "Data Scientist", "System Administrator", "AI Engineer"],
                duration: "4 years",
                eligibility: "Class 12 with Physics, Chemistry, Mathematics"
            },
            {
                name: "Mechanical Engineering",
                stream: "Science",
                description: "Design, analysis, and manufacturing of mechanical systems and machines",
                careers: ["Mechanical Engineer", "Design Engineer", "Production Manager", "Automotive Engineer"],
                duration: "4 years",
                eligibility: "Class 12 with Physics, Chemistry, Mathematics"
            },
            {
                name: "MBBS (Bachelor of Medicine and Surgery)",
                stream: "Science",
                description: "Comprehensive medical education to become a doctor",
                careers: ["Doctor", "Surgeon", "Medical Researcher", "Healthcare Administrator"],
                duration: "5.5 years",
                eligibility: "Class 12 with Physics, Chemistry, Biology"
            },
            {
                name: "Pharmacy (B.Pharm)",
                stream: "Science",
                description: "Study of drug composition, preparation, and dispensing",
                careers: ["Pharmacist", "Drug Inspector", "Medical Representative", "Research Scientist"],
                duration: "4 years",
                eligibility: "Class 12 with Physics, Chemistry, Biology/Mathematics"
            },
            {
                name: "Information Technology",
                stream: "Science",
                description: "Focus on computer systems, networks, and information management",
                careers: ["IT Specialist", "Network Administrator", "Cybersecurity Analyst", "Web Developer"],
                duration: "4 years",
                eligibility: "Class 12 with Physics, Chemistry, Mathematics"
            },

            // Commerce Stream Courses
            {
                name: "Bachelor of Commerce (B.Com)",
                stream: "Commerce",
                description: "Comprehensive study of commerce, accounting, and business principles",
                careers: ["Accountant", "Financial Analyst", "Tax Consultant", "Business Analyst"],
                duration: "3 years",
                eligibility: "Class 12 with Commerce subjects"
            },
            {
                name: "Bachelor of Business Administration (BBA)",
                stream: "Commerce",
                description: "Management and business administration skills",
                careers: ["Business Manager", "HR Executive", "Marketing Manager", "Operations Manager"],
                duration: "3 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Chartered Accountancy (CA)",
                stream: "Commerce",
                description: "Professional course in accounting, taxation, and auditing",
                careers: ["Chartered Accountant", "Financial Advisor", "Tax Consultant", "Auditor"],
                duration: "3-5 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Company Secretary (CS)",
                stream: "Commerce",
                description: "Corporate governance and company law specialization",
                careers: ["Company Secretary", "Compliance Officer", "Legal Advisor", "Corporate Consultant"],
                duration: "3 years",
                eligibility: "Class 12 any stream"
            },

            // Arts Stream Courses
            {
                name: "Bachelor of Arts (BA)",
                stream: "Arts",
                description: "Liberal arts education covering humanities and social sciences",
                careers: ["Teacher", "Journalist", "Social Worker", "Government Officer"],
                duration: "3 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Bachelor of Fine Arts (BFA)",
                stream: "Arts",
                description: "Creative arts including painting, sculpture, and design",
                careers: ["Artist", "Graphic Designer", "Art Director", "Illustrator"],
                duration: "3-4 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Journalism and Mass Communication",
                stream: "Arts",
                description: "Media, communication, and journalism studies",
                careers: ["Journalist", "News Anchor", "Content Writer", "Media Manager"],
                duration: "3 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Psychology",
                stream: "Arts",
                description: "Study of human behavior and mental processes",
                careers: ["Psychologist", "Counselor", "Therapist", "Research Analyst"],
                duration: "3 years",
                eligibility: "Class 12 any stream"
            },
            {
                name: "Law (LLB)",
                stream: "Arts",
                description: "Legal studies and jurisprudence",
                careers: ["Lawyer", "Judge", "Legal Advisor", "Corporate Counsel"],
                duration: "3-5 years",
                eligibility: "Graduation or Class 12"
            }
        ];

        await CourseModel.insertMany(courses);
        console.log("Seeded courses");

        // Seed Colleges
        const colleges = [
            {
                name: "Indian Institute of Technology Delhi",
                location: "New Delhi",
                programs: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering"],
                facilities: ["Library", "Hostels", "Sports Complex", "Research Labs"],
                type: "Government",
                ranking: 1
            },
            {
                name: "Indian Institute of Management Ahmedabad",
                location: "Ahmedabad",
                programs: ["MBA", "Management Studies", "Business Analytics"],
                facilities: ["Modern Campus", "Industry Connections", "Placement Cell", "Library"],
                type: "Government",
                ranking: 2
            },
            {
                name: "All India Institute of Medical Sciences Delhi",
                location: "New Delhi",
                programs: ["MBBS", "MD", "MS", "Nursing"],
                facilities: ["Hospital", "Medical Labs", "Research Centers", "Hostels"],
                type: "Government",
                ranking: 1
            },
            {
                name: "Delhi University",
                location: "New Delhi",
                programs: ["BA", "B.Com", "B.Sc", "MA", "M.Com"],
                facilities: ["Multiple Colleges", "Library", "Sports Facilities", "Cultural Centers"],
                type: "Government",
                ranking: 5
            },
            {
                name: "Manipal Institute of Technology",
                location: "Manipal",
                programs: ["Engineering", "Medicine", "Management", "Pharmacy"],
                facilities: ["Modern Labs", "Hostels", "Sports Complex", "Industry Partnerships"],
                type: "Private",
                ranking: 15
            },
            {
                name: "Christ University",
                location: "Bangalore",
                programs: ["Engineering", "Management", "Arts", "Science"],
                facilities: ["Digital Campus", "International Programs", "Research Centers", "Hostels"],
                type: "Private",
                ranking: 20
            },
            {
                name: "Jadavpur University",
                location: "Kolkata",
                programs: ["Engineering", "Arts", "Science", "Management"],
                facilities: ["Research Labs", "Library", "Cultural Activities", "Industry Connect"],
                type: "Government",
                ranking: 12
            },
            {
                name: "National Institute of Fashion Technology Delhi",
                location: "New Delhi",
                programs: ["Fashion Design", "Fashion Management", "Textile Design"],
                facilities: ["Design Studios", "Fashion Labs", "Industry Connections", "Exhibition Spaces"],
                type: "Government",
                ranking: 1
            }
        ];

        await CollegeModel.insertMany(colleges);
        console.log("Seeded colleges");

        // Seed Timeline Events
        const now = new Date();
        const timelineEvents = [
            {
                title: "JEE Main 2024 Registration",
                date: new Date(2024, 11, 15),
                description: "Registration opens for JEE Main 2024 examination",
                category: "exam"
            },
            {
                title: "NEET 2024 Application Deadline",
                date: new Date(2024, 11, 30),
                description: "Last date to apply for NEET 2024 medical entrance exam",
                category: "exam"
            },
            {
                title: "CBSE Class 12 Board Exam",
                date: new Date(2024, 1, 15),
                description: "CBSE Class 12 board examinations begin",
                category: "exam"
            },
            {
                title: "College Admission Counseling",
                date: new Date(2024, 5, 1),
                description: "Counseling process for various college admissions",
                category: "admission"
            },
            {
                title: "Engineering College Admission",
                date: new Date(2024, 6, 15),
                description: "Admission process starts for engineering colleges",
                category: "admission"
            },
            {
                title: "Scholarship Application Deadline",
                date: new Date(2024, 3, 30),
                description: "Last date to apply for merit-based scholarships",
                category: "scholarship"
            },
            {
                title: "Career Guidance Workshop",
                date: new Date(2024, 2, 10),
                description: "Interactive workshop on career planning and guidance",
                category: "general"
            },
            {
                title: "CAT 2024 Registration",
                date: new Date(2024, 7, 1),
                description: "Common Admission Test registration for MBA programs",
                category: "exam"
            },
            {
                title: "University Application Deadline",
                date: new Date(2024, 4, 20),
                description: "Final date for university application submissions",
                category: "admission"
            },
            {
                title: "Education Fair 2024",
                date: new Date(2024, 8, 5),
                description: "Annual education fair with college representatives",
                category: "general"
            }
        ];

        await TimelineModel.insertMany(timelineEvents);
        console.log("Seeded timeline events");

        console.log("✅ Database seeding completed successfully!");
        console.log(`
        Data Summary:
        - Quiz Questions: ${class10Questions.length + class12Questions.length}
        - Courses: ${courses.length}
        - Colleges: ${colleges.length}
        - Timeline Events: ${timelineEvents.length}
        `);

    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Run the seed function
seedData();
