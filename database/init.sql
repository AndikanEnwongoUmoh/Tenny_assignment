-- Create database
CREATE DATABASE IF NOT EXISTS together_culture;
USE together_culture;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(200),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Junction table for user-activity relationships
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_activity (user_id, activity_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, full_name, role) VALUES 
('admin', '$2b$10$rQJ5yC0QVKEe7k0QZ0QZ0OzQZ0QZ0QZ0QZ0QZ0QZ0QZ0QZ0QZ0QZ0O', 'admin@togetherculture.com', 'Administrator', 'admin');

-- Insert sample activities
INSERT INTO activities (title, description, date, location, created_by) VALUES 
('Cultural Workshop', 'Learn about different cultures through interactive workshops', '2024-08-15', 'Community Center', 1),
('Art Exhibition', 'Showcase of local artists from diverse backgrounds', '2024-08-20', 'Gallery Hall', 1),
('Music Festival', 'Celebration of world music and traditions', '2024-09-01', 'Central Park', 1);

-- Insert sample user-activity relationships
INSERT INTO user_activities (user_id, activity_id) VALUES (1, 1), (1, 2), (1, 3);