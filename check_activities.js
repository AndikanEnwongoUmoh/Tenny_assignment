const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Create a log file
const logFile = path.join(__dirname, 'check_activities.log');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

// Override console.log to write to both console and file
const originalLog = console.log;
console.log = function() {
  const message = Array.from(arguments).join(' ');
  originalLog.apply(console, arguments);
  logStream.write(`[${new Date().toISOString()}] ${message}\n`);
};

// Override console.error to write to both console and file
const originalError = console.error;
console.error = function() {
  const message = Array.from(arguments).join(' ');
  originalError.apply(console, arguments);
  logStream.write(`[${new Date().toISOString()}] ERROR: ${message}\n`);
};

process.on('exit', () => {
  logStream.end();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('Starting check_activities.js script');

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

async function checkActivities() {
  console.log('Starting check_activities.js script...');
  
  // Get a connection from the pool
  console.log('Getting database connection from pool...');
  const connection = await pool.getConnection();
  console.log('Successfully obtained database connection');

  try {
    // Check users
    console.log('Checking users...');
    const [users] = await connection.query('SELECT id, username, role FROM users');
    console.log('Users:', users);

    // Check activities
    console.log('\nChecking activities...');
    const [activities] = await connection.query('SELECT * FROM activities');
    console.log('Activities:', activities);

    // Check user_activities
    console.log('\nChecking user_activities...');
    const [userActivities] = await connection.query('SELECT * FROM user_activities');
    console.log('User Activities:', userActivities);

    // For each user, show their activities
    for (const user of users) {
      const [userActs] = await connection.query(
        `SELECT a.*, ua.joined_at 
         FROM user_activities ua 
         JOIN activities a ON ua.activity_id = a.id 
         WHERE ua.user_id = ?`,
        [user.id]
      );
      console.log(`\nActivities for user ${user.username} (${user.role}):`, userActs);
    }
  } catch (error) {
    console.error('Error checking activities:', error);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
  } finally {
    // Release the connection back to the pool
    if (connection) {
      console.log('Releasing database connection back to pool...');
      connection.release();
      console.log('Database connection released');
    }
    console.log('Script execution completed');
    process.exit(0);
  }
}

checkActivities();
