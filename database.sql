-- Create database
CREATE DATABASE lucia_printing;
\c lucia_printing;

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'cashier', 'designer', 'printer', 'customer');
CREATE TYPE image_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'cancelled');
CREATE TYPE chat_message_type AS ENUM ('text', 'image', 'file');

-- =====================================================
-- USERS TABLE (Base table for all users)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role NOT NULL,
    profile_photo_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOMER SPECIFIC DATA
-- =====================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    tax_number VARCHAR(50),
    billing_address TEXT,
    shipping_address TEXT,
    notes TEXT,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMPLOYEES TABLE (For admin/owner employees)
-- =====================================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    hired_date DATE NOT NULL,
    salary DECIMAL(10, 2),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    department VARCHAR(100),
    shift_timing VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- =====================================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by UUID NOT NULL REFERENCES users(id),
    target_roles user_role[], -- Array of roles that can see this announcement
    is_published BOOLEAN DEFAULT true,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANNOUNCEMENT READ STATUS
-- =====================================================

CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, user_id)
);

-- =====================================================
-- IMAGES TABLE
-- =====================================================

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    file_size INT, -- in bytes
    mime_type VARCHAR(100),
    width INT,
    height INT,
    dpi INT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    description TEXT,
    status image_status DEFAULT 'pending',
    is_self_designed BOOLEAN DEFAULT false, -- For designer uploads
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    viewed_by_printer BOOLEAN DEFAULT false,
    viewed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IMAGE APPROVAL HISTORY
-- =====================================================

CREATE TABLE image_approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    old_status image_status,
    new_status image_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRINT JOBS
-- =====================================================

CREATE TABLE print_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES images(id),
    printer_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    quantity INT DEFAULT 1,
    paper_size VARCHAR(50),
    paper_type VARCHAR(50),
    print_quality VARCHAR(50),
    special_instructions TEXT,
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRANSACTIONS TABLE (Payments)
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    cashier_id UUID NOT NULL REFERENCES users(id),
    image_id UUID REFERENCES images(id),
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- cash, credit_card, bank_transfer, etc.
    payment_status payment_status DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CHAT/MESSAGING SYSTEM
-- =====================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type chat_message_type DEFAULT 'text',
    content TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- image_uploaded, payment_received, etc.
    reference_id UUID, -- ID of related entity (image_id, transaction_id, etc.)
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SYSTEM LOGS
-- =====================================================

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50), -- user, image, transaction, etc.
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PASSWORD RESETS
-- =====================================================

CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Images indexes
CREATE INDEX idx_images_status ON images(status);
CREATE INDEX idx_images_uploaded_by ON images(uploaded_by);
CREATE INDEX idx_images_customer_id ON images(customer_id);
CREATE INDEX idx_images_created_at ON images(created_at);
CREATE INDEX idx_images_status_created ON images(status, created_at);

-- Transactions indexes
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_payment_date ON transactions(payment_date);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_print_jobs_updated_at BEFORE UPDATE ON print_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.transaction_number = 'TRX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transaction_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence for transaction numbers
CREATE SEQUENCE transaction_seq START 1;

-- Trigger for transaction number generation
CREATE TRIGGER generate_transaction_number_trigger
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION generate_transaction_number();

-- =====================================================
-- VIEWS for Common Queries
-- =====================================================

-- View for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
    (SELECT COUNT(*) FROM users WHERE role IN ('receptionist', 'cashier', 'designer', 'printer')) as total_employees,
    (SELECT COUNT(*) FROM images WHERE status = 'pending') as pending_images,
    (SELECT COUNT(*) FROM images WHERE status = 'approved') as approved_images,
    (SELECT COUNT(*) FROM images WHERE status = 'completed') as completed_images,
    (SELECT COUNT(*) FROM transactions WHERE DATE(payment_date) = CURRENT_DATE) as today_transactions,
    (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE DATE(payment_date) = CURRENT_DATE) as today_revenue,
    (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)) as monthly_revenue;

-- View for customer activity
CREATE VIEW customer_activity AS
SELECT 
    c.id,
    u.first_name,
    u.last_name,
    u.email,
    c.company_name,
    c.total_orders,
    c.total_spent,
    COUNT(DISTINCT i.id) as images_uploaded,
    MAX(i.created_at) as last_upload,
    COUNT(DISTINCT t.id) as transaction_count
FROM customers c
JOIN users u ON c.user_id = u.id
LEFT JOIN images i ON c.id = i.customer_id
LEFT JOIN transactions t ON c.id = t.customer_id
GROUP BY c.id, u.first_name, u.last_name, u.email, c.company_name, c.total_orders, c.total_spent;

-- =====================================================
-- SAMPLE INITIAL DATA
-- =====================================================

-- Insert admin user (password: admin123 - you should hash this properly)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@luciaprinting.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hashed password
    'System',
    'Administrator',
    'admin',
    true,
    true
);

-- Insert sample employee types
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES 
    ('receptionist1', 'receptionist@luciaprinting.com', '$2a$10$YourHashedPasswordHere', 'John', 'Doe', 'receptionist', true, true),
    ('cashier1', 'cashier@luciaprinting.com', '$2a$10$YourHashedPasswordHere', 'Jane', 'Smith', 'cashier', true, true),
    ('designer1', 'designer@luciaprinting.com', '$2a$10$YourHashedPasswordHere', 'Bob', 'Johnson', 'designer', true, true),
    ('printer1', 'printer@luciaprinting.com', '$2a$10$YourHashedPasswordHere', 'Alice', 'Williams', 'printer', true, true);

-- Insert sample customer
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, email_verified)
VALUES ('customer1', 'customer@example.com', '$2a$10$YourHashedPasswordHere', 'Peter', 'Jones', 'customer', true, true);

-- Note: Make sure to hash passwords properly using bcrypt or similar in your application


-- Add missing columns to images table
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS service_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS print_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS paper_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS finish VARCHAR(100),
ADD COLUMN IF NOT EXISTS color_mode_req VARCHAR(50),
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS requires_proof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS viewed_by_printer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_images_service_category ON images(service_category);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);