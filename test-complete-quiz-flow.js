const axios = require('axios');
const mongoose = require('mongoose');

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpass123';

// Test data
const TEST_CLASS_10_ANSWERS = [
    'I enjoy solving mathematical problems and logical puzzles',
    'Science subjects like Physics and Chemistry fascinate me',
    'I like conducting experiments and understanding how things work',
    'I prefer analytical thinking over creative arts',
    'Technology and innovation interest me greatly'
];

const TEST_CAREER_ANSWERS = [
    'I am passionate about computer programming',
    'I enjoy working with data and algorithms',
    'Problem-solving using technology is my strength',
    'I like building software applications',
    'Career in technology field appeals to me'
];

let authToken = '';

// Helper function to create/login user
async function authenticateUser() {
    try {
        console.log('🔐 Authenticating test user...');
        
        // Try to register first
        try {
            await axios.post(`${API_BASE_URL}/api/users/register`, {
                firstName: 'Test',
                lastName: 'User',
                email: TEST_USER_EMAIL,
                password: TEST_USER_PASSWORD
            });
            console.log('✅ User registered successfully');
        } catch (regError) {
            // User might already exist, that's okay
            console.log('ℹ️  User might already exist, trying login...');
        }
        
        // Login
        const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD
        });
        
        authToken = loginResponse.data.token;
        console.log('✅ User authenticated successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
        return false;
    }
}

