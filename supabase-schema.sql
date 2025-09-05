-- SplashEasy V2 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE unit_type AS ENUM ('pool', 'spa', 'hot_tub');
CREATE TYPE sanitizer_type AS ENUM ('chlorine', 'bromine', 'salt_water');
CREATE TYPE test_method AS ENUM ('ai_vision', 'manual_color', 'manual_numeric');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb,
  help_level TEXT DEFAULT 'guided' CHECK (help_level IN ('minimal', 'guided', 'detailed'))
);

-- Units table (pools, spas, hot tubs)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type unit_type NOT NULL,
  volume_gallons INTEGER NOT NULL CHECK (volume_gallons > 0),
  sanitizer_type sanitizer_type NOT NULL DEFAULT 'chlorine',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  equipment_details JSONB DEFAULT '{}'::jsonb
);

-- Water tests table
CREATE TABLE IF NOT EXISTS water_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_method test_method NOT NULL DEFAULT 'ai_vision',
  
  -- Water chemistry readings
  ph DECIMAL(3,1) CHECK (ph >= 0 AND ph <= 14),
  free_chlorine DECIMAL(4,2) CHECK (free_chlorine >= 0),
  total_alkalinity INTEGER CHECK (total_alkalinity >= 0),
  cyanuric_acid INTEGER CHECK (cyanuric_acid >= 0),
  total_hardness INTEGER CHECK (total_hardness >= 0),
  
  -- AI-specific fields
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  image_url TEXT, -- Temporary storage URL
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_feedback BOOLEAN, -- Did we get it right?
  
  -- Ensure user owns the unit
  CONSTRAINT fk_user_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- Maintenance reminders table
CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  frequency_days INTEGER NOT NULL CHECK (frequency_days > 0),
  last_completed TIMESTAMPTZ,
  next_due TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user owns the unit
  CONSTRAINT fk_user_unit_reminder FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reminders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Units policies
CREATE POLICY "Users can view their own units" ON units
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own units" ON units
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own units" ON units
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own units" ON units
  FOR DELETE USING (auth.uid() = user_id);

-- Water tests policies
CREATE POLICY "Users can view their own water tests" ON water_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water tests" ON water_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water tests" ON water_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water tests" ON water_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Maintenance reminders policies
CREATE POLICY "Users can view their own reminders" ON maintenance_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON maintenance_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON maintenance_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON maintenance_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_units_user_id ON units(user_id);
CREATE INDEX idx_units_is_favorite ON units(user_id, is_favorite);
CREATE INDEX idx_water_tests_unit_id ON water_tests(unit_id);
CREATE INDEX idx_water_tests_user_id ON water_tests(user_id);
CREATE INDEX idx_water_tests_created_at ON water_tests(created_at DESC);
CREATE INDEX idx_maintenance_reminders_user_id ON maintenance_reminders(user_id);
CREATE INDEX idx_maintenance_reminders_next_due ON maintenance_reminders(user_id, next_due) WHERE is_active = true;

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update next_due date for maintenance reminders
CREATE OR REPLACE FUNCTION update_next_due()
RETURNS trigger AS $$
BEGIN
  IF NEW.last_completed IS NOT NULL AND NEW.frequency_days IS NOT NULL THEN
    NEW.next_due = NEW.last_completed + (NEW.frequency_days || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating next_due automatically
CREATE TRIGGER update_maintenance_next_due
  BEFORE UPDATE ON maintenance_reminders
  FOR EACH ROW
  WHEN (NEW.last_completed IS DISTINCT FROM OLD.last_completed)
  EXECUTE FUNCTION update_next_due();

-- Insert some sample data for testing (optional)
-- Note: These will be inserted for the first authenticated user

-- Sample unit types for reference
-- 'pool' - Swimming pool
-- 'spa' - Spa/jacuzzi connected to pool
-- 'hot_tub' - Standalone hot tub

-- Sample sanitizer types
-- 'chlorine' - Traditional chlorine
-- 'bromine' - Bromine sanitizer 
-- 'salt_water' - Salt water chlorine generator