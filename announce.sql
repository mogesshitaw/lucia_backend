-- =====================================================
-- ANNOUNCEMENTS DATABASE SCHEMA - FIXED VERSION
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ANNOUNCEMENTS TABLE - WITH SAFE COLUMN ADDITIONS
-- =====================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Now safely add all other columns using DO block to check existence
DO $$
BEGIN
    -- Add bullet_points if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'bullet_points') THEN
        ALTER TABLE announcements ADD COLUMN bullet_points TEXT[] DEFAULT '{}';
    END IF;

    -- Add cta if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'cta') THEN
        ALTER TABLE announcements ADD COLUMN cta VARCHAR(255);
    END IF;

    -- Add cta_link if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'cta_link') THEN
        ALTER TABLE announcements ADD COLUMN cta_link VARCHAR(255);
    END IF;

    -- Add date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'date') THEN
        ALTER TABLE announcements ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add read_time if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'read_time') THEN
        ALTER TABLE announcements ADD COLUMN read_time INTEGER DEFAULT 1;
    END IF;

    -- Add type if not exists (THIS IS THE FIX FOR YOUR ERROR)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'type') THEN
        ALTER TABLE announcements ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'news';
    END IF;

    -- Add priority if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'priority') THEN
        ALTER TABLE announcements ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;

    -- Add image_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'image_url') THEN
        ALTER TABLE announcements ADD COLUMN image_url TEXT;
    END IF;

    -- Add tags if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'tags') THEN
        ALTER TABLE announcements ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- Add views if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'views') THEN
        ALTER TABLE announcements ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    -- Add likes if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'likes') THEN
        ALTER TABLE announcements ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;

    -- Add comments if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'comments') THEN
        ALTER TABLE announcements ADD COLUMN comments INTEGER DEFAULT 0;
    END IF;

    -- Add is_featured if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'is_featured') THEN
        ALTER TABLE announcements ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- Add is_published if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'is_published') THEN
        ALTER TABLE announcements ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;

    -- Add published_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'published_at') THEN
        ALTER TABLE announcements ADD COLUMN published_at TIMESTAMP;
    END IF;

    -- Add status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'status') THEN
        ALTER TABLE announcements ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    END IF;

    -- Add metadata if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'metadata') THEN
        ALTER TABLE announcements ADD COLUMN metadata JSONB;
    END IF;

    -- Add created_by if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'created_by') THEN
        ALTER TABLE announcements ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;

END $$;

-- Create indexes (they won't error if they already exist)
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_is_featured ON announcements(is_featured);
CREATE INDEX IF NOT EXISTS idx_announcements_is_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- =====================================================
-- 2. ANNOUNCEMENTS STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon VARCHAR(50),
    label VARCHAR(100) NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(100) DEFAULT 'from-blue-500 to-cyan-500',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ANNOUNCEMENT TIMELINE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ANNOUNCEMENT LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, user_id),
    UNIQUE(announcement_id, session_id)
);

-- =====================================================
-- 5. ANNOUNCEMENT COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcement_comments_announcement_id ON announcement_comments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_comments_is_approved ON announcement_comments(is_approved);

-- =====================================================
-- 6. NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON newsletter_subscribers(is_active);

-- =====================================================
-- 7. ANNOUNCEMENT VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcement_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    viewer_ip INET,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERT DEFAULT DATA (with conflict handling)
-- =====================================================

-- Insert default stats (ignore if they already exist)
INSERT INTO announcement_stats (label, value, color, display_order) 
SELECT 'Total Announcements', 156, 'from-blue-500 to-cyan-500', 1
WHERE NOT EXISTS (SELECT 1 FROM announcement_stats WHERE label = 'Total Announcements');

INSERT INTO announcement_stats (label, value, color, display_order) 
SELECT 'Active Offers', 45, 'from-green-500 to-emerald-500', 2
WHERE NOT EXISTS (SELECT 1 FROM announcement_stats WHERE label = 'Active Offers');

INSERT INTO announcement_stats (label, value, color, display_order) 
SELECT 'Upcoming Events', 12, 'from-purple-500 to-pink-500', 3
WHERE NOT EXISTS (SELECT 1 FROM announcement_stats WHERE label = 'Upcoming Events');

INSERT INTO announcement_stats (label, value, color, display_order) 
SELECT 'Subscribers', 2500, 'from-orange-500 to-red-500', 4
WHERE NOT EXISTS (SELECT 1 FROM announcement_stats WHERE label = 'Subscribers');

-- Insert default timeline events (ignore if they already exist)
INSERT INTO announcement_timeline (date, title, type, display_order) 
SELECT '2024-03-15', 'New DTF Printing Service Launch', 'launch', 1
WHERE NOT EXISTS (SELECT 1 FROM announcement_timeline WHERE title = 'New DTF Printing Service Launch');

INSERT INTO announcement_timeline (date, title, type, display_order) 
SELECT '2024-03-10', 'Spring Sale - 20% Off', 'sale', 2
WHERE NOT EXISTS (SELECT 1 FROM announcement_timeline WHERE title = 'Spring Sale - 20% Off');

INSERT INTO announcement_timeline (date, title, type, display_order) 
SELECT '2024-03-05', 'Holiday Hours Announcement', 'info', 3
WHERE NOT EXISTS (SELECT 1 FROM announcement_timeline WHERE title = 'Holiday Hours Announcement');

INSERT INTO announcement_timeline (date, title, type, display_order) 
SELECT '2024-02-28', 'New Website Feature', 'update', 4
WHERE NOT EXISTS (SELECT 1 FROM announcement_timeline WHERE title = 'New Website Feature');

INSERT INTO announcement_timeline (date, title, type, display_order) 
SELECT '2024-02-20', 'Customer Appreciation Day', 'event', 5
WHERE NOT EXISTS (SELECT 1 FROM announcement_timeline WHERE title = 'Customer Appreciation Day');

-- =====================================================
-- FUNCTIONS AND TRIGGERS (with existence checks)
-- =====================================================

-- Function to update updated_at timestamp (create or replace)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop if exist first to avoid errors)
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcement_stats_updated_at ON announcement_stats;
CREATE TRIGGER update_announcement_stats_updated_at
    BEFORE UPDATE ON announcement_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count (create or replace)
CREATE OR REPLACE FUNCTION increment_announcement_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE announcements SET views = views + 1 WHERE id = NEW.announcement_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for views (drop if exist first)
DROP TRIGGER IF EXISTS after_announcement_view_insert ON announcement_views;
CREATE TRIGGER after_announcement_view_insert
    AFTER INSERT ON announcement_views
    FOR EACH ROW
    EXECUTE FUNCTION increment_announcement_view();