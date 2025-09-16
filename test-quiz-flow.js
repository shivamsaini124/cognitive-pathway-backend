// Test script to verify the complete quiz flow
// Run this after starting your backend server

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCompleteQuizFlow() {
    console.log('🧪 Testing Complete Quiz Flow...\n');
    
    try {
        // Step 1: Register a test user
        console.log('1️⃣ Registering test user...');
        const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
            firstName: 'Test',
            lastName: 'Student',
            email: 'test@student.com',
            password: 'password123'
        });
        console.log('✅ User registered successfully');

        // Step 2: Login to get token
        console.log('\n2️⃣ Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'test@student.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');

        // Step 3: Get Class 10 quiz questions
        console.log('\n3️⃣ Fetching Class 10 quiz questions...');
        const questionsResponse = await axios.get(`${BASE_URL}/quiz/class10`);
        const questions = questionsResponse.data.questions;
        console.log(`✅ Retrieved ${questions.length} questions`);
        console.log('First question:', questions[0].question);

        // Step 4: Submit Class 10 quiz (sample answers)
        console.log('\n4️⃣ Submitting Class 10 quiz...');
        const sampleAnswers = [
            'Mathematics',
            'Problem solving and calculations', 
            'Doctor/Engineer',
            'Hands-on experiments',
            'Solving complex problems',
            'Technical skills'
        ];

        const class10Response = await axios.post(`${BASE_URL}/quiz/class10/submit`, {
            answers: sampleAnswers
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Class 10 Quiz Results:');
        console.log('📊 Recommended Stream:', class10Response.data.recommendedStream);
        console.log('💡 AI Insights:', class10Response.data.aiInsights.substring(0, 100) + '...');

        // Step 5: Get Class 12 quiz questions
        console.log('\n5️⃣ Fetching Class 12 quiz questions...');
        const class12QuestionsResponse = await axios.get(`${BASE_URL}/quiz/class12`);
        const class12Questions = class12QuestionsResponse.data.questions;
        console.log(`✅ Retrieved ${class12Questions.length} questions`);

        // Step 6: Submit Class 12 quiz
        console.log('\n6️⃣ Submitting Class 12 quiz...');
        const class12Answers = [
            'Office/Corporate',
            'Mathematics and Logic',
            'Technology and Engineering', 
            'Very important',
            'Solve technical problems',
            'Intensive focused study'
        ];

        const class12Response = await axios.post(`${BASE_URL}/quiz/class12/submit`, {
            answers: class12Answers,
            stream: 'Science'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Class 12 Quiz Results:');
        console.log('📊 Recommended Stream:', class12Response.data.recommendedStream);
        console.log('📚 Top Courses:', class12Response.data.topCourses);
        console.log('💡 AI Insights:', class12Response.data.aiInsights.substring(0, 100) + '...');

        console.log('\n🎉 Complete quiz flow test successful!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCompleteQuizFlow();
