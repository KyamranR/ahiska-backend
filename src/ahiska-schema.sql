-- Create the Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    bio TEXT DEFAULT NULL,
    profile_pic TEXT DEFAULT NULL
);

-- Create the Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_by INT REFERENCES users(id) ON DELETE CASCADE
);

-- Create the Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id)
);

-- Create the Q&A table
CREATE TABLE q_and_a (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT,
    asked_by INT REFERENCES users(id) ON DELETE CASCADE,
    answered_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

-- Create Answers table for Q&A
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES q_and_a(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    answered_by INT REFERENCES users(id) ON DELETE SET NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Feedback table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
