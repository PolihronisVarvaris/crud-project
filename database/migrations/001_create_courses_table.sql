
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE course_status AS ENUM ('Published', 'Pending');

CREATE TABLE IF NOT EXISTS courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      course_status NOT NULL DEFAULT 'Pending',
  is_premium  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses (deleted_at);
CREATE INDEX IF NOT EXISTS idx_courses_status     ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses (created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
