CREATE TABLE IF NOT EXISTS site_content (
  id text PRIMARY KEY DEFAULT 'default',
  data jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]',
  featured boolean NOT NULL DEFAULT false,
  featured_order integer,
  featured_photo_count integer NOT NULL DEFAULT 1,
  client_name text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  budget_estimate text NOT NULL DEFAULT ''
);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS team (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  photo text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT ''
);
ALTER TABLE team ADD COLUMN IF NOT EXISTS role_en text NOT NULL DEFAULT '';
ALTER TABLE team ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '';
ALTER TABLE team ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name_en text NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
