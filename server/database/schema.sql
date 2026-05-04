-- REMAR Database Schema

CREATE EXTENSION IF NOT EXISTS IF NOT EXISTS "uuid-ossp";

-- Users table (admins, volunteers, beneficiaries)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'volunteer', 'beneficiary')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  photo_url TEXT,
  voice_note_url TEXT,
  date_of_birth DATE,
  age_group VARCHAR(20),
  gender VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  skills TEXT[],
  availability JSONB,
  phone VARCHAR(20),
  personality_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Beneficiaries
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  photo_url TEXT,
  voice_note_url TEXT,
  date_of_birth DATE,
  age_group VARCHAR(20),
  gender VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  support_needs TEXT[],
  time_preferences JSONB,
  phone VARCHAR(20),
  personality_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opportunities / Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
  required_skills TEXT[],
  location TEXT,
  scheduled_date TIMESTAMP,
  duration_hours DECIMAL(4,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES beneficiaries(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
