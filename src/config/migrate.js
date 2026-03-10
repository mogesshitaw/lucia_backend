const { query } = require('./database');

const createTables = async () => {
  try {
    console.log('📦 Starting database migration...');
    console.log('=============================================');
    
    // =====================================================
    // CREATE ENUM TYPES (if they don't exist)
    // =====================================================
    
    console.log('\n📦 Creating ENUM types...');
    
    await query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'cashier', 'designer', 'printer', 'customer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ user_role ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE image_status AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ image_status ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'verified', 'refunded', 'cancelled', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ payment_status ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE chat_message_type AS ENUM ('text', 'image', 'file', 'system');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ chat_message_type ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('image_uploaded', 'image_approved', 'image_rejected', 'payment_received', 'print_completed', 'new_message', 'announcement', 'system_alert');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ notification_type ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE print_quality AS ENUM ('draft', 'standard', 'high', 'premium');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ print_quality ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE paper_size AS ENUM ('a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'b4', 'b5', 'letter', 'legal', 'custom');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ paper_size ENUM created/verified');

    await query(`
      DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'deposit', 'withdrawal');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✅ transaction_type ENUM created/verified');

    // =====================================================
    // CREATE TABLES
    // =====================================================
    
    console.log('\n📦 Creating tables...');

    // 1. Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        company VARCHAR(100),
        account_type VARCHAR(50) DEFAULT 'individual',
        role user_role DEFAULT 'customer',
        profile_photo_url VARCHAR(255),
        bio TEXT,
        is_active BOOLEAN DEFAULT true,
        is_online BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        email_verified_at TIMESTAMP,
        phone_verified BOOLEAN DEFAULT false,
        phone_verified_at TIMESTAMP,
        last_login TIMESTAMP,
        last_login_ip INET,
        last_activity TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        lock_until TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        preferences JSONB DEFAULT '{}',
        refresh_token VARCHAR(255),
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        preferred_language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log('  ✅ Users table created/verified');

    // 2. Customer profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        customer_code VARCHAR(50) UNIQUE NOT NULL,
        company_name VARCHAR(255),
        company_registration_number VARCHAR(100),
        tax_number VARCHAR(50),
        billing_address TEXT,
        shipping_address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Indonesia',
        notes TEXT,
        loyalty_points INT DEFAULT 0,
        customer_tier VARCHAR(50) DEFAULT 'regular',
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(12, 2) DEFAULT 0.00,
        average_order_value DECIMAL(10, 2) DEFAULT 0.00,
        last_order_date TIMESTAMP,
        preferred_payment_method VARCHAR(50),
        credit_limit DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Customer profiles table created/verified');

    // 3. Employee profiles table
    await query(`
      CREATE TABLE IF NOT EXISTS employee_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        hire_date DATE NOT NULL,
        contract_end_date DATE,
        salary DECIMAL(12, 2),
        bank_account_number VARCHAR(50),
        bank_name VARCHAR(100),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relation VARCHAR(50),
        id_card_number VARCHAR(50),
        id_card_photo_url TEXT,
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Employee profiles table created/verified');

    // 4. Sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT UNIQUE,
        user_agent TEXT,
        ip_address INET,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Sessions table created/verified');

    // 5. Login history table
    await query(`
      CREATE TABLE IF NOT EXISTS login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        login_type VARCHAR(50),
        success BOOLEAN DEFAULT true,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Login history table created/verified');

    // 6. Email verifications table
   await query(`
  CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(6) NOT NULL,  -- ← Make sure this line exists
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
    console.log('  ✅ Email verifications table created/verified');

    // 7. Password resets table
    await query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        used_at TIMESTAMP,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Password resets table created/verified');

    // 8. Announcements table
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        featured_image_url TEXT,
        posted_by UUID NOT NULL REFERENCES users(id),
        target_roles user_role[],
        priority VARCHAR(20) DEFAULT 'normal',
        is_published BOOLEAN DEFAULT false,
        publish_date TIMESTAMP,
        expiry_date TIMESTAMP,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Announcements table created/verified');

    // 9. Announcement reads table
    await query(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        UNIQUE(announcement_id, user_id)
      );
    `);
    console.log('  ✅ Announcement reads table created/verified');

    // 10. Images table
    await query(`
      CREATE TABLE IF NOT EXISTS images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_code VARCHAR(50) UNIQUE NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        thumbnail_path TEXT,
        watermark_path TEXT,
        file_size INT,
        mime_type VARCHAR(100),
        width INT,
        height INT,
        dpi INT,
        color_mode VARCHAR(20),
        uploaded_by UUID NOT NULL REFERENCES users(id),
        customer_id UUID REFERENCES customer_profiles(id),
        order_id UUID,
        title VARCHAR(255),
        description TEXT,
        tags TEXT[],
        status image_status DEFAULT 'pending',
        is_self_designed BOOLEAN DEFAULT false,
        is_watermarked BOOLEAN DEFAULT false,
        requires_proof BOOLEAN DEFAULT false,
        proof_approved BOOLEAN DEFAULT false,
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        rejected_by UUID REFERENCES users(id),
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        viewed_by_printer BOOLEAN DEFAULT false,
        viewed_at TIMESTAMP,
        completed_at TIMESTAMP,
        deleted_at TIMESTAMP,
        favorites TEXT,
        download_count INT DEFAULT 0,
        print_count INT DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Images table created/verified');

    // 11. Image approval history table
    await query(`
      CREATE TABLE IF NOT EXISTS image_approval_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
        changed_by UUID NOT NULL REFERENCES users(id),
        old_status image_status,
        new_status image_status NOT NULL,
        notes TEXT,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Image approval history table created/verified');

    // 12. Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID NOT NULL REFERENCES customer_profiles(id),
        receptionist_id UUID REFERENCES users(id),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        required_by_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        tax_amount DECIMAL(10, 2) DEFAULT 0.00,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        discount_type VARCHAR(20),
        discount_code VARCHAR(50),
        shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        payment_status payment_status DEFAULT 'pending',
        notes TEXT,
        internal_notes TEXT,
        delivery_method VARCHAR(50),
        delivery_address TEXT,
        tracking_number VARCHAR(100),
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Orders table created/verified');

    // 13. Order items table
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        image_id UUID NOT NULL REFERENCES images(id),
        description VARCHAR(255),
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        print_settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Order items table created/verified');

    // 14. Transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_number VARCHAR(50) UNIQUE NOT NULL,
        transaction_type transaction_type DEFAULT 'payment',
        order_id UUID REFERENCES orders(id),
        customer_id UUID NOT NULL REFERENCES customer_profiles(id),
        cashier_id UUID REFERENCES users(id),
        amount DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0.00,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50),
        payment_provider VARCHAR(50),
        payment_status payment_status DEFAULT 'pending',
        payment_date TIMESTAMP,
        reference_number VARCHAR(100),
        receipt_number VARCHAR(100),
        notes TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Transactions table created/verified');

    // 15. Invoices table
    await query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        order_id UUID REFERENCES orders(id),
        transaction_id UUID REFERENCES transactions(id),
        customer_id UUID NOT NULL REFERENCES customer_profiles(id),
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0.00,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        amount_paid DECIMAL(12, 2) DEFAULT 0.00,
        balance_due DECIMAL(12, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'unpaid',
        pdf_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Invoices table created/verified');

    // 16. Print jobs table
    await query(`
      CREATE TABLE IF NOT EXISTS print_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_number VARCHAR(50) UNIQUE NOT NULL,
        image_id UUID NOT NULL REFERENCES images(id),
        printer_id UUID REFERENCES users(id),
        assigned_by UUID REFERENCES users(id),
        priority INT DEFAULT 0,
        quantity INT DEFAULT 1,
        copies INT DEFAULT 1,
        paper_size paper_size DEFAULT 'a4',
        paper_type VARCHAR(50),
        print_quality print_quality DEFAULT 'standard',
        color_print BOOLEAN DEFAULT true,
        double_sided BOOLEAN DEFAULT false,
        binding_required BOOLEAN DEFAULT false,
        binding_type VARCHAR(50),
        laminating_required BOOLEAN DEFAULT false,
        laminating_type VARCHAR(50),
        trimming_required BOOLEAN DEFAULT false,
        trimming_size VARCHAR(50),
        special_instructions TEXT,
        estimated_completion_time TIMESTAMP,
        started_at TIMESTAMP,
        paused_at TIMESTAMP,
        resumed_at TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT,
        is_urgent BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Print jobs table created/verified');

    // 17. Printer machines table
    await query(`
      CREATE TABLE IF NOT EXISTS printer_machines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_code VARCHAR(50) UNIQUE NOT NULL,
        machine_name VARCHAR(100) NOT NULL,
        model VARCHAR(100),
        manufacturer VARCHAR(100),
        serial_number VARCHAR(100),
        location VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        capabilities JSONB,
        current_job_id UUID REFERENCES print_jobs(id),
        last_maintenance_date TIMESTAMP,
        next_maintenance_date TIMESTAMP,
        total_pages_printed INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Printer machines table created/verified');

    // 18. Conversations table
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255),
        is_group BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        last_message_at TIMESTAMP,
        last_message_preview TEXT,
        is_archived BOOLEAN DEFAULT false,
        archived_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Conversations table created/verified');

    // 19. Conversation participants table
    await query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        last_read_at TIMESTAMP,
        UNIQUE(conversation_id, user_id)
      );
    `);
    console.log('  ✅ Conversation participants table created/verified');

    // 20. Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_code VARCHAR(50) UNIQUE NOT NULL,
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        message_type chat_message_type DEFAULT 'text',
        content TEXT,
        file_url TEXT,
        file_name VARCHAR(255),
        file_size INT,
        file_type VARCHAR(100),
        is_edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        reply_to_id UUID REFERENCES messages(id),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Messages table created/verified');

    // 21. Message read receipts table
    await query(`
      CREATE TABLE IF NOT EXISTS message_read_receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_id)
      );
    `);
    console.log('  ✅ Message read receipts table created/verified');

    // 22. Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notification_code VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type notification_type NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        reference_type VARCHAR(50),
        reference_id UUID,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        is_archived BOOLEAN DEFAULT false,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Notifications table created/verified');

    // 23. User activity logs table
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        entity_type VARCHAR(50),
        entity_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ User activity logs table created/verified');

    // 24. System settings table
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50),
        description TEXT,
        category VARCHAR(50),
        is_public BOOLEAN DEFAULT false,
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ System settings table created/verified');

    // 25. Price list table
    await query(`
      CREATE TABLE IF NOT EXISTS price_list (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_code VARCHAR(50) UNIQUE NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        unit_type VARCHAR(50),
        base_price DECIMAL(10, 2) NOT NULL,
        min_quantity INT DEFAULT 1,
        max_quantity INT,
        is_active BOOLEAN DEFAULT true,
        tax_rate DECIMAL(5, 2) DEFAULT 0.00,
        discount_allowed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Price list table created/verified');

    // 26. Feedback table
    await query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customer_profiles(id),
        order_id UUID REFERENCES orders(id),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        images TEXT[],
        is_public BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'pending',
        responded_by UUID REFERENCES users(id),
        response TEXT,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✅ Feedback table created/verified');

    // =====================================================
    // CREATE SEQUENCES for auto-numbering
    // =====================================================
    
    console.log('\n📦 Creating sequences...');
    await query(`CREATE SEQUENCE IF NOT EXISTS transaction_seq START 1;`);
    await query(`CREATE SEQUENCE IF NOT EXISTS order_seq START 1;`);
    await query(`CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;`);
    await query(`CREATE SEQUENCE IF NOT EXISTS image_seq START 1;`);
    await query(`CREATE SEQUENCE IF NOT EXISTS print_job_seq START 1;`);
    console.log('  ✅ Sequences created/verified');

    // =====================================================
    // CREATE INDEXES for better performance
    // =====================================================
    
    console.log('\n📦 Creating indexes...');
    
    // Users indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token) WHERE email_verified = false;`);
    
    // Sessions indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`);
    
    // Login history indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);`);
    
    // Customer profiles indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customer_profiles(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_code ON customer_profiles(customer_code);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_tier ON customer_profiles(customer_tier);`);
    
    // Employee profiles indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employee_profiles(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employee_profiles(employee_id);`);
    
    // Images indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images(uploaded_by);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_images_customer_id ON images(customer_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_images_code ON images(image_code);`);
    
    // Orders indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);`);
    
    // Transactions indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_payment_date ON transactions(payment_date DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);`);
    
    // Print jobs indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_print_jobs_image_id ON print_jobs(image_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_print_jobs_printer_id ON print_jobs(printer_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(completed_at) WHERE completed_at IS NULL;`);
    
    // Messages indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);`);
    
    // Notifications indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);`);
    
    // Activity logs indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);`);
    
    console.log('  ✅ All indexes created/verified');

    // =====================================================
    // CREATE FUNCTIONS AND TRIGGERS
    // =====================================================
    
    console.log('\n📦 Creating functions and triggers...');
    
    // Updated_at trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply updated_at trigger to all relevant tables
    const tablesWithUpdatedAt = [
      'users', 'customer_profiles', 'employee_profiles', 'announcements', 
      'images', 'orders', 'transactions', 'invoices', 'print_jobs',
      'printer_machines', 'conversations', 'messages', 'system_settings',
      'price_list', 'feedback'
    ];

    for (const table of tablesWithUpdatedAt) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    console.log('  ✅ Updated_at triggers created/verified');

    // Function to generate transaction number
    await query(`
      CREATE OR REPLACE FUNCTION generate_transaction_number()
      RETURNS TRIGGER AS $$
      DECLARE
        seq_num TEXT;
      BEGIN
        seq_num := LPAD(NEXTVAL('transaction_seq')::TEXT, 6, '0');
        NEW.transaction_number = 'TRX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || seq_num;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Function to generate order number
    await query(`
      CREATE OR REPLACE FUNCTION generate_order_number()
      RETURNS TRIGGER AS $$
      DECLARE
        seq_num TEXT;
      BEGIN
        seq_num := LPAD(NEXTVAL('order_seq')::TEXT, 6, '0');
        NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || seq_num;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Function to generate invoice number
    await query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number()
      RETURNS TRIGGER AS $$
      DECLARE
        seq_num TEXT;
      BEGIN
        seq_num := LPAD(NEXTVAL('invoice_seq')::TEXT, 6, '0');
        NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || seq_num;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Function to generate image code
    await query(`
      CREATE OR REPLACE FUNCTION generate_image_code()
      RETURNS TRIGGER AS $$
      DECLARE
        seq_num TEXT;
      BEGIN
        seq_num := LPAD(NEXTVAL('image_seq')::TEXT, 6, '0');
        NEW.image_code = 'IMG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || seq_num;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Function to generate job number
    await query(`
      CREATE OR REPLACE FUNCTION generate_job_number()
      RETURNS TRIGGER AS $$
      DECLARE
        seq_num TEXT;
      BEGIN
        seq_num := LPAD(NEXTVAL('print_job_seq')::TEXT, 6, '0');
        NEW.job_number = 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || seq_num;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply number generation triggers
    await query(`
      DROP TRIGGER IF EXISTS generate_transaction_number_trigger ON transactions;
      CREATE TRIGGER generate_transaction_number_trigger
        BEFORE INSERT ON transactions
        FOR EACH ROW
        EXECUTE FUNCTION generate_transaction_number();
    `);

    await query(`
      DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
      CREATE TRIGGER generate_order_number_trigger
        BEFORE INSERT ON orders
        FOR EACH ROW
        EXECUTE FUNCTION generate_order_number();
    `);

    await query(`
      DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON invoices;
      CREATE TRIGGER generate_invoice_number_trigger
        BEFORE INSERT ON invoices
        FOR EACH ROW
        EXECUTE FUNCTION generate_invoice_number();
    `);

    await query(`
      DROP TRIGGER IF EXISTS generate_image_code_trigger ON images;
      CREATE TRIGGER generate_image_code_trigger
        BEFORE INSERT ON images
        FOR EACH ROW
        EXECUTE FUNCTION generate_image_code();
    `);

    await query(`
      DROP TRIGGER IF EXISTS generate_job_number_trigger ON print_jobs;
      CREATE TRIGGER generate_job_number_trigger
        BEFORE INSERT ON print_jobs
        FOR EACH ROW
        EXECUTE FUNCTION generate_job_number();
    `);
    
    console.log('  ✅ Number generation triggers created/verified');

    // =====================================================
    // CREATE VIEWS for common queries
    // =====================================================
    
    console.log('\n📦 Creating views...');
    
    await query(`
      CREATE OR REPLACE VIEW dashboard_stats AS
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND is_active = true) as total_active_customers,
        (SELECT COUNT(*) FROM users WHERE role IN ('receptionist', 'cashier', 'designer', 'printer') AND is_active = true) as total_active_employees,
        (SELECT COUNT(*) FROM images WHERE status = 'pending') as pending_images,
        (SELECT COUNT(*) FROM images WHERE status = 'approved') as approved_images,
        (SELECT COUNT(*) FROM images WHERE status = 'in_progress') as in_progress_images,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'processing') as processing_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(order_date) = CURRENT_DATE) as today_orders,
        (SELECT COUNT(*) FROM transactions WHERE DATE(payment_date) = CURRENT_DATE) as today_transactions,
        (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE DATE(payment_date) = CURRENT_DATE AND payment_status = 'paid') as today_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE DATE(payment_date) >= DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'paid') as monthly_revenue;
    `);
    console.log('  ✅ Dashboard stats view created/verified');

    await query(`
      CREATE OR REPLACE VIEW customer_activity_view AS
      SELECT 
        cp.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        cp.company_name,
        cp.customer_tier,
        cp.total_orders,
        cp.total_spent,
        cp.loyalty_points,
        COUNT(DISTINCT i.id) as images_uploaded,
        MAX(i.created_at) as last_upload_date,
        COUNT(DISTINCT o.id) as order_count,
        MAX(o.order_date) as last_order_date
      FROM customer_profiles cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN images i ON cp.id = i.customer_id
      LEFT JOIN orders o ON cp.id = o.customer_id
      GROUP BY cp.id, u.first_name, u.last_name, u.email, u.phone, cp.company_name, 
               cp.customer_tier, cp.total_orders, cp.total_spent, cp.loyalty_points;
    `);
    console.log('  ✅ Customer activity view created/verified');

    await query(`
      CREATE OR REPLACE VIEW print_queue_view AS
      SELECT 
        pj.id,
        pj.job_number,
        i.image_code,
        i.filename,
        pj.priority,
        pj.quantity,
        pj.paper_size,
        pj.paper_type,
        pj.print_quality,
        pj.created_at,
        u.first_name || ' ' || u.last_name as assigned_printer
      FROM print_jobs pj
      JOIN images i ON pj.image_id = i.id
      LEFT JOIN users u ON pj.printer_id = u.id
      WHERE pj.completed_at IS NULL AND pj.cancelled_at IS NULL
      ORDER BY pj.priority DESC, pj.created_at ASC;
    `);
    console.log('  ✅ Print queue view created/verified');
    await query(`
      -- Create testimonials table
  CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name VARCHAR(255) NOT NULL,
      customer_role VARCHAR(255),
      company VARCHAR(255),
      content TEXT NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      avatar_url TEXT,
      avatar_path TEXT,
      email VARCHAR(255),
      is_approved BOOLEAN DEFAULT false,
      is_featured BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
      source VARCHAR(50) DEFAULT 'website', -- website, admin, social
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP,
      approved_by UUID REFERENCES users(id),
      customer_id UUID REFERENCES users(id),
      order_id UUID REFERENCES orders(id),
      metadata JSONB
  );
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
  CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
  CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
  CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
    `);
        console.log('✅Testmonia table created successsfully');
    console.log('\n=============================================');
    console.log('✅ All database migrations completed successfully!');
    console.log('=============================================');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Run migrations if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('\n✨ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createTables; // Export just the function, not as an object