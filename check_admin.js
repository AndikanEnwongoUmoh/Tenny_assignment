const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'together_culture',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkAdminUser() {
  // Get a connection from the pool
  const connection = await pool.getConnection();

  try {
    // Check if admin user exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      console.log('Admin user does not exist. Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@example.com', 'Admin User', 'admin']
      );
      
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user exists.');
      console.log('Username:', rows[0].username);
      console.log('Role:', rows[0].role);
      
      // Verify password
      const isValid = await bcrypt.compare('admin123', rows[0].password);
      console.log('Password "admin123" is', isValid ? 'valid' : 'invalid');
      
      if (!isValid) {
        console.log('Updating admin password...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE username = ?',
          [newHashedPassword, 'admin']
        );
        console.log('Admin password has been reset to "admin123"');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
}

checkAdminUser();
