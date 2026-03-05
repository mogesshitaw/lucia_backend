const { query } = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('=============================================');

    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const adminPassword = await bcrypt.hash('Admin@123', 10);

    // =====================================================
    // 1. CREATE USERS
    // =====================================================
    console.log('\n📦 Creating users...');

    // Check and create admin user
    let adminUser = await query("SELECT id FROM users WHERE email = 'admin@luciaprinting.com'");
    let adminId;
    
    if (adminUser.rows.length === 0) {
      adminId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status, preferred_language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          adminId,
          'admin',
          'System',
          'Administrator',
          'mogesshitaw318@gmail.com',
          '+6281234567890',
          adminPassword,
          'admin',
          true,
          true,
          'active',
          'en'
        ]
      );
      console.log('  ✅ Admin user created');
    } else {
      adminId = adminUser.rows[0].id;
      console.log('  ℹ️ Admin user already exists');
    }

    // Create receptionist
    let receptionistUser = await query("SELECT id FROM users WHERE email = 'receptionist@luciaprinting.com'");
    let receptionistId;
    
    if (receptionistUser.rows.length === 0) {
      receptionistId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          receptionistId,
          'receptionist',
          'John',
          'Doe',
          'receptionist@luciaprinting.com',
          '+6281234567891',
          hashedPassword,
          'receptionist',
          true,
          true,
          'active'
        ]
      );
      console.log('  ✅ Receptionist user created');
    } else {
      receptionistId = receptionistUser.rows[0].id;
      console.log('  ℹ️ Receptionist user already exists');
    }

    // Create cashier
    let cashierUser = await query("SELECT id FROM users WHERE email = 'cashier@luciaprinting.com'");
    let cashierId;
    
    if (cashierUser.rows.length === 0) {
      cashierId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          cashierId,
          'cashier',
          'Jane',
          'Smith',
          'cashier@luciaprinting.com',
          '+6281234567892',
          hashedPassword,
          'cashier',
          true,
          true,
          'active'
        ]
      );
      console.log('  ✅ Cashier user created');
    } else {
      cashierId = cashierUser.rows[0].id;
      console.log('  ℹ️ Cashier user already exists');
    }

    // Create designer
    let designerUser = await query("SELECT id FROM users WHERE email = 'designer@luciaprinting.com'");
    let designerId;
    
    if (designerUser.rows.length === 0) {
      designerId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          designerId,
          'designer',
          'Bob',
          'Johnson',
          'designer@luciaprinting.com',
          '+6281234567893',
          hashedPassword,
          'designer',
          true,
          true,
          'active'
        ]
      );
      console.log('  ✅ Designer user created');
    } else {
      designerId = designerUser.rows[0].id;
      console.log('  ℹ️ Designer user already exists');
    }

    // Create printer
    let printerUser = await query("SELECT id FROM users WHERE email = 'printer@luciaprinting.com'");
    let printerId;
    
    if (printerUser.rows.length === 0) {
      printerId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          printerId,
          'printer',
          'Alice',
          'Williams',
          'printer@luciaprinting.com',
          '+6281234567894',
          hashedPassword,
          'printer',
          true,
          true,
          'active'
        ]
      );
      console.log('  ✅ Printer user created');
    } else {
      printerId = printerUser.rows[0].id;
      console.log('  ℹ️ Printer user already exists');
    }

    // Create test customer
    let customerUser = await query("SELECT id FROM users WHERE email = 'customer@example.com'");
    let customerUserId;
    let customerProfileId;
    
    if (customerUser.rows.length === 0) {
      customerUserId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          customerUserId,
          'customer',
          'Peter',
          'Jones',
          'customer@example.com',
          '+6281234567895',
          hashedPassword,
          'customer',
          true,
          true,
          'active'
        ]
      );
      console.log('  ✅ Customer user created');
    } else {
      customerUserId = customerUser.rows[0].id;
      console.log('  ℹ️ Customer user already exists');
    }

    // Create another test customer
    let customer2User = await query("SELECT id FROM users WHERE email = 'john.doe@company.com'");
    let customer2UserId;
    
    if (customer2User.rows.length === 0) {
      customer2UserId = uuidv4();
      await query(
        `INSERT INTO users (
          id, username, first_name, last_name, email, phone, password_hash,
          role, email_verified, is_active, status, company
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          customer2UserId,
          'john_doe',
          'John',
          'Doe',
          'john.doe@company.com',
          '+6281234567896',
          hashedPassword,
          'customer',
          true,
          true,
          'active',
          'ABC Corporation'
        ]
      );
      console.log('  ✅ Second customer user created');
    } else {
      customer2UserId = customer2User.rows[0].id;
      console.log('  ℹ️ Second customer user already exists');
    }

    // =====================================================
    // 2. CREATE EMPLOYEE PROFILES
    // =====================================================
    console.log('\n📦 Creating employee profiles...');

    // Admin employee profile
    const existingAdminEmp = await query("SELECT id FROM employee_profiles WHERE user_id = $1", [adminId]);
    if (existingAdminEmp.rows.length === 0) {
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          uuidv4(),
          adminId,
          'EMP001',
          'Management',
          'Owner/Administrator',
          '2024-01-01',
          15000000.00,
          'Sarah Administrator',
          '+6281234567890',
          'Jl. Sudirman No. 123, Jakarta',
          'Jakarta'
        ]
      );
      console.log('  ✅ Admin employee profile created');
    } else {
      console.log('  ℹ️ Admin employee profile already exists');
    }

    // Receptionist employee profile
    const existingReceptionistEmp = await query("SELECT id FROM employee_profiles WHERE user_id = $1", [receptionistId]);
    if (existingReceptionistEmp.rows.length === 0 && receptionistId) {
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          uuidv4(),
          receptionistId,
          'EMP002',
          'Front Office',
          'Receptionist',
          '2024-01-15',
          5000000.00,
          'Mary Doe',
          '+6281234567891',
          'Jl. Thamrin No. 45, Jakarta',
          'Jakarta'
        ]
      );
      console.log('  ✅ Receptionist employee profile created');
    }

    // Cashier employee profile
    const existingCashierEmp = await query("SELECT id FROM employee_profiles WHERE user_id = $1", [cashierId]);
    if (existingCashierEmp.rows.length === 0 && cashierId) {
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          uuidv4(),
          cashierId,
          'EMP003',
          'Finance',
          'Cashier',
          '2024-02-01',
          5500000.00,
          'John Smith',
          '+6281234567892',
          'Jl. Gatot Subroto No. 78, Jakarta',
          'Jakarta'
        ]
      );
      console.log('  ✅ Cashier employee profile created');
    }

    // Designer employee profile
    const existingDesignerEmp = await query("SELECT id FROM employee_profiles WHERE user_id = $1", [designerId]);
    if (existingDesignerEmp.rows.length === 0 && designerId) {
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          uuidv4(),
          designerId,
          'EMP004',
          'Design',
          'Graphic Designer',
          '2024-02-15',
          6500000.00,
          'Alice Johnson',
          '+6281234567893',
          'Jl. Rasuna Said No. 12, Jakarta',
          'Jakarta'
        ]
      );
      console.log('  ✅ Designer employee profile created');
    }

    // Printer employee profile
    const existingPrinterEmp = await query("SELECT id FROM employee_profiles WHERE user_id = $1", [printerId]);
    if (existingPrinterEmp.rows.length === 0 && printerId) {
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          uuidv4(),
          printerId,
          'EMP005',
          'Production',
          'Printer Operator',
          '2024-03-01',
          5750000.00,
          'Bob Williams',
          '+6281234567894',
          'Jl. Kuningan No. 34, Jakarta',
          'Jakarta'
        ]
      );
      console.log('  ✅ Printer employee profile created');
    }

    // =====================================================
    // 3. CREATE CUSTOMER PROFILES
    // =====================================================
    console.log('\n📦 Creating customer profiles...');

    // Get customer profile if exists
    const existingCustomerProfile = await query(
      "SELECT id FROM customer_profiles WHERE user_id = $1", 
      [customerUserId]
    );

    if (existingCustomerProfile.rows.length === 0) {
      customerProfileId = uuidv4();
      await query(
        `INSERT INTO customer_profiles (
          id, user_id, customer_code, company_name, billing_address, 
          shipping_address, city, country, customer_tier, loyalty_points
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          customerProfileId,
          customerUserId,
          'CUST001',
          'Personal Account',
          'Jl. Merdeka No. 56, Jakarta',
          'Jl. Merdeka No. 56, Jakarta',
          'Jakarta',
          'Indonesia',
          'regular',
          150
        ]
      );
      console.log('  ✅ Customer profile created');
    } else {
      customerProfileId = existingCustomerProfile.rows[0].id;
      console.log('  ℹ️ Customer profile already exists');
    }

    // Create second customer profile
    const existingCustomer2Profile = await query(
      "SELECT id FROM customer_profiles WHERE user_id = $1", 
      [customer2UserId]
    );
    let customer2ProfileId;

    if (existingCustomer2Profile.rows.length === 0) {
      customer2ProfileId = uuidv4();
      await query(
        `INSERT INTO customer_profiles (
          id, user_id, customer_code, company_name, tax_number,
          billing_address, shipping_address, city, country, 
          customer_tier, loyalty_points, credit_limit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          customer2ProfileId,
          customer2UserId,
          'CUST002',
          'ABC Corporation',
          '1234567890',
          'Jl. Bisnis No. 89, Jakarta Selatan',
          'Jl. Bisnis No. 89, Jakarta Selatan',
          'Jakarta Selatan',
          'Indonesia',
          'gold',
          500,
          10000000.00
        ]
      );
      console.log('  ✅ Second customer profile created');
    } else {
      customer2ProfileId = existingCustomer2Profile.rows[0].id;
      console.log('  ℹ️ Second customer profile already exists');
    }

    // =====================================================
    // 4. CREATE PRICE LIST ITEMS
    // =====================================================
    console.log('\n📦 Creating price list items...');

    const priceItems = [
      {
        code: 'PRINT_BW_A4',
        name: 'Black & White Print A4',
        category: 'printing',
        unit: 'per_page',
        price: 500.00
      },
      {
        code: 'PRINT_COLOR_A4',
        name: 'Color Print A4',
        category: 'printing',
        unit: 'per_page',
        price: 2000.00
      },
      {
        code: 'PRINT_BW_A3',
        name: 'Black & White Print A3',
        category: 'printing',
        unit: 'per_page',
        price: 1000.00
      },
      {
        code: 'PRINT_COLOR_A3',
        name: 'Color Print A3',
        category: 'printing',
        unit: 'per_page',
        price: 4000.00
      },
      {
        code: 'DESIGN_BASIC',
        name: 'Basic Design Service',
        category: 'design',
        unit: 'per_hour',
        price: 50000.00
      },
      {
        code: 'LAMINATING_A4',
        name: 'Laminating A4',
        category: 'finishing',
        unit: 'per_sheet',
        price: 3000.00
      },
      {
        code: 'BINDING',
        name: 'Binding Service',
        category: 'finishing',
        unit: 'per_book',
        price: 15000.00
      }
    ];

    for (const item of priceItems) {
      const existingItem = await query(
        "SELECT id FROM price_list WHERE service_code = $1",
        [item.code]
      );

      if (existingItem.rows.length === 0) {
        await query(
          `INSERT INTO price_list (
            id, service_code, service_name, category, unit_type, 
            base_price, is_active, tax_rate
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            uuidv4(),
            item.code,
            item.name,
            item.category,
            item.unit,
            item.price,
            true,
            11.00
          ]
        );
        console.log(`  ✅ Price item ${item.code} created`);
      } else {
        console.log(`  ℹ️ Price item ${item.code} already exists`);
      }
    }

    // =====================================================
    // 5. CREATE SAMPLE IMAGES/UPLOADS
    // =====================================================
    console.log('\n📦 Creating sample images...');

    // Sample image 1 (pending)
    const image1Id = uuidv4();
    const existingImage1 = await query(
      "SELECT id FROM images WHERE image_code = 'IMG-20240224-000001'"
    );

    if (existingImage1.rows.length === 0) {
      await query(
        `INSERT INTO images (
          id, image_code, filename, original_filename, file_path, 
          thumbnail_path, file_size, mime_type, width, height, 
          uploaded_by, customer_id, title, description, status, color_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          image1Id,
          'IMG-20240224-000001',
          'business_card_design.jpg',
          'business_card_front.jpg',
          '/uploads/images/business_card_design.jpg',
          '/uploads/thumbnails/business_card_design_thumb.jpg',
          2457600,
          'image/jpeg',
          1200,
          800,
          customerUserId,
          customerProfileId,
          'Business Card Design',
          'Front side design for business card',
          'pending',
          'CMYK'
        ]
      );
      console.log('  ✅ Sample image 1 created');
    }

    // Sample image 2 (approved)
    const image2Id = uuidv4();
    const existingImage2 = await query(
      "SELECT id FROM images WHERE image_code = 'IMG-20240224-000002'"
    );

    if (existingImage2.rows.length === 0) {
      await query(
        `INSERT INTO images (
          id, image_code, filename, original_filename, file_path, 
          thumbnail_path, file_size, mime_type, width, height, 
          uploaded_by, customer_id, title, description, status, 
          approved_by, approved_at, color_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          image2Id,
          'IMG-20240224-000002',
          'brochure_design.pdf',
          'company_brochure.pdf',
          '/uploads/images/brochure_design.pdf',
          '/uploads/thumbnails/brochure_thumb.jpg',
          5242880,
          'application/pdf',
          2480,
          3508,
          customer2UserId,
          customer2ProfileId,
          'Company Brochure',
          'Tri-fold brochure design',
          'approved',
          cashierId,
          new Date(),
          'CMYK'
        ]
      );
      console.log('  ✅ Sample image 2 created');
    }

    // Sample image 3 (completed)
    const image3Id = uuidv4();
    const existingImage3 = await query(
      "SELECT id FROM images WHERE image_code = 'IMG-20240224-000003'"
    );

    if (existingImage3.rows.length === 0) {
      await query(
        `INSERT INTO images (
          id, image_code, filename, original_filename, file_path, 
          thumbnail_path, file_size, mime_type, width, height, 
          uploaded_by, customer_id, title, description, status, 
          approved_by, approved_at, completed_at, color_mode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          image3Id,
          'IMG-20240224-000003',
          'poster_design.png',
          'event_poster.png',
          '/uploads/images/poster_design.png',
          '/uploads/thumbnails/poster_thumb.jpg',
          3670016,
          'image/png',
          1920,
          2560,
          customerUserId,
          customerProfileId,
          'Event Poster',
          'Concert event poster design',
          'completed',
          cashierId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          'RGB'
        ]
      );
      console.log('  ✅ Sample image 3 created');
    }

    // =====================================================
    // 6. CREATE ORDERS
    // =====================================================
    console.log('\n📦 Creating sample orders...');

    // Get image IDs
    const images = await query("SELECT id, image_code FROM images LIMIT 3");
    
    if (images.rows.length > 0) {
      // Order 1 - Completed
      const existingOrder1 = await query(
        "SELECT id FROM orders WHERE order_number = 'ORD-20240224-000001'"
      );

      if (existingOrder1.rows.length === 0) {
        const order1Id = uuidv4();
        await query(
          `INSERT INTO orders (
            id, order_number, customer_id, receptionist_id, order_date,
            required_by_date, status, subtotal, tax_amount, total_amount,
            payment_status, delivery_method, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            order1Id,
            'ORD-20240224-000001',
            customerProfileId,
            receptionistId,
            new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            'completed',
            150000.00,
            16500.00,
            166500.00,
            'paid',
            'pickup',
            'Regular order'
          ]
        );

        // Add order items
        if (images.rows[0]) {
          await query(
            `INSERT INTO order_items (
              id, order_id, image_id, description, quantity, unit_price, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              uuidv4(),
              order1Id,
              images.rows[0].id,
              'Business Card Printing',
              100,
              1500.00,
              150000.00
            ]
          );
        }
        console.log('  ✅ Sample order 1 created');
      }

      // Order 2 - Processing
      const existingOrder2 = await query(
        "SELECT id FROM orders WHERE order_number = 'ORD-20240224-000002'"
      );

      if (existingOrder2.rows.length === 0) {
        const order2Id = uuidv4();
        await query(
          `INSERT INTO orders (
            id, order_number, customer_id, receptionist_id, order_date,
            required_by_date, status, subtotal, tax_amount, total_amount,
            payment_status, delivery_method
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            order2Id,
            'ORD-20240224-000002',
            customer2ProfileId,
            receptionistId,
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            'processing',
            450000.00,
            49500.00,
            499500.00,
            'paid',
            'delivery'
          ]
        );

        // Add order items
        if (images.rows[1]) {
          await query(
            `INSERT INTO order_items (
              id, order_id, image_id, description, quantity, unit_price, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              uuidv4(),
              order2Id,
              images.rows[1].id,
              'Brochure Printing',
              50,
              9000.00,
              450000.00
            ]
          );
        }
        console.log('  ✅ Sample order 2 created');
      }
    }

    // =====================================================
    // 7. CREATE TRANSACTIONS
    // =====================================================
    console.log('\n📦 Creating sample transactions...');

    const orders = await query("SELECT id, customer_id, total_amount FROM orders LIMIT 2");
    
    for (let i = 0; i < orders.rows.length; i++) {
      const order = orders.rows[i];
      const existingTransaction = await query(
        "SELECT id FROM transactions WHERE order_id = $1",
        [order.id]
      );

      if (existingTransaction.rows.length === 0) {
        await query(
          `INSERT INTO transactions (
            id, transaction_type, order_id, customer_id, cashier_id,
            amount, tax_amount, total_amount, payment_method, 
            payment_status, payment_date, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            uuidv4(),
            'payment',
            order.id,
            order.customer_id,
            cashierId,
            order.total_amount / 1.11, // Approx before tax
            order.total_amount - (order.total_amount / 1.11),
            order.total_amount,
            i === 0 ? 'cash' : 'credit_card',
            'paid',
            new Date(Date.now() - (i === 0 ? 9 : 1) * 24 * 60 * 60 * 1000),
            i === 0 ? 'Paid in cash' : 'Paid by credit card'
          ]
        );
        console.log(`  ✅ Sample transaction ${i + 1} created`);
      }
    }

    // =====================================================
    // 8. CREATE PRINT JOBS
    // =====================================================
    console.log('\n📦 Creating sample print jobs...');

    const approvedImages = await query(
      "SELECT id FROM images WHERE status IN ('approved', 'completed') LIMIT 2"
    );

    for (let i = 0; i < approvedImages.rows.length; i++) {
      const image = approvedImages.rows[i];
      const existingPrintJob = await query(
        "SELECT id FROM print_jobs WHERE image_id = $1",
        [image.id]
      );

      if (existingPrintJob.rows.length === 0) {
        const isCompleted = i === 1; // Second one completed
        
        await query(
          `INSERT INTO print_jobs (
            id, image_id, printer_id, assigned_by, priority,
            quantity, copies, paper_size, paper_type, print_quality,
            color_print, double_sided, started_at, completed_at,
            is_urgent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            uuidv4(),
            image.id,
            printerId,
            adminId,
            i === 0 ? 1 : 0,
            100,
            1,
            'a4',
            'glossy',
            'standard',
            true,
            false,
            isCompleted ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : new Date(),
            isCompleted ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null,
            i === 0 ? true : false
          ]
        );
        console.log(`  ✅ Sample print job ${i + 1} created`);
      }
    }

    // =====================================================
    // 9. CREATE PRINTER MACHINES
    // =====================================================
    console.log('\n📦 Creating printer machines...');

    const printers = [
      {
        code: 'PRN001',
        name: 'Xerox VersaLink C7000',
        model: 'VersaLink C7000',
        manufacturer: 'Xerox',
        location: 'Production Room 1'
      },
      {
        code: 'PRN002',
        name: 'Canon imageRUNNER ADVANCE DX 7200',
        model: 'imageRUNNER ADVANCE DX 7200',
        manufacturer: 'Canon',
        location: 'Production Room 2'
      }
    ];

    for (const printer of printers) {
      const existingPrinter = await query(
        "SELECT id FROM printer_machines WHERE machine_code = $1",
        [printer.code]
      );

      if (existingPrinter.rows.length === 0) {
        await query(
          `INSERT INTO printer_machines (
            id, machine_code, machine_name, model, manufacturer, location,
            status, capabilities, total_pages_printed
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            uuidv4(),
            printer.code,
            printer.name,
            printer.model,
            printer.manufacturer,
            printer.location,
            'active',
            JSON.stringify({
              color: true,
              duplex: true,
              max_paper_size: 'A3',
              resolutions: ['600dpi', '1200dpi']
            }),
            15000
          ]
        );
        console.log(`  ✅ Printer machine ${printer.code} created`);
      }
    }

    // =====================================================
    // 10. CREATE ANNOUNCEMENTS
    // =====================================================
    console.log('\n📦 Creating announcements...');

    const announcements = [
      {
        title: 'System Maintenance',
        slug: 'system-maintenance-feb-2024',
        content: 'The system will undergo maintenance on Saturday, February 25, 2024 from 10 PM to 2 AM. Service may be interrupted during this time.',
        priority: 'high'
      },
      {
        title: 'New Printing Services Available',
        slug: 'new-printing-services',
        content: 'We are excited to announce new large format printing services now available! Visit our price list for details.',
        priority: 'normal'
      }
    ];

    for (const announcement of announcements) {
      const existingAnnouncement = await query(
        "SELECT id FROM announcements WHERE slug = $1",
        [announcement.slug]
      );

      if (existingAnnouncement.rows.length === 0) {
        await query(
          `INSERT INTO announcements (
            id, title, slug, content, summary, posted_by,
            target_roles, priority, is_published, publish_date, expiry_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            uuidv4(),
            announcement.title,
            announcement.slug,
            announcement.content,
            announcement.content.substring(0, 100) + '...',
            adminId,
            ['admin', 'receptionist', 'cashier', 'designer', 'printer'],
            announcement.priority,
            true,
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          ]
        );
        console.log(`  ✅ Announcement "${announcement.title}" created`);
      }
    }

    // =====================================================
    // 11. CREATE SYSTEM SETTINGS
    // =====================================================
    console.log('\n📦 Creating system settings...');

    const settings = [
      {
        key: 'company_name',
        value: 'Lucia Printing',
        type: 'string',
        category: 'general',
        description: 'Company name'
      },
      {
        key: 'company_email',
        value: 'info@luciaprinting.com',
        type: 'string',
        category: 'general',
        description: 'Company email'
      },
      {
        key: 'company_phone',
        value: '+628123456789',
        type: 'string',
        category: 'general',
        description: 'Company phone'
      },
      {
        key: 'tax_rate',
        value: '11.00',
        type: 'decimal',
        category: 'financial',
        description: 'Default tax rate percentage'
      },
      {
        key: 'enable_notifications',
        value: 'true',
        type: 'boolean',
        category: 'system',
        description: 'Enable system notifications'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        category: 'system',
        description: 'Maintenance mode status'
      }
    ];

    for (const setting of settings) {
      const existingSetting = await query(
        "SELECT id FROM system_settings WHERE setting_key = $1",
        [setting.key]
      );

      if (existingSetting.rows.length === 0) {
        await query(
          `INSERT INTO system_settings (
            id, setting_key, setting_value, setting_type, description, category, is_public, updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            uuidv4(),
            setting.key,
            setting.value,
            setting.type,
            setting.description,
            setting.category,
            true,
            adminId
          ]
        );
        console.log(`  ✅ System setting "${setting.key}" created`);
      }
    }

    // =====================================================
    // 12. CREATE FEEDBACK
    // =====================================================
    console.log('\n📦 Creating sample feedback...');

    const completedOrders = await query(
      "SELECT id FROM orders WHERE status = 'completed' LIMIT 1"
    );

    if (completedOrders.rows.length > 0) {
      const existingFeedback = await query(
        "SELECT id FROM feedback WHERE order_id = $1",
        [completedOrders.rows[0].id]
      );

      if (existingFeedback.rows.length === 0) {
        await query(
          `INSERT INTO feedback (
            id, customer_id, order_id, rating, comment, is_public, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            uuidv4(),
            customerProfileId,
            completedOrders.rows[0].id,
            5,
            'Great service! The prints were high quality and delivered on time.',
            true,
            'approved'
          ]
        );
        console.log('  ✅ Sample feedback created');
      }
    }

    // =====================================================
    // 13. CREATE SAMPLE CONVERSATION (CHAT)
    // =====================================================
    console.log('\n📦 Creating sample chat conversation...');

    const existingConversation = await query(
      "SELECT id FROM conversations WHERE title = 'Customer Support - Peter Jones'"
    );

    if (existingConversation.rows.length === 0) {
      const conversationId = uuidv4();
      
      // Create conversation
      await query(
        `INSERT INTO conversations (
          id, conversation_code, title, is_group, created_by, last_message_at
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          conversationId,
          'CONV-' + Date.now(),
          'Customer Support - Peter Jones',
          false,
          customerUserId,
          new Date()
        ]
      );

      // Add participants
      await query(
        `INSERT INTO conversation_participants (id, conversation_id, user_id, role) VALUES 
         ($1, $2, $3, $4),
         ($5, $2, $6, $7)`,
        [
          uuidv4(),
          conversationId,
          customerUserId,
          'member',
          uuidv4(),
          receptionistId,
          'admin'
        ]
      );

      // Add sample messages
      const messages = [
        {
          content: 'Hello, I need help with my print order',
          sender: customerUserId
        },
        {
          content: 'Of course! I\'d be happy to help. What seems to be the issue?',
          sender: receptionistId
        },
        {
          content: 'I uploaded some files yesterday but they are still pending',
          sender: customerUserId
        },
        {
          content: 'Let me check that for you. Can you provide the order number?',
          sender: receptionistId
        }
      ];

      for (const msg of messages) {
        const messageId = uuidv4();
        await query(
          `INSERT INTO messages (
            id, message_code, conversation_id, sender_id, message_type, content, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            messageId,
            'MSG-' + Date.now() + Math.random(),
            conversationId,
            msg.sender,
            'text',
            msg.content,
            new Date(Date.now() - (messages.length - messages.indexOf(msg)) * 60000)
          ]
        );

        // Add read receipt for last message
        if (msg.sender === receptionistId) {
          await query(
            `INSERT INTO message_read_receipts (id, message_id, user_id) VALUES ($1, $2, $3)`,
            [uuidv4(), messageId, customerUserId]
          );
        }
      }

      console.log('  ✅ Sample conversation created');
    }

    // =====================================================
    // 14. CREATE NOTIFICATIONS
    // =====================================================
    console.log('\n📦 Creating sample notifications...');

    const users = await query("SELECT id FROM users WHERE role IN ('customer', 'admin', 'receptionist') LIMIT 3");
    
    const notificationTypes = [
      { type: 'image_approved', title: 'Image Approved', message: 'Your image has been approved for printing' },
      { type: 'payment_received', title: 'Payment Received', message: 'Your payment has been processed successfully' },
      { type: 'print_completed', title: 'Print Job Completed', message: 'Your print job is ready for pickup' }
    ];

    for (let i = 0; i < users.rows.length && i < notificationTypes.length; i++) {
      const user = users.rows[i];
      const notifType = notificationTypes[i];
      
      const existingNotification = await query(
        "SELECT id FROM notifications WHERE user_id = $1 AND type = $2 AND title = $3",
        [user.id, notifType.type, notifType.title]
      );

      if (existingNotification.rows.length === 0) {
        await query(
          `INSERT INTO notifications (
            id, notification_code, user_id, type, title, message, is_read
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            uuidv4(),
            'NOTIF-' + Date.now() + i,
            user.id,
            notifType.type,
            notifType.title,
            notifType.message,
            i === 0 ? false : true
          ]
        );
        console.log(`  ✅ Sample notification ${i + 1} created`);
      }
    }

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n=============================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('=============================================');
    console.log('\n📊 Summary:');
    console.log('  Users created/verified: 6');
    console.log('  Employee profiles created/verified: 5');
    console.log('  Customer profiles created/verified: 2');
    console.log('  Price list items created/verified: 7');
    console.log('  Sample images created/verified: 3');
    console.log('  Sample orders created/verified: 2');
    console.log('  Sample transactions created/verified: 2');
    console.log('  Sample print jobs created/verified: 2');
    console.log('  Printer machines created/verified: 2');
    console.log('  Announcements created/verified: 2');
    console.log('  System settings created/verified: 6');
    console.log('  Sample feedback created/verified: 1');
    console.log('  Sample conversation created/verified: 1');
    console.log('  Sample notifications created/verified: 3');
    console.log('\n=============================================');
    console.log('🔑 Test Credentials:');
    console.log('  Admin: admin@luciaprinting.com / Admin@123');
    console.log('  Customer: customer@example.com / Test@123');
    console.log('  Receptionist: receptionist@luciaprinting.com / Test@123');
    console.log('  Cashier: cashier@luciaprinting.com / Test@123');
    console.log('  Designer: designer@luciaprinting.com / Test@123');
    console.log('  Printer: printer@luciaprinting.com / Test@123');
    console.log('=============================================');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;