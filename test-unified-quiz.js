const axios = require('axios');

// Test data for different quiz types
const testData = {
  // Test Class 10 quiz submission
  class10Quiz: {
    quizType: '10th',
    responses: [
      'I enjoy solving mathematical problems',
      'Science subjects are interesting to me',
      'I like conducting experiments',
      'Technology fascinates me',
      'I prefer logical thinking over creative writing'
    ]
  },
  
  // Test Career quiz submission
  careerQuiz: {
    quizType: 'career', 
    responses: [
      'I am good at programming',
      'I enjoy working with computers',
      'Problem solving is my strength',
      'I like building software applications',
      'Technology career appeals to me'
    ],
    stream: 'Science'
  }
};

const API_BASE_URL = 'http://localhost:3000';

// Note: You'll need a valid JWT token for testing
// Set this to a real JWT token before running tests
const AUTH_TOKEN = process.env.TEST_JWT_TOKEN || null;

async function testUnifiedQuizSubmission() {
  console.log('🧪 Testing Unified Quiz Submission Endpoint\n');
  
  if (!AUTH_TOKEN || AUTH_TOKEN === 'your-jwt-token-here') {
    console.error('❌ No valid AUTH_TOKEN provided. Please set TEST_JWT_TOKEN environment variable or update the AUTH_TOKEN constant.');
    return;
  }
  
  try {
    // Test Class 10 Quiz
    console.log('📝 Testing Class 10 Quiz Submission...');
    const class10Response = await axios.post(
      `${API_BASE_URL}/api/quiz/submit-quiz`,
      testData.class10Quiz,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Class 10 Quiz Response:');
    console.log(JSON.stringify(class10Response.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test Career Quiz
    console.log('🎯 Testing Career Quiz Submission...');
    const careerResponse = await axios.post(
      `${API_BASE_URL}/api/quiz/submit-quiz`,
      testData.careerQuiz,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Career Quiz Response:');
    console.log(JSON.stringify(careerResponse.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test error scenarios
async function testErrorScenarios() {
  console.log('🔍 Testing Error Scenarios\n');
  
  if (!AUTH_TOKEN || AUTH_TOKEN === 'your-jwt-token-here') {
    console.error('❌ No valid AUTH_TOKEN provided. Skipping error scenario tests.');
    return;
  }
  
  const errorTests = [
    {
      name: 'Invalid Quiz Type',
      data: { quizType: 'invalid', responses: ['test'] }
    },
    {
      name: 'Missing Responses',
      data: { quizType: '10th', responses: [] }
    },
    {
      name: 'Career Quiz without Stream',
      data: { quizType: 'career', responses: ['test'] }
    },
    {
      name: 'Missing Quiz Type',
      data: { responses: ['test'] }
    }
  ];
  
  for (const test of errorTests) {
    try {
      console.log(`Testing: ${test.name}`);
      await axios.post(
        `${API_BASE_URL}/api/quiz/submit-quiz`,
        test.data,
        {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('❌ Expected error but got success');
    } catch (error) {
      console.log('✅ Correctly returned error:', error.response?.data?.message);
    }
    console.log('');
  }
}

// Run tests if executed directly
if (require.main === module) {
  console.log('🚀 Starting Quiz Submission Tests\n');
  console.log('⚠️  Make sure to:');
  console.log('   1. Start your backend server (npm run dev)');
  console.log('   2. Set TEST_JWT_TOKEN environment variable or update AUTH_TOKEN');
  console.log('   3. Ensure MongoDB is running\n');
  
  // Safety check to prevent accidental execution
  if (!process.env.RUN_TESTS) {
    console.log('🚨 Tests are disabled by default to prevent accidental execution.');
    console.log('To run tests, set RUN_TESTS=true environment variable:');
    console.log('   RUN_TESTS=true node test-unified-quiz.js');
    process.exit(0);
  }
  
  // Uncomment to run tests (after setting up AUTH_TOKEN)
  // testUnifiedQuizSubmission();
  // testErrorScenarios();
}

module.exports = {
  testUnifiedQuizSubmission,
  testErrorScenarios,
  testData
};
