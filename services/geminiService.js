const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async processClass10Quiz(answers) {
        const prompt = `
        You are an educational counselor analyzing Class 10 student responses to help recommend the best stream for Class 11 and 12.

        Student's quiz answers: ${JSON.stringify(answers)}

        Based on these answers, provide recommendations in JSON format:
        {
            "recommendedStream": "Science/Commerce/Arts",
            "aiInsights": "Detailed explanation of why this stream is recommended, including strengths identified, career prospects, and motivational guidance. Keep it encouraging and specific to the student's responses."
        }

        Consider the following streams:
        - Science: For students interested in mathematics, physics, chemistry, biology, engineering, medicine
        - Commerce: For students interested in business, economics, accounting, entrepreneurship
        - Arts/Humanities: For students interested in languages, social sciences, psychology, history, literature

        Provide specific, encouraging, and actionable insights.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback if JSON parsing fails
            return this.getFallbackClass10Response();
            
        } catch (error) {
            console.error('Gemini API error for Class 10:', error);
            return this.getFallbackClass10Response();
        }
    }

    async processClass12Quiz(answers, currentStream) {
        const prompt = `
        You are an educational counselor analyzing Class 12 student responses to recommend courses and career paths.

        Student's current stream: ${currentStream}
        Student's quiz answers: ${JSON.stringify(answers)}

        Based on these answers, provide recommendations in JSON format:
        {
            "recommendedStream": "Specific stream or specialization recommendation",
            "topCourses": ["Course 1", "Course 2", "Course 3", "Course 4", "Course 5"],
            "aiInsights": "Detailed explanation of course recommendations, career prospects, skills identified, and motivational guidance. Include specific next steps and preparation advice."
        }

        Consider popular courses like:
        - Engineering (Computer Science, Mechanical, Electrical, Civil, etc.)
        - Medical (MBBS, BDS, Nursing, Pharmacy, etc.)
        - Commerce (B.Com, BBA, CA, CS, etc.)
        - Arts (BA, Psychology, Journalism, Design, etc.)
        - Law, Management, etc.

        Provide specific, encouraging, and actionable insights with clear next steps.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback if JSON parsing fails
            return this.getFallbackClass12Response();
            
        } catch (error) {
            console.error('Gemini API error for Class 12:', error);
            return this.getFallbackClass12Response();
        }
    }

    getFallbackClass10Response() {
        return {
            recommendedStream: "Science",
            aiInsights: "Based on your responses, Science stream offers diverse opportunities in engineering, medicine, and research. Consider your interests in mathematics and problem-solving. Take time to explore different career paths and speak with professionals in fields that interest you."
        };
    }

    getFallbackClass12Response() {
        return {
            recommendedStream: "Engineering",
            topCourses: [
                "Computer Science Engineering",
                "Information Technology",
                "Mechanical Engineering",
                "Electronics Engineering",
                "Business Administration"
            ],
            aiInsights: "AI insights not available at the moment. Consider exploring engineering and technology fields which offer excellent career prospects. Focus on developing both technical and communication skills for better opportunities."
        };
    }

    // Method to get fallback recommendations from database if needed
    async getFallbackFromDB(stream = null) {
        // This could query the database for default recommendations
        // Implementation depends on your specific fallback strategy
        return stream === 'class12' ? this.getFallbackClass12Response() : this.getFallbackClass10Response();
    }
}

module.exports = new GeminiService();
