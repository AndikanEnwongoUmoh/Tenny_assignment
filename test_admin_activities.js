const mysql = require('mysql2/promise');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sunshine',
  database: 'together_culture',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// First, log in as admin to get a session
async function loginAsAdmin() {
  console.log('Logging in as admin...');
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }),
    credentials: 'include' // Important for cookies
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  console.log('Login successful. Session established.');
  return response.headers.get('set-cookie');
}

// Test the admin member activities endpoint
async function testAdminMemberActivities() {
  try {
    // First login to get a session
    const cookie = await loginAsAdmin();
    
    // Get a list of member IDs to test with
    const connection = await pool.getConnection();
    const [members] = await connection.query('SELECT id, username FROM users WHERE role != "admin" LIMIT 1');
    connection.release();
    
    if (members.length === 0) {
      console.log('No non-admin members found in the database.');
      return;
    }
    
    const member = members[0];
    console.log(`\nTesting member activities for user: ${member.username} (ID: ${member.id})`);
    
    // Call the admin member activities endpoint
    const response = await fetch(`http://localhost:3000/admin/members/${member.id}/activities`, {
      method: 'GET',
      headers: {
        'Cookie': cookie
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API request failed: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.activities && data.activities.length > 0) {
      console.log(`\nFound ${data.activities.length} activities for member ${member.username}:`);
      data.activities.forEach((activity, index) => {
        console.log(`\nActivity #${index + 1}:`);
        console.log(`  Title: ${activity.title}`);
        console.log(`  Description: ${activity.description}`);
        console.log(`  Date: ${activity.date}`);
        console.log(`  Location: ${activity.location}`);
        console.log(`  Created by: ${activity.creator_name || 'Unknown'}`);
        console.log(`  Participant count: ${activity.participant_count || 0}`);
        console.log(`  Joined at: ${activity.joined_at}`);
      });
    } else {
      console.log('No activities found for this member.');
    }
    
  } catch (error) {
    console.error('Error testing admin member activities:', error);
  }
}

// Run the test
testAdminMemberActivities()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