// Test Class 10 Quiz Submission
async function testClass10Quiz() {
    console.log('\n📝 Testing Class 10 Quiz Submission...');
    console.log('Answers being sent:', TEST_CLASS_10_ANSWERS);
    
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/quiz/submit-quiz`,
            {
                quizType: '10th',
                responses: TEST_CLASS_10_ANSWERS
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Class 10 Quiz Response Status:', response.status);
        console.log('✅ Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Validate response structure
        if (response.data.success && 
            response.data.suggestions && 
            response.data.suggestions.recommendedStream && 
            response.data.suggestions.aiInsights) {
            console.log('✅ Class 10 Quiz - All required fields present');
            return true;
        } else {
            console.log('❌ Class 10 Quiz - Missing required response fields');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Class 10 Quiz failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        return false;
    }
}

// Test Career Quiz Submission
async function testCareerQuiz() {
    console.log('\n🎯 Testing Career Quiz Submission...');
    console.log('Answers being sent:', TEST_CAREER_ANSWERS);
    console.log('Stream:', 'Science');
    
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/quiz/submit-quiz`,
            {
                quizType: 'career',
                responses: TEST_CAREER_ANSWERS,
                stream: 'Science'
            },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Career Quiz Response Status:', response.status);
        console.log('✅ Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Validate response structure
        if (response.data.success && 
            response.data.suggestions && 
            response.data.suggestions.recommendedStream && 
            response.data.suggestions.topCourses && 
            response.data.suggestions.aiInsights) {
            console.log('✅ Career Quiz - All required fields present');
            return true;
        } else {
            console.log('❌ Career Quiz - Missing required response fields');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Career Quiz failed:');
        console.error('Status:', error.response?.status);
        console.error('Error:', error.response?.data || error.message);
        return false;
    }
}

// Test Error Scenarios
async function testErrorScenarios() {
    console.log('\n🔍 Testing Error Scenarios...');
    
    const errorTests = [
        {
            name: 'Invalid Quiz Type',
            data: { quizType: 'invalid', responses: ['test'] },
            expectedError: true
        },
        {
            name: 'Missing Responses',
            data: { quizType: '10th', responses: [] },
            expectedError: true
        },
        {
            name: 'Career Quiz without Stream',
            data: { quizType: 'career', responses: ['test'] },
            expectedError: true
        },
        {
            name: 'Missing Quiz Type',
            data: { responses: ['test'] },
            expectedError: true
        }
    ];
    
    let errorTestsPassed = 0;
    
    for (const test of errorTests) {
        try {
            console.log(`\nTesting: ${test.name}`);
            const response = await axios.post(
                `${API_BASE_URL}/api/quiz/submit-quiz`,
                test.data,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (test.expectedError) {
                console.log('❌ Expected error but got success');
            } else {
                console.log('✅ Unexpected success - might be valid');
                errorTestsPassed++;
            }
        } catch (error) {
            if (test.expectedError) {
                console.log('✅ Correctly returned error:', error.response?.data?.message);
                errorTestsPassed++;
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message);
            }
        }
    }
    
    console.log(`\n📊 Error Tests Result: ${errorTestsPassed}/${errorTests.length} passed`);
    return errorTestsPassed === errorTests.length;
}

// Test database record creation
async function testDatabaseRecords() {
    console.log('\n💾 Testing Database Records...');
    
    try {
        // Connect to MongoDB to check records
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cognitive-pathways');
        
        const { QuizAttemptModel } = require('./db');
        
        // Find recent quiz attempts
        const recentAttempts = await QuizAttemptModel.find()
            .sort({ timestamp: -1 })
            .limit(10);
            
        console.log(`✅ Found ${recentAttempts.length} quiz attempts in database`);
        
        // Check the most recent attempts
        for (let i = 0; i < Math.min(2, recentAttempts.length); i++) {
            const attempt = recentAttempts[i];
            console.log(`\n📋 Quiz Attempt ${i + 1}:`);
            console.log('  - Quiz Type:', attempt.quizType);
            console.log('  - Answers Count:', attempt.answers.length);
            console.log('  - Has Gemini Response:', !!attempt.geminiResponse);
            console.log('  - Recommended Stream:', attempt.result?.recommendedStream);
            console.log('  - AI Insights Length:', attempt.result?.aiInsights?.length || 0);
        }
        
        await mongoose.disconnect();
        return true;
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        return false;
    }
}

// Main test runner
async function runCompleteTest() {
    console.log('🚀 Starting Complete Quiz Submission Flow Test');
    console.log('================================================\n');
    
    // Check if server is running
    try {
        await axios.get(`${API_BASE_URL}/api/quiz/class10`);
        console.log('✅ Backend server is running');
    } catch (error) {
        console.error('❌ Backend server is not running. Start it with: npm run dev');
        return;
    }
    
    const results = {
        auth: false,
        class10: false,
        career: false,
        errors: false,
        database: false
    };
    
    // Run tests
    results.auth = await authenticateUser();
    if (results.auth) {
        results.class10 = await testClass10Quiz();
        results.career = await testCareerQuiz();
        results.errors = await testErrorScenarios();
        results.database = await testDatabaseRecords();
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('🔐 Authentication:', results.auth ? '✅ PASS' : '❌ FAIL');
    console.log('📝 Class 10 Quiz:', results.class10 ? '✅ PASS' : '❌ FAIL');
    console.log('🎯 Career Quiz:', results.career ? '✅ PASS' : '❌ FAIL');
    console.log('🔍 Error Handling:', results.errors ? '✅ PASS' : '❌ FAIL');
    console.log('💾 Database Records:', results.database ? '✅ PASS' : '❌ FAIL');
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎉 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎊 ALL TESTS PASSED! Quiz submission flow is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the errors above.');
    }
}

// Frontend integration example
function showFrontendExample() {
    console.log('\n' + '='.repeat(50));
    console.log('📱 FRONTEND INTEGRATION EXAMPLE');
    console.log('='.repeat(50));
    console.log(`
// In your React component:
import { apiEndpoints } from '../services/api';

const handleSubmit = async () => {
  try {
    const response = await apiEndpoints.submitQuiz('10th', answers);
    
    if (response.data.success) {
      // Show Gemini's recommendations
      setResults({
        recommendedStream: response.data.suggestions.recommendedStream,
        aiInsights: response.data.suggestions.aiInsights,
        topCourses: response.data.suggestions.topCourses // for career quiz
      });
    }
  } catch (error) {
    // Handle errors
    if (error.response?.data?.message === 'Database error') {
      alert('Failed to save quiz. Please try again.');
    } else if (error.response?.data?.message === 'Gemini error') {
      alert('AI analysis unavailable. Please try again.');
    }
  }
};
`);
}

// Run tests if executed directly
if (require.main === module) {
    runCompleteTest().then(() => {
        showFrontendExample();
        process.exit(0);
    }).catch(error => {
        console.error('💥 Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runCompleteTest,
    testClass10Quiz,
    testCareerQuiz,
    testErrorScenarios
};
