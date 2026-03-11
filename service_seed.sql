-- =====================================================
-- SERVICE CATEGORIES SEED DATA
-- =====================================================

INSERT INTO service_categories (id, name, slug, description, icon_name, display_order) VALUES
-- Apparel Categories
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apparel Printing', 'apparel', 'Custom printing on t-shirts, hoodies, hats and more', 'Shirt', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'T-Shirts', 'tshirts', 'Custom t-shirt printing for any occasion', 'Shirt', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hoodies & Sweatshirts', 'hoodies', 'Comfortable custom hoodies for all seasons', 'ShoppingBag', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hats & Caps', 'hats', 'Custom headwear with embroidery or print', 'Shirt', 4),

-- Large Format Categories
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Banners & Signs', 'banners', 'Large format banners for indoor and outdoor', 'Megaphone', 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Posters', 'posters', 'High-quality posters for events and advertising', 'Camera', 6),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Vehicle Wraps', 'vehicle-wraps', 'Full and partial vehicle wraps', 'Car', 7),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Light Boxes', 'light-boxes', 'LED illuminated signs', 'Lightbulb', 8),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Neon Signs', 'neon-signs', 'Flexible LED neon signs', 'Sparkles', 9),

-- Stickers & Labels
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Stickers', 'stickers', 'Custom die-cut and kiss-cut stickers', 'Tag', 10),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Labels', 'labels', 'Product labels for packaging', 'Tag', 11),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Frosted Glass', 'frosted-glass', 'Privacy and decorative glass films', 'Snowflake', 12),

-- Drinkware
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Mugs', 'mugs', 'Custom printed mugs', 'Coffee', 13),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Bottles', 'bottles', 'Custom water bottles and tumblers', 'Wine', 14),

-- Print & Promo
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Business Cards', 'business-cards', 'Premium business cards', 'FileText', 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Flyers & Brochures', 'flyers', 'Marketing materials', 'FileText', 16),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Packaging', 'packaging', 'Custom boxes and packaging', 'Package', 17),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'Pens', 'pens', 'Promotional custom pens', 'Pen', 18),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'Keychains', 'keychains', 'Custom keychains', 'Key', 19),

-- Specialty
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'Engraving', 'engraving', 'Laser engraving on various materials', 'Flame', 20),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Screen Printing', 'screen-printing', 'Traditional screen printing for bulk', 'Printer', 21),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Embroidery', 'embroidery', 'Professional embroidery services', 'Sparkles', 22),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cutouts', 'cutouts', 'Custom die-cut shapes', 'Scissors', 23),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'Graphic Design', 'graphic-design', 'Professional design services', 'Palette', 24);

-- =====================================================
-- SERVICES SEED DATA
-- =====================================================

-- 1. DTF PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SRV-DTF-001',
    'DTF Printing',
    'dtf-printing',
    'Direct to Film printing for vibrant, durable designs on any fabric.',
    'DTF (Direct to Film) printing is our most popular service, offering vibrant colors and exceptional durability on any fabric type. Perfect for custom apparel, sportswear, and promotional items. The process involves printing your design onto a special film, applying adhesive powder, and then heat pressing it onto the fabric. This method works on cotton, polyester, blends, nylon, leather, and more.',
    'Printer',
    'from-purple-500',
    'to-pink-500',
    'Most Popular',
    'apparel',
    'ETB 150 - 500',
    '1 piece',
    '2-3 days',
    true, true, false,
    1,
    'active',
    'Professional DTF Printing Services | Custom Apparel Printing',
    'High-quality DTF printing for custom apparel. Vibrant colors, durable prints on any fabric. Perfect for t-shirts, hoodies, and more.',
    'DTF printing, direct to film, custom apparel, t-shirt printing, fabric printing',
    NOW(), NOW()
  ) RETURNING id
)
-- Features
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Any fabric type - cotton, polyester, blends, nylon, leather',
  'Vibrant colors with high opacity',
  'Wash durable - 50+ washes',
  'No minimum order quantity',
  'Fast turnaround - 2-3 days',
  'High resolution up to 1440 DPI',
  'Soft hand feel - no heavy layer',
  'Stretchable without cracking'
]), generate_series(1,8)
FROM inserted_service;

-- Applications
INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'T-Shirts & Apparel',
  'Sportswear & Jerseys',
  'Work Uniforms',
  'Promotional Items',
  'Bags & Totes',
  'Hoodies & Sweatshirts',
  'Baby Clothes',
  'Pet Apparel'
]), generate_series(1,8)
FROM inserted_service;

-- Process Steps
INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Upload Design', 'Upload your artwork in PNG, AI, or PSD format', 'Upload', 1),
  (2, 'Color Separation', 'We prepare your design for DTF printing', 'Palette', 2),
  (3, 'Print on Film', 'Design printed on special DTF film', 'Printer', 3),
  (4, 'Apply Adhesive', 'Hot melt adhesive powder applied', 'Sparkles', 4),
  (5, 'Heat Press', 'Design transferred to your garment', 'Flame', 5),
  (6, 'Quality Check', 'Final inspection and packaging', 'CheckCircle', 6)
) AS s(step_number, title, description, icon_name, display_order);

-- Specifications
INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Print Size', '16" x 20"', 1),
  ('Resolution', '1440 DPI', 2),
  ('Color Mode', 'CMYK + White', 3),
  ('Washability', '50+ washes', 4)
) AS s(label, value, display_order);

-- Materials
INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Cotton', 'Polyester', 'Cotton-Polyester Blends', 'Nylon', 
  'Leather', 'Denim', 'Canvas', 'Rayon'
]), generate_series(1,8)
FROM inserted_service;

-- Formats
INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'PNG', 'AI', 'PSD', 'PDF', 'EPS', 'TIFF'
]), generate_series(1,6)
FROM inserted_service;

-- Colors
INSERT INTO service_colors (id, service_id, color, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Full Color CMYK', 'Spot Colors', 'White Underbase', 'Neon Colors', 'Metallic Options'
]), generate_series(1,5)
FROM inserted_service;

-- FAQs
INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is DTF printing?', 'DTF (Direct to Film) is a printing method where your design is printed onto a special film, coated with adhesive, and then heat pressed onto fabric. It works on almost any material and produces vibrant, durable prints.', 1),
  ('How durable are DTF prints?', 'DTF prints are extremely durable and can withstand 50+ washes without fading or cracking when properly cared for.', 2),
  ('Can you print on dark colored garments?', 'Yes! DTF printing works perfectly on any color, including black. We use a white underbase to ensure vibrant colors on dark fabrics.', 3),
  ('What is the turnaround time?', 'Standard turnaround is 2-3 business days. Rush orders may be available for an additional fee.', 4)
) AS s(question, answer, display_order);

-- 2. T-SHIRT PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'SRV-TSHIRT-001',
    'T-Shirt Printing',
    't-shirt-printing',
    'Custom t-shirts using DTF, screen printing, and DTG methods.',
    'Premium custom t-shirt printing for any occasion. We offer multiple printing methods including DTF for full color, screen printing for bulk orders, and DTG for detailed designs. Whether you need one shirt or thousands, we have the perfect solution for your project.',
    'Shirt',
    'from-red-500',
    'to-pink-500',
    'Best Seller',
    'tshirts',
    'ETB 200 - 600',
    '1 piece',
    '2-4 days',
    true, true, true,
    2,
    'active',
    'Custom T-Shirt Printing | DTF, Screen Printing & DTG',
    'Professional t-shirt printing services. Choose from DTF, screen printing, or DTG. Perfect for events, teams, and business.',
    't-shirt printing, custom t-shirts, screen printing, dtf printing, dtg printing',
    NOW(), NOW()
  ) RETURNING id
)
-- Features
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Multiple printing methods',
  'All colors available',
  'Bulk discounts up to 40%',
  'Design assistance included',
  'Fast delivery',
  'Quality guarantee',
  'Eco-friendly options',
  'Size range XS-5XL'
]), generate_series(1,8)
FROM inserted_service;

-- Applications
INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Event T-Shirts',
  'Team Uniforms',
  'Corporate Branding',
  'Family Reunions',
  'School Spirit Wear',
  'Bachelorette Parties',
  'Fundraising Events',
  'Sports Teams'
]), generate_series(1,8)
FROM inserted_service;

-- Process Steps
INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Choose Style', 'Select t-shirt style, color, and quantity', 'Shirt', 1),
  (2, 'Upload Design', 'Submit your artwork or describe your idea', 'Upload', 2),
  (3, 'Get Proof', 'Receive digital proof for approval', 'Eye', 3),
  (4, 'Production', 'Your shirts are printed with care', 'Printer', 4),
  (5, 'Quality Check', 'Each shirt is inspected', 'CheckCircle', 5),
  (6, 'Delivery', 'Shipped to your door', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

-- Specifications
INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Print Methods', 'DTF, Screen Print, DTG', 1),
  ('Max Colors', 'Full CMYK', 2),
  ('Fabric Types', 'Cotton, Polyester, Blends', 3),
  ('Size Range', 'XS to 5XL', 4)
) AS s(label, value, display_order);

-- Materials
INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  '100% Cotton', '100% Polyester', 'Tri-Blend', 'Ring-spun Cotton', 
  'Organic Cotton', 'Performance Fabric'
]), generate_series(1,6)
FROM inserted_service;

-- Formats
INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PNG', 'PDF', 'PSD', 'JPG', 'EPS'
]), generate_series(1,6)
FROM inserted_service;

-- Colors
INSERT INTO service_colors (id, service_id, color, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'White', 'Black', 'Navy', 'Red', 'Royal Blue', 'Forest Green', 'Maroon', 'Gray'
]), generate_series(1,8)
FROM inserted_service;

-- FAQs
INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What t-shirt brands do you use?', 'We use premium brands including Gildan, Bella+Canvas, Hanes, and Anvil. We can also print on customer-supplied shirts.', 1),
  ('What is the best printing method for my design?', 'For full-color photos and complex designs, DTF is best. For simple designs in bulk, screen printing is most economical. For small quantities, DTG works well.', 2),
  ('What is the minimum order?', 'Minimum order is just 1 piece for DTF printing. Screen printing requires 24 pieces minimum.', 3)
) AS s(question, answer, display_order);

-- 3. CUSTOM HATS & CAPS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'SRV-HATS-001',
    'Custom Hats & Caps',
    'custom-hats-caps',
    'Personalized hats and caps with embroidery or printed designs.',
    'Make a statement with custom headwear for your team, brand, or event. We offer a wide range of hat styles including baseball caps, snapbacks, beanies, visors, and trucker hats. Choose from embroidery for a premium look or printed designs for full-color artwork.',
    'Shirt',
    'from-blue-500',
    'to-cyan-500',
    'Trending',
    'hats',
    'ETB 180 - 450',
    '10 pieces',
    '4-6 days',
    false, true, true,
    3,
    'active',
    'Custom Hats & Caps | Embroidery & Printed Headwear',
    'Professional custom hat printing and embroidery. Baseball caps, snapbacks, beanies. Perfect for teams and events.',
    'custom hats, embroidered caps, printed hats, baseball caps, snapbacks',
    NOW(), NOW()
  ) RETURNING id
)
-- Features
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Embroidery included',
  'Printed options available',
  'Adjustable fit styles',
  'Various crown styles',
  'Bulk discounts',
  'Fast delivery',
  'Custom patches',
  '3D puff embroidery'
]), generate_series(1,8)
FROM inserted_service;

-- Applications
INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Events',
  'Sports Teams',
  'Trade Shows',
  'Golf Tournaments',
  'Brand Promotion',
  'Wedding Parties',
  'Music Festivals',
  'Streetwear Brands'
]), generate_series(1,8)
FROM inserted_service;

-- Process Steps
INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Choose Style', 'Select hat style and color', 'Shirt', 1),
  (2, 'Submit Logo', 'Upload your artwork', 'Upload', 2),
  (3, 'Digitize', 'We prepare your design for embroidery', 'Sparkles', 3),
  (4, 'Production', 'Your hats are embroidered', 'Printer', 4),
  (5, 'Quality Check', 'Each hat inspected', 'CheckCircle', 5),
  (6, 'Ship', 'Delivered to your location', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

-- Specifications
INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Embroidery', 'Up to 12 colors', 1),
  ('Max Stitches', '15,000', 2),
  ('Hat Styles', 'Baseball, Snapback, Beanie, Visor', 3),
  ('Closure', 'Adjustable, Strapback, Flexfit', 4)
) AS s(label, value, display_order);

-- Materials
INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Cotton Twill', 'Polyester', 'Wool Blend', 'Acrylic', 'Mesh Back', 'Denim'
]), generate_series(1,6)
FROM inserted_service;

-- Formats
INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PNG', 'PDF', 'EPS', 'DST', 'PES'
]), generate_series(1,6)
FROM inserted_service;

-- FAQs
INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can I get a sample before bulk order?', 'Yes! We offer sample service for bulk orders. Order 1-2 pieces to approve quality before placing your full order.', 1),
  ('What is the difference between embroidery and print?', 'Embroidery is stitched thread for a premium, textured look that lasts forever. Printing allows full-color, photo-realistic designs but may fade over time.', 2),
  ('Do you offer custom patches?', 'Yes! We can create custom woven or embroidered patches that can be attached to hats.', 3)
) AS s(question, answer, display_order);

-- 4. BANNER PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'SRV-BANNER-001',
    'Banner Printing',
    'banner-printing',
    'Large format banners for indoor and outdoor advertising.',
    'High-quality banner printing for events, retail displays, trade shows, and outdoor advertising. We offer various materials including vinyl, mesh, and fabric, with finishes to suit any environment. Our banners are weather-resistant and built to last.',
    'Megaphone',
    'from-red-500',
    'to-orange-500',
    'Popular',
    'banners',
    'ETB 250 - 2000',
    '1 piece',
    '1-2 days',
    true, true, false,
    4,
    'active',
    'Professional Banner Printing | Indoor & Outdoor Banners',
    'High-quality custom banner printing. Indoor and outdoor options, various sizes, weather-resistant. Perfect for events and advertising.',
    'banner printing, vinyl banners, mesh banners, outdoor signs, event banners',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Indoor/outdoor options',
  'Multiple sizes up to 5m',
  'Grommets included',
  'Weather resistant',
  'UV protection',
  'Fast production',
  'Hemmed edges',
  'Pole pockets available'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Trade Show Displays',
  'Store Fronts',
  'Event Backdrops',
  'Construction Sites',
  'Retail Promotions',
  'Festivals & Fairs',
  'Political Campaigns',
  'Real Estate Signs'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Upload Design', 'Submit your artwork', 'Upload', 1),
  (2, 'Size Selection', 'Choose dimensions and material', 'Ruler', 2),
  (3, 'Proof Approval', 'Review digital proof', 'Eye', 3),
  (4, 'Printing', 'Large format printing', 'Printer', 4),
  (5, 'Finishing', 'Add grommets, hems, or pockets', 'Scissors', 5),
  (6, 'Delivery', 'Shipped or ready for pickup', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Width', '5 meters', 1),
  ('Resolution', '720 DPI', 2),
  ('Material Options', 'Vinyl, Mesh, Fabric', 3),
  ('Finishing', 'Grommets, Hems, Pockets', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Vinyl Banner', 'Mesh Banner', 'Fabric Banner', 'Backlit Film', 'Scrim Vinyl', 'Blockout Vinyl'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the difference between vinyl and mesh?', 'Vinyl is solid and waterproof, ideal for general use. Mesh has small holes that allow wind to pass through, making it perfect for large outdoor banners in windy areas.', 1),
  ('How do I install my banner?', 'Banners come with grommets (metal rings) every 2-3 feet for easy hanging with zip ties or rope. We can also add pole pockets for display on stands.', 2),
  ('What file format should I use?', 'We accept AI, PDF, TIFF, JPG, and PSD. For best results, provide vector files at actual size.', 3)
) AS s(question, answer, display_order);

-- 5. CUSTOM STICKERS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    'SRV-STICKER-001',
    'Custom Stickers',
    'custom-stickers',
    'Die-cut and kiss-cut stickers in various finishes.',
    'High-quality custom stickers perfect for branding, products, and promotions. Choose from various shapes, sizes, and finishes including matte, glossy, and transparent. Our stickers are weather-resistant and durable, suitable for indoor and outdoor use.',
    'Tag',
    'from-yellow-500',
    'to-orange-500',
    'Popular',
    'stickers',
    'ETB 100 - 1000',
    '10 pieces',
    '2-3 days',
    true, true, false,
    5,
    'active',
    'Custom Stickers | Die-Cut & Kiss-Cut | Waterproof Vinyl',
    'Professional custom sticker printing. Die-cut, kiss-cut, waterproof vinyl. Perfect for branding and promotions.',
    'custom stickers, die-cut stickers, kiss-cut stickers, vinyl stickers, waterproof stickers',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Custom die-cut shapes',
  'Kiss-cut on sheets or rolls',
  'Matte/glossy finish',
  'Weather resistant',
  'Small to bulk orders',
  'Fast turnaround',
  'Easy application',
  'Removable options'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Product Branding',
  'Laptop Decals',
  'Water Bottles',
  'Car Bumpers',
  'Packaging Seals',
  'Event Giveaways',
  'Business Branding',
  'Scrapbooking'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create or upload your artwork', 'Palette', 1),
  (2, 'Shape Selection', 'Choose custom or standard shape', 'Scissors', 2),
  (3, 'Material', 'Select vinyl type and finish', 'Tag', 3),
  (4, 'Proof', 'Approve digital proof', 'Eye', 4),
  (5, 'Production', 'Print and cut your stickers', 'Printer', 5),
  (6, 'Packaging', 'Shipped on sheets or rolls', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Size', '12" x 24"', 1),
  ('Materials', 'Vinyl, Paper, Clear', 2),
  ('Finishes', 'Matte, Glossy', 3),
  ('Cut Type', 'Die-cut, Kiss-cut', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'White Vinyl', 'Clear Vinyl', 'Matte Paper', 'Glossy Paper', 'Weatherproof Vinyl', 'Removable Vinyl'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PNG', 'PDF', 'EPS', 'SVG', 'PSD'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the difference between die-cut and kiss-cut?', 'Die-cut stickers are cut through the material to the exact shape. Kiss-cut stickers are cut through the sticker layer but leave the backing intact, making them easy to peel.', 1),
  ('Are your stickers waterproof?', 'Yes! Our vinyl stickers are waterproof and weather-resistant, perfect for outdoor use on cars, water bottles, and more.', 2),
  ('What is the minimum order?', 'Minimum order is just 10 pieces, but we can print as few as 1 for custom shapes.', 3)
) AS s(question, answer, display_order);

-- 6. MUG PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'SRV-MUG-001',
    'Mug Printing',
    'mug-printing',
    'Custom printed mugs for gifts and promotions.',
    'Personalized ceramic mugs perfect for corporate gifts, events, and personal use. Full-color printing with sublimation technology for durable, dishwasher-safe results. Choose from standard white mugs or colored options with white printing areas.',
    'Coffee',
    'from-orange-500',
    'to-red-500',
    'Gift Idea',
    'mugs',
    'ETB 120 - 350',
    '6 pieces',
    '3-4 days',
    false, true, true,
    6,
    'active',
    'Custom Mug Printing | Photo Gifts | Sublimation Printing',
    'Personalized ceramic mugs with photo-quality printing. Perfect for gifts, corporate events, and promotions.',
    'custom mugs, photo mugs, printed mugs, sublimation mugs, coffee mugs',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Full color printing',
  'Dishwasher safe',
  'Various sizes',
  'Bulk pricing',
  'Fast turnaround',
  'Gift packaging',
  'Photo quality prints',
  'Magic mug options'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Gifts',
  'Wedding Favors',
  'Family Photos',
  'Business Promotions',
  'Thank You Gifts',
  'Event Souvenirs',
  'Holiday Gifts',
  'Employee Recognition'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Choose Mug', 'Select size and color', 'Coffee', 1),
  (2, 'Upload Design', 'Submit your artwork or photo', 'Upload', 2),
  (3, 'Proof', 'Approve digital mockup', 'Eye', 3),
  (4, 'Print', 'Sublimation printing', 'Printer', 4),
  (5, 'Heat Press', 'Design permanently fused', 'Flame', 5),
  (6, 'Package', 'Gift boxed and shipped', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Sizes', '11oz, 15oz, Espresso', 1),
  ('Material', 'Ceramic', 2),
  ('Print Area', 'Full wrap', 3),
  ('Care', 'Dishwasher safe', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'White Ceramic', 'Black Ceramic', 'Color Ceramic', 'Enamel', 'Travel Mugs', 'Magic Mugs'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can I print photos on mugs?', 'Yes! Photo quality printing is our specialty. Send us your favorite photos and we ll create beautiful, lasting memories on mugs.', 1),
  ('Are the prints dishwasher safe?', 'Absolutely! Our sublimation prints become part of the mug coating and are completely dishwasher safe for years of use.', 2),
  ('What is the minimum order?', 'Minimum order is 6 pieces for custom mug printing.', 3)
) AS s(question, answer, display_order);

-- 7. BOTTLE PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'SRV-BOTTLE-001',
    'Bottle Printing',
    'bottle-printing',
    'Custom printed water bottles, tumblers, and drinkware.',
    'Personalized stainless steel bottles, tumblers, and glassware. Perfect for corporate gifts, events, and eco-friendly promotions. Our durable printing lasts through daily use and washing. Choose from various styles including insulated bottles, wine glasses, and shot glasses.',
    'Wine',
    'from-blue-500',
    'to-indigo-500',
    'Eco-Friendly',
    'bottles',
    'ETB 250 - 800',
    '10 pieces',
    '4-5 days',
    false, false, true,
    7,
    'active',
    'Custom Bottle Printing | Stainless Steel & Glass Drinkware',
    'Personalized water bottles, tumblers, and glassware. Eco-friendly, durable printing for corporate gifts.',
    'custom bottles, printed water bottles, personalized tumblers, drinkware printing',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Stainless steel options',
  'Glass available',
  'Insulated styles',
  'Dishwasher safe',
  'Bulk discounts',
  'Custom colors',
  'Engraving available',
  'Gift packaging'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Gifts',
  'Eco-Friendly Promos',
  'Wedding Favors',
  'Sports Teams',
  'Gym Promotions',
  'Outdoor Events',
  'Brand Merchandise',
  'Thank You Gifts'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Select Bottle', 'Choose style and color', 'Wine', 1),
  (2, 'Design', 'Upload your logo or artwork', 'Upload', 2),
  (3, 'Proof', 'Approve digital mockup', 'Eye', 3),
  (4, 'Print/Engrave', 'Apply your design', 'Printer', 4),
  (5, 'Quality Check', 'Inspect each bottle', 'CheckCircle', 5),
  (6, 'Package', 'Gift box and ship', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Stainless Steel, Glass', 1),
  ('Sizes', '12oz, 16oz, 20oz, 32oz', 2),
  ('Print Method', 'Sublimation, Engraving', 3),
  ('Insulation', 'Double-wall available', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Stainless Steel', 'Glass', 'Tritan Plastic', 'Aluminum', 'Copper-lined', 'Ceramic'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can you print on both stainless steel and glass?', 'Yes! We offer sublimation printing on stainless steel and ceramic coating on glass for durable, beautiful results on both materials.', 1),
  ('How durable is the print?', 'Our prints are extremely durable and designed to last through daily use and dishwasher cycles without fading or peeling.', 2),
  ('Do you offer bulk discounts?', 'Yes! Significant discounts available for orders of 50+ pieces. Contact us for custom quotes.', 3)
) AS s(question, answer, display_order);

-- 8. LIGHT BOX
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    'SRV-LIGHTBOX-001',
    'Light Box',
    'light-box',
    'LED illuminated signs for eye-catching displays.',
    'Professional LED light boxes for retail, business signage, and events. Custom sizes and designs with bright, energy-efficient LED lighting. Our light boxes create stunning visual impact day and night, perfect for storefronts, trade shows, and interior displays.',
    'Lightbulb',
    'from-yellow-500',
    'to-amber-500',
    'Premium',
    'light-boxes',
    'ETB 1500 - 5000',
    '1 piece',
    '5-7 days',
    true, false, false,
    8,
    'active',
    'LED Light Boxes | Custom Illuminated Signs',
    'Professional LED light boxes for retail and business signage. Custom sizes, energy-efficient, stunning illumination.',
    'light box, LED sign, illuminated sign, retail signage, custom light box',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'LED illumination',
  'Custom sizes',
  'Energy efficient',
  'Long lifespan',
  'Indoor/outdoor',
  'Easy installation',
  'Even lighting',
  'Slim profile'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Store Fronts',
  'Menu Boards',
  'Trade Show Displays',
  'Wayfinding Signs',
  'Brand Displays',
  'Museum Exhibits',
  'Hotel Lobbies',
  'Restaurant Signs'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create your artwork', 'Palette', 1),
  (2, 'Size Selection', 'Choose dimensions', 'Ruler', 2),
  (3, 'Frame Build', 'Construct aluminum frame', 'Package', 3),
  (4, 'LED Installation', 'Install LED lighting', 'Lightbulb', 4),
  (5, 'Print Face', 'Print graphic on acrylic', 'Printer', 5),
  (6, 'Assembly', 'Complete and test', 'CheckCircle', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Frame Material', 'Aluminum', 1),
  ('Face Material', 'Acrylic', 2),
  ('LED Type', 'SMD 2835', 3),
  ('Lifespan', '50,000 hours', 4)
) AS s(label, value, display_order);

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can I change the graphic later?', 'Yes! Many of our light boxes feature removable faces, allowing you to update graphics as needed without replacing the entire unit.', 1),
  ('Are they suitable for outdoor use?', 'Absolutely! We offer weatherproof options with sealed frames and UV-protected faces specifically designed for outdoor installation.', 2),
  ('What is the turnaround time?', 'Standard production takes 5-7 business days. Rush orders may be available for an additional fee.', 3)
) AS s(question, answer, display_order);

-- 9. NEO LIGHT (LED NEON)
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'SRV-NEON-001',
    'Neo Light (LED Neon)',
    'neo-light',
    'Flexible LED neon signs with modern appeal.',
    'Modern LED neon signs that mimic the look of traditional glass neon but are flexible, durable, and energy-efficient. Perfect for business signs, home decor, and events. Create custom shapes, logos, and text with our flexible LED tubing in various colors.',
    'Sparkles',
    'from-pink-500',
    'to-purple-500',
    'Trending',
    'neon-signs',
    'ETB 2000 - 8000',
    '1 piece',
    '7-10 days',
    false, true, true,
    9,
    'active',
    'LED Neon Signs | Custom Neo Light Signs',
    'Custom flexible LED neon signs for business and home decor. Energy-efficient, durable, fully customizable.',
    'led neon signs, neo light, custom neon, flexible neon, led signage',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Flexible design',
  'Energy efficient',
  'Custom shapes',
  'Durable',
  'Indoor/outdoor',
  'Remote control',
  'Dimmable options',
  'RGB color changing'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Business Logos',
  'Wedding Backdrops',
  'Home Decor',
  'Bar Signs',
  'Store Windows',
  'Photo Booths',
  'Kids Room Decor',
  'Event Branding'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Sketch Idea', 'Share your concept', 'Palette', 1),
  (2, 'Digital Design', 'Create vector artwork', 'PenTool', 2),
  (3, 'Size Selection', 'Choose dimensions', 'Ruler', 3),
  (4, 'LED Fabrication', 'Bend and assemble', 'Sparkles', 4),
  (5, 'Backer Board', 'Mount on acrylic', 'Package', 5),
  (6, 'Test & Ship', 'Quality check and delivery', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('LED Type', 'Flexible Neon', 1),
  ('Colors', 'Single, Multi, RGB', 2),
  ('Power', '12V DC', 3),
  ('Lifespan', '50,000 hours', 4)
) AS s(label, value, display_order);

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('How does LED neon compare to glass neon?', 'LED neon is safer (no glass, low voltage), more durable, energy-efficient, and flexible. It can be shaped into custom designs that would be impossible with glass.', 1),
  ('Can I hang it outdoors?', 'Yes! Our LED neon signs are weather-resistant and suitable for both indoor and outdoor use. We can add weatherproofing for exposed installations.', 2),
  ('Can I get RGB color changing?', 'Yes! We offer RGB options with remote control for multiple color effects and dimming.', 3)
) AS s(question, answer, display_order);

-- 10. SCREEN PRINTING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    'SRV-SCREEN-001',
    'Screen Printing',
    'screen-printing',
    'Traditional screen printing for bulk orders with excellent color payoff.',
    'Screen printing is the industry standard for bulk orders, offering excellent color payoff and cost-effectiveness for larger quantities. Ideal for team uniforms, events, and merchandise. Each color is applied through a separate screen, creating vibrant, durable prints that last.',
    'Layers',
    'from-blue-500',
    'to-cyan-500',
    'Best for Bulk',
    'screen-printing',
    'ETB 120 - 400',
    '24 pieces',
    '5-7 days',
    true, true, false,
    10,
    'active',
    'Screen Printing Services | Bulk Order Printing',
    'Professional screen printing for bulk apparel orders. Spot colors, Pantone matching, durable prints.',
    'screen printing, bulk t-shirt printing, custom screen printing, apparel printing',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Bulk orders - best pricing for 24+ pieces',
  'Spot colors with Pantone matching',
  'Cost effective for large quantities',
  'Durable prints that last',
  'Specialty inks available',
  'Underbase for dark garments',
  'Simulated process for full color',
  'Discharge printing option'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Team Uniforms',
  'Event T-Shirts',
  'Band Merchandise',
  'School Spirit Wear',
  'Corporate Apparel',
  'Festival T-Shirts',
  'Sports Jerseys',
  'Promotional Wear'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Artwork Prep', 'Separate colors and prepare films', 'Palette', 1),
  (2, 'Screen Creation', 'Expose screens for each color', 'Layers', 2),
  (3, 'Setup', 'Register screens on press', 'Settings', 3),
  (4, 'Print', 'Apply colors layer by layer', 'Printer', 4),
  (5, 'Flash Cure', 'Partial cure between colors', 'Flame', 5),
  (6, 'Final Cure', 'Heat set for durability', 'CheckCircle', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Colors', 'Up to 6 spot colors', 1),
  ('Sim Process', 'Up to 4 colors', 2),
  ('Min Order', '24 pieces', 3),
  ('Artwork', 'Vector required', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  '100% Cotton', 'Cotton/Polyester Blends', 'Performance Fabrics', 'Dark Garments', 'Light Garments', 'Hoodies'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the minimum order for screen printing?', 'Our minimum order is 24 pieces for screen printing to make it cost-effective. For smaller quantities, we recommend DTF printing.', 1),
  ('How many colors can you print?', 'We can print up to 6 spot colors. For full-color designs, we offer simulated process printing using 4 colors.', 2),
  ('What file format do you need?', 'We require vector files (AI, EPS, PDF) for screen printing. Our designers can convert your files if needed.', 3)
) AS s(question, answer, display_order);

-- 11. EMBROIDERY
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'SRV-EMBROIDERY-001',
    'Embroidery',
    'embroidery',
    'Professional embroidery for a premium, textured look.',
    'Add a touch of class with our professional embroidery service. Perfect for corporate wear, caps, jackets, and bags. We offer digitizing services and thread matching for a premium finish that lasts forever. Embroidery adds texture and dimension that stands out.',
    'Sparkles',
    'from-green-500',
    'to-emerald-500',
    'Premium',
    'embroidery',
    'ETB 180 - 550',
    '6 pieces',
    '5-7 days',
    true, true, false,
    11,
    'active',
    'Professional Embroidery Services | Custom Logo Embroidery',
    'Premium custom embroidery for corporate wear, caps, and jackets. Digitizing included, thread matching, 3D puff option.',
    'embroidery, custom embroidery, logo embroidery, digitizing, 3d puff embroidery',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  '3D puff embroidery option',
  'Perfect thread matching',
  'Digitizing included',
  'Multiple placement options',
  'Bulk discounts available',
  'Professional finish',
  'Left chest, full front, sleeve',
  'Back embroidery available'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Polos',
  'Company Caps',
  'Team Jackets',
  'Uniforms',
  'Golf Shirts',
  'Workwear',
  'Tote Bags',
  'Hoodies'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Digitize', 'Convert artwork to stitch file', 'Sparkles', 1),
  (2, 'Thread Select', 'Match thread colors', 'Palette', 2),
  (3, 'Hoop', 'Mount garment in hoop', 'Package', 3),
  (4, 'Stitch', 'Machine embroidery', 'Printer', 4),
  (5, 'Trim', 'Remove excess threads', 'Scissors', 5),
  (6, 'Press', 'Final pressing', 'Flame', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Stitches', '15,000 per design', 1),
  ('Max Size', '12" x 12"', 2),
  ('Colors', 'Up to 12 thread colors', 3),
  ('Min Order', '6 pieces', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Polo Shirts', 'Caps & Hats', 'Jackets', 'Hoodies', 'Tote Bags', 'Aprons'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PNG', 'JPG', 'DST', 'PES', 'EXP'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is digitizing?', 'Digitizing is the process of converting your logo into a stitch file that embroidery machines can read. It determines stitch types, directions, and densities for the best result.', 1),
  ('How long does embroidery last?', 'Embroidery is permanent and will last as long as the garment itself. It won\t fade, crack, or peel like printed designs.', 2),
  ('What is 3D puff embroidery?', '3D puff uses a foam underlay to create raised, three-dimensional text or logos for a standout effect.', 3)
) AS s(question, answer, display_order);

-- 12. BUSINESS CARDS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'SRV-CARDS-001',
    'Business Cards',
    'business-cards',
    'Premium business cards with various finishes.',
    'Make a lasting impression with our premium business cards. Choose from various paper stocks, finishes, and special effects like foil stamping and embossing. Your business card is often the first physical representation of your brand - make it count.',
    'FileText',
    'from-gray-500',
    'to-gray-700',
    'Essential',
    'business-cards',
    'ETB 250 - 800',
    '100 pieces',
    '2-3 days',
    true, true, false,
    12,
    'active',
    'Premium Business Cards | Custom Design & Printing',
    'High-quality custom business cards with foil stamping, embossing, spot UV. Make a lasting impression.',
    'business cards, custom business cards, premium business cards, foil stamping, embossing',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Premium paper stocks',
  'Foil stamping options',
  'Spot UV coating',
  'Embossing and debossing',
  'Rounded corners',
  'Matching sets',
  'Thick card stock',
  'Matte or gloss finish'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Professionals',
  'Small Business Owners',
  'Freelancers',
  'Real Estate Agents',
  'Artists & Creatives',
  'Networkers',
  'Event Planners',
  'Consultants'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create or upload design', 'Palette', 1),
  (2, 'Paper Select', 'Choose paper stock', 'FileText', 2),
  (3, 'Finishes', 'Select special effects', 'Sparkles', 3),
  (4, 'Proof', 'Approve digital proof', 'Eye', 4),
  (5, 'Print', 'Professional printing', 'Printer', 5),
  (6, 'Cut', 'Precision cutting', 'Scissors', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Standard Size', '85mm x 55mm', 1),
  ('Paper Weight', '300-400gsm', 2),
  ('Finishes', 'Matte, Gloss, Silk', 3),
  ('Special Effects', 'Foil, UV, Emboss', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Matte Cardstock', 'Gloss Cardstock', 'Recycled Paper', 'Kraft Paper', 'Plastic Cards', 'Soft-touch Laminate'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'PSD', 'INDD', 'EPS', 'JPG'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the best paper weight for business cards?', 'We recommend 350-400gsm for a premium, sturdy feel. 300gsm is also popular and slightly more flexible.', 1),
  ('How long does foil stamping take?', 'Foil stamping adds 1-2 days to production time but creates an impressive, luxurious finish.', 2),
  ('Can you match my brand colors?', 'Absolutely! We offer full-color CMYK printing and can match specific Pantone colors for spot color printing.', 3)
) AS s(question, answer, display_order);

-- 13. VEHICLE WRAPS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'SRV-WRAPS-001',
    'Vehicle Wraps',
    'vehicle-wraps',
    'Full and partial vehicle wraps for mobile advertising.',
    'Turn your fleet into moving billboards with our professional vehicle wrap service. Full wraps, partial wraps, and decals available with professional installation. Our wraps are made from high-quality cast vinyl that conforms to every curve of your vehicle.',
    'Car',
    'from-blue-500',
    'to-indigo-500',
    'Professional',
    'vehicle-wraps',
    'ETB 5000 - 30000',
    '1 vehicle',
    '3-5 days',
    false, false, true,
    13,
    'active',
    'Vehicle Wraps | Full & Partial Car Wraps | Fleet Branding',
    'Professional vehicle wrap services. Full wraps, partial wraps, fleet branding. Premium cast vinyl, professional installation.',
    'vehicle wraps, car wraps, fleet branding, vinyl wraps, vehicle advertising',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Full and partial wraps',
  'Commercial and personal vehicles',
  'Premium cast vinyl',
  'Design service included',
  'Professional installation',
  'Removable without damage',
  'UV protection',
  '5-7 year durability'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Company Fleet Vehicles',
  'Food Trucks',
  'Racing Cars',
  'Delivery Vans',
  'Ride-share Cars',
  'Buses',
  'Trailers',
  'Boats'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Consultation', 'Discuss design and goals', 'MessageCircle', 1),
  (2, 'Design', 'Create custom wrap design', 'Palette', 2),
  (3, 'Proof', 'Approve design', 'Eye', 3),
  (4, 'Print', 'Large format printing', 'Printer', 4),
  (5, 'Laminate', 'Add protective layer', 'Sparkles', 5),
  (6, 'Install', 'Professional application', 'Car', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Vinyl Type', 'Cast (premium) or Calendared', 1),
  ('Laminate', 'Gloss, Matte, Satin', 2),
  ('Durability', '5-7 years', 3),
  ('Coverage', 'Full, Partial, Spot graphics', 4)
) AS s(label, value, display_order);

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('How long do vehicle wraps last?', 'Premium cast vinyl wraps last 5-7 years with proper care. They protect your original paint and can be removed without damage.', 1),
  ('Can I wash my wrapped vehicle?', 'Yes! Hand washing is recommended. Avoid automatic car washes with brushes. We provide complete care instructions.', 2),
  ('Do you offer design services?', 'Yes, our professional designers will create a custom wrap design for your vehicle based on your branding and requirements.', 3)
) AS s(question, answer, display_order);

-- 14. POSTERS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'SRV-POSTER-001',
    'Posters',
    'posters',
    'High-quality posters for events and advertising.',
    'Vibrant posters for events, promotions, and advertising. Various sizes and paper options available for indoor and outdoor use. Perfect for concerts, movies, exhibitions, and retail displays.',
    'Camera',
    'from-purple-500',
    'to-pink-500',
    'Popular',
    'posters',
    'ETB 150 - 1500',
    '1 piece',
    '1-2 days',
    false, true, false,
    14,
    'active',
    'Custom Poster Printing | High-Quality Posters',
    'Professional poster printing for events, advertising, and displays. Various sizes, finishes, and paper options.',
    'poster printing, custom posters, event posters, movie posters, large format posters',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Multiple sizes available',
  'High resolution up to 2400 DPI',
  'UV resistant options',
  'Fast printing',
  'Bulk orders welcome',
  'Lamination available',
  'Matte or gloss finish',
  'Mounting options'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Movie Posters',
  'Concert Announcements',
  'Exhibition Displays',
  'Retail Advertising',
  'Educational Charts',
  'Art Prints',
  'Event Promotion',
  'Wall Decor'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Upload Design', 'Submit high-resolution file', 'Upload', 1),
  (2, 'Size Select', 'Choose dimensions', 'Ruler', 2),
  (3, 'Paper Choice', 'Select paper type', 'FileText', 3),
  (4, 'Proof', 'Review digital proof', 'Eye', 4),
  (5, 'Print', 'Large format printing', 'Printer', 5),
  (6, 'Finish', 'Trim and package', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Sizes', 'A3, A2, A1, A0, Custom', 1),
  ('Paper Weight', '150-300gsm', 2),
  ('Resolution', '300 DPI minimum', 3),
  ('Finishes', 'Matte, Gloss, Satin', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Gloss Paper', 'Matte Paper', 'Photo Paper', 'Canvas', 'Vinyl', 'Cardstock'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What resolution do I need for a poster?', 'For best results, provide files at 300 DPI at final size. Large format posters can sometimes use 150 DPI if viewed from a distance.', 1),
  ('Can you print one poster or do I need bulk?', 'We print single posters as well as bulk orders. No minimum quantity!', 2),
  ('What paper types do you offer?', 'We offer gloss, matte, photo paper, and canvas options for posters.', 3)
) AS s(question, answer, display_order);

-- 15. HOODIES & SWEATSHIRTS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    'SRV-HOODIE-001',
    'Hoodies & Sweatshirts',
    'hoodies-sweatshirts',
    'Comfortable custom hoodies for any season.',
    'Stay warm and stylish with our custom hoodies and sweatshirts. Perfect for teams, events, and corporate wear. Various styles and colors available with multiple print methods including DTF, screen printing, and embroidery.',
    'ShoppingBag',
    'from-blue-500',
    'to-purple-500',
    'Comfort',
    'hoodies',
    'ETB 250 - 600',
    '6 pieces',
    '3-5 days',
    false, true, false,
    15,
    'active',
    'Custom Hoodies & Sweatshirts | Team Apparel',
    'Premium custom hoodies and sweatshirts for teams, events, and corporate wear. DTF, screen print, embroidery options.',
    'custom hoodies, printed hoodies, embroidered sweatshirts, team apparel',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Premium blank hoodies',
  'All sizes XS-5XL',
  'Embroidery option',
  'Bulk pricing available',
  'Fast turnaround',
  'Quality materials',
  'Pockets available',
  'Zipper or pullover'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Team Warm-ups',
  'Company Events',
  'Brand Merchandise',
  'Gifts',
  'School Spirit',
  'Music Bands',
  'Sports Teams',
  'Family Reunions'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Choose Style', 'Select hoodie type and color', 'Shirt', 1),
  (2, 'Design', 'Submit your artwork', 'Upload', 2),
  (3, 'Method', 'Choose print or embroidery', 'Palette', 3),
  (4, 'Proof', 'Approve digital mockup', 'Eye', 4),
  (5, 'Production', 'Print or embroider', 'Printer', 5),
  (6, 'Ship', 'Deliver to you', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Styles', 'Pullover, Zip-up, Hoodless', 1),
  ('Fabrics', 'Cotton, Fleece, Blends', 2),
  ('Weights', '7.5oz - 12oz', 3),
  ('Print Area', 'Full front, back, sleeve', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  '80/20 Cotton/Poly', '50/50 Cotton/Poly', '100% Cotton', 'French Terry', 'Fleece', 'Performance Fabric'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What print methods work best on hoodies?', 'DTF printing works great for full-color designs on any color hoodie. Screen printing is best for bulk orders with spot colors. Embroidery gives a premium, textured look.', 1),
  ('Do you offer youth sizes?', 'Yes! We carry youth sizes in most hoodie styles. Please specify when ordering.', 2),
  ('What is the minimum order?', 'Minimum order is 6 pieces for custom hoodies. Smaller quantities may be available for DTF printing.', 3)
) AS s(question, answer, display_order);

-- 16. TOTE BAGS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    'SRV-TOTE-001',
    'Tote Bags',
    'tote-bags',
    'Eco-friendly custom tote bags for retail and promotions.',
    'Eco-friendly custom tote bags perfect for retail, events, and promotional giveaways. Various materials and printing options available. Our bags are reusable, durable, and help reduce plastic waste while promoting your brand.',
    'ShoppingBag',
    'from-green-500',
    'to-emerald-500',
    'Eco-Friendly',
    'bags',
    'ETB 100 - 300',
    '25 pieces',
    '3-5 days',
    false, false, true,
    16,
    'active',
    'Custom Tote Bags | Eco-Friendly Promotional Bags',
    'Custom printed tote bags for retail and promotions. Eco-friendly materials, reusable, durable.',
    'custom tote bags, promotional bags, eco-friendly bags, printed shopping bags',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Eco-friendly materials',
  'Reusable and durable',
  'Custom printing',
  'Bulk pricing',
  'Fast turnaround',
  'Multiple sizes',
  'Reinforced handles',
  'Foldable options'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Grocery Shopping',
  'Retail Stores',
  'Trade Shows',
  'Conference Swag',
  'Brand Giveaways',
  'Farmers Markets',
  'Bookstores',
  'Gift Shops'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Select Bag', 'Choose style and material', 'ShoppingBag', 1),
  (2, 'Design', 'Submit your artwork', 'Upload', 2),
  (3, 'Print Method', 'Screen print or DTF', 'Printer', 3),
  (4, 'Proof', 'Approve design', 'Eye', 4),
  (5, 'Production', 'Print and assemble', 'Package', 5),
  (6, 'Ship', 'Deliver to you', 'Truck', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Cotton, Canvas, Non-woven', 1),
  ('Sizes', '15"x15", 16"x18", Custom', 2),
  ('Handle Types', 'Short, Long, Shoulder', 3),
  ('Print Area', 'One or two sides', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  '100% Cotton', 'Canvas', 'Non-woven Polypropylene', 'Jute', 'Recycled PET', 'Muslin'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the most eco-friendly option?', 'Our 100% cotton and jute bags are biodegradable and most eco-friendly. Recycled PET bags are made from recycled plastic bottles.', 1),
  ('Can I get a sample before bulk order?', 'Yes! We offer sample service. Order 1-3 pieces to approve quality before placing your full order.', 2),
  ('What is the minimum order?', 'Minimum order is 25 pieces for custom tote bags.', 3)
) AS s(question, answer, display_order);

-- 17. LASER ENGRAVING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    'SRV-ENGRAVE-001',
    'Laser Engraving',
    'laser-engraving',
    'Precision laser engraving on various materials.',
    'High-precision laser engraving on wood, acrylic, metal, glass, and leather. Perfect for trophies, awards, gifts, and personalized items. Our laser systems can create detailed designs, photos, and text with permanent results that will never fade or wear off.',
    'Flame',
    'from-gray-500',
    'to-gray-700',
    'Precision',
    'engraving',
    'ETB 150 - 1000',
    '1 piece',
    '2-3 days',
    false, false, true,
    17,
    'active',
    'Laser Engraving Services | Custom Engraved Gifts',
    'Professional laser engraving on wood, acrylic, metal, glass. Perfect for trophies, awards, and personalized gifts.',
    'laser engraving, custom engraving, engraved gifts, trophy engraving, wood engraving',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Multiple materials',
  'High precision',
  'Permanent marking',
  'Photos possible',
  'Fast turnaround',
  'Custom designs',
  'No minimum',
  'Vector and raster'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Trophies & Awards',
  'Personalized Gifts',
  'Nameplates',
  'Jewelry',
  'Corporate Gifts',
  'Wedding Signs',
  'Keychains',
  'Leather Goods'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create or upload artwork', 'Palette', 1),
  (2, 'Material Select', 'Choose your material', 'Package', 2),
  (3, 'Test', 'Sample on similar material', 'Eye', 3),
  (4, 'Engrave', 'Laser precision', 'Flame', 4),
  (5, 'Clean', 'Remove residue', 'Sparkles', 5),
  (6, 'Package', 'Ready for pickup/ship', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Size', '24" x 36"', 1),
  ('Resolution', '1200 DPI', 2),
  ('Materials', 'Wood, Acrylic, Metal, Glass, Leather', 3),
  ('Laser Type', 'CO2 & Fiber', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Wood', 'Acrylic', 'Stainless Steel', 'Brass', 'Aluminum', 'Glass', 'Leather', 'Paper', 'Cork', 'Marble'
]), generate_series(1,10)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'SVG', 'DXF', 'JPG', 'PNG', 'BMP'
]), generate_series(1,7)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can you engrave photographs?', 'Yes! We can convert photos to detailed engravings on various materials. Best results on wood, acrylic, and coated metals.', 1),
  ('How deep is the engraving?', 'Depth varies by material but typically 0.1-0.5mm for detailed work. Deeper engraving available for specific applications.', 2),
  ('What materials can you engrave?', 'We engrave wood, acrylic, glass, leather, stainless steel, brass, aluminum, and many other materials.', 3)
) AS s(question, answer, display_order);

-- 18. FROSTED GLASS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    'SRV-FROST-001',
    'Frosted Glass',
    'frosted-glass',
    'Elegant frosted glass effects for privacy and style.',
    'Professional frosted glass application for windows, doors, partitions, and glassware. Creates elegant privacy while allowing light transmission. Choose from etched-look vinyl or true acid etching for permanent results. Perfect for offices, homes, and commercial spaces.',
    'Snowflake',
    'from-cyan-500',
    'to-blue-500',
    'Elegant',
    'frosted-glass',
    'ETB 300 - 2000',
    '1 sq meter',
    '2-3 days',
    false, false, true,
    18,
    'active',
    'Frosted Glass | Privacy Film & Etching Services',
    'Professional frosted glass applications for offices and homes. Custom patterns, logos, and privacy solutions.',
    'frosted glass, privacy film, glass etching, window film, office partitions',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Privacy solution',
  'UV protection',
  'Custom patterns',
  'Easy application',
  'Removable options',
  'Durable finish',
  'Logo integration',
  'Various opacities'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Office Partitions',
  'Conference Rooms',
  'Shower Doors',
  'Store Fronts',
  'Windows',
  'Glass Doors',
  'Display Cases',
  'Drinkware'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create pattern or logo', 'Palette', 1),
  (2, 'Measure', 'Precise measurements', 'Ruler', 2),
  (3, 'Cut', 'Precision cutting', 'Scissors', 3),
  (4, 'Apply', 'Professional installation', 'Sparkles', 4),
  (5, 'Squeegee', 'Remove bubbles', 'Sparkles', 5),
  (6, 'Finish', 'Perfect final look', 'Eye', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Vinyl Film, Etching Cream', 1),
  ('Opacity', '10-90%', 2),
  ('Application', 'Interior/Exterior', 3),
  ('Durability', '5-10 years', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Frosted Vinyl', 'Clear Vinyl', 'Etching Cream', 'Sandblast Resist', 'Patterned Film'
]), generate_series(1,5)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Is it permanent or removable?', 'We offer both! Vinyl film is removable and great for rentals. Acid etching is permanent for a lifetime solution.', 1),
  ('Can you create custom patterns?', 'Absolutely! Any design, logo, or pattern can be created. From simple stripes to complex company logos.', 2),
  ('How long does installation take?', 'Most installations are completed in 1-2 days depending on the size and complexity of the project.', 3)
) AS s(question, answer, display_order);

-- 19. CUSTOM CUTOUT
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29',
    'SRV-CUTOUT-001',
    'Custom Cutout',
    'custom-cutout',
    'Precision die-cut shapes and letters.',
    'Custom die-cut shapes, letters, and designs in various materials. Perfect for signage, displays, stickers, and craft projects. Our precision cutting machines can create any shape you can imagine from vinyl, paper, cardboard, acrylic, and foam.',
    'Scissors',
    'from-green-500',
    'to-teal-500',
    'Versatile',
    'cutouts',
    'ETB 100 - 1500',
    '1 piece',
    '2-3 days',
    false, false, true,
    19,
    'active',
    'Custom Cutouts | Die-Cut Shapes & Letters',
    'Precision die-cut shapes and letters in vinyl, acrylic, cardboard, and foam. Perfect for displays and crafts.',
    'custom cutouts, die-cut shapes, vinyl lettering, acrylic shapes, custom signage',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Custom shapes',
  'Multiple materials',
  'Precision cutting',
  'Small to bulk',
  'Fast turnaround',
  'Ready to use',
  'Weeding included',
  'Transfer tape'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Wall Decals',
  'Window Graphics',
  'Lettering',
  'Craft Projects',
  'Signage',
  'Model Making',
  'Packaging',
  'Scrapbooking'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create vector artwork', 'Palette', 1),
  (2, 'Material', 'Select your material', 'Package', 2),
  (3, 'Cut', 'Precision cutting', 'Scissors', 3),
  (4, 'Weed', 'Remove excess', 'Scissors', 4),
  (5, 'Apply Transfer', 'Add application tape', 'Sparkles', 5),
  (6, 'Package', 'Ready for use', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Max Width', '24"', 1),
  ('Materials', 'Vinyl, Paper, Cardboard, Acrylic, Foam', 2),
  ('Thickness', 'Up to 10mm', 3),
  ('Tolerance', '±0.1mm', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Adhesive Vinyl', 'Heat Transfer Vinyl', 'Cardboard', 'Paper', 'Acrylic', 'Foam Board', 'Magnetic Sheet', 'Felt'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'SVG', 'DXF', 'CDR', 'EPS'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the smallest detail you can cut?', 'We can cut details as small as 1mm in vinyl, 3mm in thicker materials. Contact us to discuss your specific needs.', 1),
  ('Do you include application tape?', 'Yes! All adhesive vinyl cutouts include transfer tape for easy application. We also provide application instructions.', 2),
  ('What materials can you cut?', 'We cut adhesive vinyl, heat transfer vinyl, paper, cardboard, acrylic (up to 3mm), foam board, and magnetic sheet.', 3)
) AS s(question, answer, display_order);

-- 20. GRAPHIC DESIGN
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
    'SRV-DESIGN-001',
    'Graphic Design',
    'graphic-design',
    'Professional design services for all your needs.',
    'Our professional designers help bring your vision to life. From logos to complete branding packages, we provide creative solutions that stand out. Whether you need a new logo, print-ready files, or complete brand identity, we\ve got you covered.',
    'Palette',
    'from-orange-500',
    'to-red-500',
    'Creative',
    'graphic-design',
    'ETB 500 - 5000',
    '1 project',
    '2-5 days',
    false, false, true,
    20,
    'active',
    'Professional Graphic Design Services | Logo & Branding',
    'Expert graphic design services for logos, branding, marketing materials, and print-ready files.',
    'graphic design, logo design, branding, print design, marketing materials',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Logo design',
  'Brand identity packages',
  'Print-ready file preparation',
  'Revisions included',
  'Fast turnaround',
  'Commercial use rights',
  'Vector formats',
  'Social media graphics'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'New Business Branding',
  'Logo Creation',
  'Marketing Materials',
  'Social Media Graphics',
  'Product Packaging',
  'Website Graphics',
  'Brochure Design',
  'Business Cards'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Brief', 'Discuss your needs and ideas', 'MessageCircle', 1),
  (2, 'Concepts', 'Receive initial design concepts', 'Palette', 2),
  (3, 'Feedback', 'Share your feedback', 'MessageCircle', 3),
  (4, 'Revisions', 'Refine chosen concept', 'Refresh', 4),
  (5, 'Finalize', 'Prepare final files', 'CheckCircle', 5),
  (6, 'Delivery', 'Receive all file formats', 'Download', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('File Types', 'AI, EPS, PDF, PNG, JPG', 1),
  ('Revisions', '3 rounds included', 2),
  ('Turnaround', '2-5 days', 3),
  ('Formats', 'Vector & Raster', 4)
) AS s(label, value, display_order);

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What files will I receive?', 'You will receive all final files including vector (AI, EPS, PDF) for printing and raster (PNG, JPG) for web use, plus source files.', 1),
  ('Do I own the rights to the design?', 'Yes! Upon final payment, you receive full commercial rights to use the designs for your business.', 2),
  ('How many revisions are included?', 'We include 3 rounds of revisions to ensure you are completely satisfied with the final design.', 3)
) AS s(question, answer, display_order);

-- 21. CUSTOM PENS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'SRV-PENS-001',
    'Custom Pens',
    'custom-pens',
    'Promotional pens with your logo.',
    'Classic promotional pens with your logo. Perfect for giveaways, trade shows, and everyday use. Various colors and styles available. Pens are one of the most cost-effective promotional items with the highest retention rate.',
    'Pen',
    'from-yellow-500',
    'to-orange-500',
    'Budget Friendly',
    'pens',
    'ETB 10 - 50',
    '100 pieces',
    '5-7 days',
    false, false, false,
    21,
    'active',
    'Custom Promotional Pens | Printed Logo Pens',
    'Custom printed pens for promotional giveaways. Budget-friendly, various styles and colors.',
    'custom pens, promotional pens, printed pens, logo pens, giveaways',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Custom logo printing',
  'Multiple colors available',
  'Bulk pricing',
  'Fast delivery',
  'Various styles',
  'Refillable options',
  'Metal or plastic',
  'Stylus tip available'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Trade Shows',
  'Corporate Gifts',
  'Bank Giveaways',
  'Real Estate Agents',
  'Doctor Offices',
  'Schools',
  'Business Conferences',
  'Welcome Bags'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Select Pen', 'Choose style and color', 'Pen', 1),
  (2, 'Submit Logo', 'Upload your artwork', 'Upload', 2),
  (3, 'Proof', 'Approve digital mockup', 'Eye', 3),
  (4, 'Print', 'Pad print or laser engrave', 'Printer', 4),
  (5, 'Quality', 'Check each pen', 'CheckCircle', 5),
  (6, 'Package', 'Box or bulk pack', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Print Area', '1.5" x 0.5"', 1),
  ('Colors', '1-4 spot colors', 2),
  ('Ink Type', 'Ballpoint, Gel', 3),
  ('Materials', 'Plastic, Metal', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Plastic', 'Metal', 'Aluminum', 'Brass', 'Eco-friendly Materials', 'Recycled Plastic'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the best pen for logo printing?', 'Metal pens with a larger barrel provide the best printing surface and feel more premium. Plastic pens are most cost-effective for large giveaways.', 1),
  ('How long does imprinting take?', 'Standard imprinting takes 5-7 business days after proof approval. Rush service available.', 2),
  ('What is the minimum order?', 'Minimum order is 100 pieces for custom pens.', 3)
) AS s(question, answer, display_order);

-- 22. KEYCHAINS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    'SRV-KEY-001',
    'Keychains',
    'keychains',
    'Custom keychains for lasting impressions.',
    'Custom keychains that keep your brand in sight every day. Various materials and designs available for promotional use. Perfect for giveaways, souvenirs, and corporate gifts that people will actually keep and use.',
    'Key',
    'from-purple-500',
    'to-pink-500',
    'Popular',
    'keychains',
    'ETB 50 - 300',
    '50 pieces',
    '4-6 days',
    false, false, false,
    22,
    'active',
    'Custom Keychains | Promotional Giveaways',
    'Personalized keychains in acrylic, metal, and leather. Perfect for corporate gifts and events.',
    'custom keychains, promotional keychains, logo keychains, acrylic keychains',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Custom shapes and designs',
  'Multiple materials',
  'Bulk pricing',
  'Fast turnaround',
  'Durable construction',
  'Great giveaways',
  'Photo quality prints',
  'Split ring included'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Corporate Gifts',
  'Event Souvenirs',
  'Trade Show Giveaways',
  'Wedding Favors',
  'Brand Merchandise',
  'Fundraising',
  'Tourist Souvenirs',
  'Welcome Bags'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create or upload artwork', 'Palette', 1),
  (2, 'Material', 'Choose material type', 'Package', 2),
  (3, 'Size/Shape', 'Select dimensions', 'Ruler', 3),
  (4, 'Proof', 'Approve design', 'Eye', 4),
  (5, 'Production', 'Print, cut, assemble', 'Printer', 5),
  (6, 'Package', 'Bag or box', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Acrylic, Metal, Leather', 1),
  ('Sizes', '1-4 inches', 2),
  ('Print Method', 'UV Print, Laser Engrave', 3),
  ('Attachment', 'Split ring, Ball chain', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Acrylic', 'Stainless Steel', 'Brass', 'Leather', 'Wood', 'Silicone', 'Plastic', 'Epoxy Resin'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PNG', 'PDF', 'EPS', 'SVG', 'CDR'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the most popular keychain material?', 'Acrylic is most popular for full-color printed designs. Metal is preferred for engraved, premium feel. Leather offers a classic, sophisticated look.', 1),
  ('Can you make 3D or shaped keychains?', 'Yes! We can create custom shapes and even 3D molded keychains for unique promotional items.', 2),
  ('What is the minimum order?', 'Minimum order is 50 pieces for custom keychains.', 3)
) AS s(question, answer, display_order);

-- 23. CUSTOM PACKAGING
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'SRV-PACK-001',
    'Custom Packaging',
    'custom-packaging',
    'Custom boxes and packaging for your products.',
    'Elevate your brand with custom packaging solutions. From product boxes to shipping mailers, we create packaging that protects and promotes. Our packaging is designed to enhance unboxing experience and build brand loyalty.',
    'Package',
    'from-blue-500',
    'to-indigo-500',
    'Premium',
    'packaging',
    'ETB 1000 - 10000',
    '100 pieces',
    '7-10 days',
    false, false, false,
    23,
    'active',
    'Custom Packaging | Product Boxes & Mailers',
    'Custom boxes and packaging solutions for your products. Enhance your brand with premium packaging.',
    'custom packaging, product boxes, gift boxes, branded packaging, shipping boxes',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Custom sizes and shapes',
  'Full color printing',
  'Various materials',
  'Structural design',
  'Bulk pricing',
  'Eco-friendly options',
  'Window cutouts',
  'Foil stamping available'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Product Boxes',
  'Gift Boxes',
  'Shipping Boxes',
  'Retail Packaging',
  'Cosmetics Boxes',
  'Food Packaging',
  'Subscription Boxes',
  'Display Boxes'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Consultation', 'Discuss product needs', 'MessageCircle', 1),
  (2, 'Structural Design', 'Create box prototype', 'Package', 2),
  (3, 'Graphic Design', 'Design box artwork', 'Palette', 3),
  (4, 'Sample', 'Produce physical sample', 'Eye', 4),
  (5, 'Production', 'Mass production', 'Printer', 5),
  (6, 'Assembly', 'Fold and ship flat', 'Package', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Cardboard, Kraft, Rigid', 1),
  ('Printing', 'Offset, Digital, Flexo', 2),
  ('Finishes', 'Matte, Gloss, Soft-touch', 3),
  ('Minimum', '100-500 pieces', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Cardboard', 'Kraft Paper', 'Rigid Box Board', 'Corrugated', 'Magnetic Closure', 'Eco-friendly Materials'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'CDR', 'INDD', 'CAD', 'EPS'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the minimum order for custom boxes?', 'Minimum orders vary by box type and complexity, typically starting at 100-500 pieces. Contact us for a quote.', 1),
  ('Can you create a prototype?', 'Yes! We offer prototyping services to ensure your packaging looks and functions perfectly before mass production.', 2),
  ('Do you offer eco-friendly options?', 'Yes! We offer recycled materials and sustainable packaging options for environmentally conscious brands.', 3)
) AS s(question, answer, display_order);

-- 24. FLYERS & BROCHURES
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    'SRV-FLYER-001',
    'Flyers & Brochures',
    'flyers-brochures',
    'Marketing materials for your business promotions.',
    'Professional flyers and brochures for your marketing campaigns. Various sizes, folds, and paper options available. Perfect for product launches, events, and business promotions.',
    'FileText',
    'from-blue-500',
    'to-cyan-500',
    'Marketing',
    'flyers',
    'ETB 300 - 2000',
    '50 pieces',
    '2-3 days',
    false, false, false,
    24,
    'active',
    'Flyer & Brochure Printing | Marketing Materials',
    'Professional flyer and brochure printing for your marketing campaigns. Various sizes and folds available.',
    'flyer printing, brochure printing, marketing materials, promotional flyers',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Multiple sizes available',
  'Folding options',
  'Glossy or matte finish',
  'Bulk pricing',
  'Design service included',
  'Fast turnaround',
  'High-quality printing',
  'Eco-friendly paper options'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Product Catalogs',
  'Event Programs',
  'Restaurant Menus',
  'Real Estate Flyers',
  'Sale Promotions',
  'Information Guides',
  'Travel Brochures',
  'Educational Materials'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create or submit design', 'Palette', 1),
  (2, 'Size/Fold', 'Select format', 'Ruler', 2),
  (3, 'Paper', 'Choose paper type', 'FileText', 3),
  (4, 'Proof', 'Approve digital proof', 'Eye', 4),
  (5, 'Print', 'Offset or digital printing', 'Printer', 5),
  (6, 'Fold', 'Machine folding', 'Scissors', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Sizes', 'A5, A4, A3, DL, Custom', 1),
  ('Folds', 'Half, Tri, Z, Gate, None', 2),
  ('Paper', '100-300gsm', 3),
  ('Pages', '1-32 pages', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Gloss Paper', 'Matte Paper', 'Recycled Paper', 'Kraft Paper', 'Textured Paper', 'Cardstock'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'INDD', 'PSD', 'JPG', 'EPS'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('What is the most popular flyer size?', 'A5 (148 x 210mm) and A4 (210 x 297mm) are most popular for flyers. DL (99 x 210mm) is common for brochures.', 1),
  ('Can you help with the design?', 'Yes! Our graphic designers can create professional flyers from your ideas or polish your existing design.', 2),
  ('What is the minimum order?', 'Minimum order is 50 pieces for flyers and brochures.', 3)
) AS s(question, answer, display_order);

-- 25. PRODUCT LABELS
WITH inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    'SRV-LABEL-001',
    'Product Labels',
    'product-labels',
    'Custom product labels for packaging and branding.',
    'Professional product labels for your packaging needs. Various materials and adhesives available for different applications, from food products to industrial items. Our labels are durable, waterproof, and designed to enhance your product presentation.',
    'Tag',
    'from-green-500',
    'to-teal-500',
    'Business',
    'labels',
    'ETB 200 - 1500',
    '100 pieces',
    '3-4 days',
    false, false, false,
    25,
    'active',
    'Custom Product Labels | Packaging Labels',
    'Professional custom labels for your products. Various materials, waterproof options, barcode ready.',
    'product labels, custom labels, packaging labels, sticker labels, barcode labels',
    NOW(), NOW()
  ) RETURNING id
)
INSERT INTO service_features (id, service_id, feature, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Barcode ready',
  'Water resistant options',
  'Custom sizes and shapes',
  'Multiple materials',
  'Bulk rolls available',
  'FDA compliant materials',
  'Permanent or removable',
  'Thermal transfer compatible'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_applications (id, service_id, application, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'Food & Beverage',
  'Cosmetics',
  'Candle Jars',
  'Bottles',
  'Product Packaging',
  'Shipping Labels',
  'Warning Labels',
  'Brand Stickers'
]), generate_series(1,8)
FROM inserted_service;

INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
FROM inserted_service, (VALUES 
  (1, 'Design', 'Create label artwork', 'Palette', 1),
  (2, 'Size/Shape', 'Choose dimensions', 'Ruler', 2),
  (3, 'Material', 'Select label material', 'Tag', 3),
  (4, 'Proof', 'Approve design', 'Eye', 4),
  (5, 'Print', 'Flexo or digital print', 'Printer', 5),
  (6, 'Cut', 'Die-cut to shape', 'Scissors', 6)
) AS s(step_number, title, description, icon_name, display_order);

INSERT INTO service_specs (id, service_id, label, value, display_order) 
SELECT gen_random_uuid(), id, label, value, display_order
FROM inserted_service, (VALUES 
  ('Materials', 'Paper, Vinyl, Clear, Kraft', 1),
  ('Adhesive', 'Permanent, Removable', 2),
  ('Finishes', 'Matte, Gloss, White', 3),
  ('Application', 'Hand or machine apply', 4)
) AS s(label, value, display_order);

INSERT INTO service_materials (id, service_id, material, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'White Paper', 'Kraft Paper', 'White Vinyl', 'Clear Vinyl', 'Silver Vinyl', 'Weatherproof Vinyl'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_formats (id, service_id, format, display_order) 
SELECT gen_random_uuid(), id, unnest(ARRAY[
  'AI', 'PDF', 'EPS', 'CDR', 'PNG', 'JPG'
]), generate_series(1,6)
FROM inserted_service;

INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
SELECT gen_random_uuid(), id, question, answer, display_order
FROM inserted_service, (VALUES 
  ('Can you print barcodes on labels?', 'Yes! We can include barcodes, QR codes, and variable data on your labels. Perfect for retail products.', 1),
  ('Are your labels food-safe?', 'Yes, we offer FDA-compliant materials suitable for food packaging and direct food contact where required.', 2),
  ('What is the minimum order?', 'Minimum order is 100 pieces or 1 roll for custom labels.', 3)
) AS s(question, answer, display_order);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check total services inserted
SELECT COUNT(*) as total_services FROM services;

-- Check total categories
SELECT COUNT(*) as total_categories FROM service_categories;

-- List all services with basic info
SELECT title, slug, category, status, is_featured, is_popular 
FROM services 
ORDER BY display_order;


















-- =====================================================
-- SERVICE CATEGORIES SEED DATA
-- =====================================================

INSERT INTO service_categories (id, name, slug, description, icon_name, display_order) VALUES
-- Apparel Categories
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apparel Printing', 'apparel', 'Custom printing on t-shirts, hoodies, hats and more', 'Shirt', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'T-Shirts', 'tshirts', 'Custom t-shirt printing for any occasion', 'Shirt', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hoodies & Sweatshirts', 'hoodies', 'Comfortable custom hoodies for all seasons', 'ShoppingBag', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hats & Caps', 'hats', 'Custom headwear with embroidery or print', 'Shirt', 4),

-- Large Format Categories
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Banners & Signs', 'banners', 'Large format banners for indoor and outdoor', 'Megaphone', 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Posters', 'posters', 'High-quality posters for events and advertising', 'Camera', 6),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Vehicle Wraps', 'vehicle-wraps', 'Full and partial vehicle wraps', 'Car', 7),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Light Boxes', 'light-boxes', 'LED illuminated signs', 'Lightbulb', 8),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Neon Signs', 'neon-signs', 'Flexible LED neon signs', 'Sparkles', 9),

-- Stickers & Labels
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Stickers', 'stickers', 'Custom die-cut and kiss-cut stickers', 'Tag', 10),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Labels', 'labels', 'Product labels for packaging', 'Tag', 11),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Frosted Glass', 'frosted-glass', 'Privacy and decorative glass films', 'Snowflake', 12),

-- Drinkware
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Mugs', 'mugs', 'Custom printed mugs', 'Coffee', 13),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Bottles', 'bottles', 'Custom water bottles and tumblers', 'Wine', 14),

-- Print & Promo
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'Business Cards', 'business-cards', 'Premium business cards', 'FileText', 15),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'Flyers & Brochures', 'flyers', 'Marketing materials', 'FileText', 16),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'Packaging', 'packaging', 'Custom boxes and packaging', 'Package', 17),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'Pens', 'pens', 'Promotional custom pens', 'Pen', 18),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'Keychains', 'keychains', 'Custom keychains', 'Key', 19),

-- Specialty
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'Engraving', 'engraving', 'Laser engraving on various materials', 'Flame', 20),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'Screen Printing', 'screen-printing', 'Traditional screen printing for bulk', 'Printer', 21),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'Embroidery', 'embroidery', 'Professional embroidery services', 'Sparkles', 22),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cutouts', 'cutouts', 'Custom die-cut shapes', 'Scissors', 23),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'Graphic Design', 'graphic-design', 'Professional design services', 'Palette', 24);

-- =====================================================
-- SERVICES SEED DATA
-- =====================================================

-- 1. DTF PRINTING
WITH 
inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SRV-DTF-001',
    'DTF Printing',
    'dtf-printing',
    'Direct to Film printing for vibrant, durable designs on any fabric.',
    'DTF (Direct to Film) printing is our most popular service, offering vibrant colors and exceptional durability on any fabric type. Perfect for custom apparel, sportswear, and promotional items. The process involves printing your design onto a special film, applying adhesive powder, and then heat pressing it onto the fabric. This method works on cotton, polyester, blends, nylon, leather, and more.',
    'Printer',
    'from-purple-500',
    'to-pink-500',
    'Most Popular',
    'apparel',
    'ETB 150 - 500',
    '1 piece',
    '2-3 days',
    true, true, false,
    1,
    'active',
    'Professional DTF Printing Services | Custom Apparel Printing',
    'High-quality DTF printing for custom apparel. Vibrant colors, durable prints on any fabric. Perfect for t-shirts, hoodies, and more.',
    'DTF printing, direct to film, custom apparel, t-shirt printing, fabric printing',
    NOW(), NOW()
  ) RETURNING id
),
insert_features AS (
  INSERT INTO service_features (id, service_id, feature, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'Any fabric type - cotton, polyester, blends, nylon, leather',
    'Vibrant colors with high opacity',
    'Wash durable - 50+ washes',
    'No minimum order quantity',
    'Fast turnaround - 2-3 days',
    'High resolution up to 1440 DPI',
    'Soft hand feel - no heavy layer',
    'Stretchable without cracking'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_applications AS (
  INSERT INTO service_applications (id, service_id, application, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'T-Shirts & Apparel',
    'Sportswear & Jerseys',
    'Work Uniforms',
    'Promotional Items',
    'Bags & Totes',
    'Hoodies & Sweatshirts',
    'Baby Clothes',
    'Pet Apparel'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_process_steps AS (
  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
  SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
  FROM inserted_service, (VALUES 
    (1, 'Upload Design', 'Upload your artwork in PNG, AI, or PSD format', 'Upload', 1),
    (2, 'Color Separation', 'We prepare your design for DTF printing', 'Palette', 2),
    (3, 'Print on Film', 'Design printed on special DTF film', 'Printer', 3),
    (4, 'Apply Adhesive', 'Hot melt adhesive powder applied', 'Sparkles', 4),
    (5, 'Heat Press', 'Design transferred to your garment', 'Flame', 5),
    (6, 'Quality Check', 'Final inspection and packaging', 'CheckCircle', 6)
  ) AS s(step_number, title, description, icon_name, display_order)
),
insert_specs AS (
  INSERT INTO service_specs (id, service_id, label, value, display_order) 
  SELECT gen_random_uuid(), id, label, value, display_order
  FROM inserted_service, (VALUES 
    ('Max Print Size', '16" x 20"', 1),
    ('Resolution', '1440 DPI', 2),
    ('Color Mode', 'CMYK + White', 3),
    ('Washability', '50+ washes', 4)
  ) AS s(label, value, display_order)
),
insert_materials AS (
  INSERT INTO service_materials (id, service_id, material, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'Cotton', 'Polyester', 'Cotton-Polyester Blends', 'Nylon', 
    'Leather', 'Denim', 'Canvas', 'Rayon'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_formats AS (
  INSERT INTO service_formats (id, service_id, format, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'PNG', 'AI', 'PSD', 'PDF', 'EPS', 'TIFF'
  ]), generate_series(1,6)
  FROM inserted_service
),
insert_colors AS (
  INSERT INTO service_colors (id, service_id, color, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'Full Color CMYK', 'Spot Colors', 'White Underbase', 'Neon Colors', 'Metallic Options'
  ]), generate_series(1,5)
  FROM inserted_service
),
insert_faqs AS (
  INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
  SELECT gen_random_uuid(), id, question, answer, display_order
  FROM inserted_service, (VALUES 
    ('What is DTF printing?', 'DTF (Direct to Film) is a printing method where your design is printed onto a special film, coated with adhesive, and then heat pressed onto fabric. It works on almost any material and produces vibrant, durable prints.', 1),
    ('How durable are DTF prints?', 'DTF prints are extremely durable and can withstand 50+ washes without fading or cracking when properly cared for.', 2),
    ('Can you print on dark colored garments?', 'Yes! DTF printing works perfectly on any color, including black. We use a white underbase to ensure vibrant colors on dark fabrics.', 3),
    ('What is the turnaround time?', 'Standard turnaround is 2-3 business days. Rush orders may be available for an additional fee.', 4)
  ) AS s(question, answer, display_order)
)
SELECT 'DTF Printing seeded successfully' as result;

-- 2. T-SHIRT PRINTING
WITH 
inserted_service AS (
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'SRV-TSHIRT-001',
    'T-Shirt Printing',
    't-shirt-printing',
    'Custom t-shirts using DTF, screen printing, and DTG methods.',
    'Premium custom t-shirt printing for any occasion. We offer multiple printing methods including DTF for full color, screen printing for bulk orders, and DTG for detailed designs. Whether you need one shirt or thousands, we have the perfect solution for your project.',
    'Shirt',
    'from-red-500',
    'to-pink-500',
    'Best Seller',
    'tshirts',
    'ETB 200 - 600',
    '1 piece',
    '2-4 days',
    true, true, true,
    2,
    'active',
    'Custom T-Shirt Printing | DTF, Screen Printing & DTG',
    'Professional t-shirt printing services. Choose from DTF, screen printing, or DTG. Perfect for events, teams, and business.',
    't-shirt printing, custom t-shirts, screen printing, dtf printing, dtg printing',
    NOW(), NOW()
  ) RETURNING id
),
insert_features AS (
  INSERT INTO service_features (id, service_id, feature, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'Multiple printing methods',
    'All colors available',
    'Bulk discounts up to 40%',
    'Design assistance included',
    'Fast delivery',
    'Quality guarantee',
    'Eco-friendly options',
    'Size range XS-5XL'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_applications AS (
  INSERT INTO service_applications (id, service_id, application, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'Event T-Shirts',
    'Team Uniforms',
    'Corporate Branding',
    'Family Reunions',
    'School Spirit Wear',
    'Bachelorette Parties',
    'Fundraising Events',
    'Sports Teams'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_process_steps AS (
  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) 
  SELECT gen_random_uuid(), id, step_number, title, description, icon_name, display_order
  FROM inserted_service, (VALUES 
    (1, 'Choose Style', 'Select t-shirt style, color, and quantity', 'Shirt', 1),
    (2, 'Upload Design', 'Submit your artwork or describe your idea', 'Upload', 2),
    (3, 'Get Proof', 'Receive digital proof for approval', 'Eye', 3),
    (4, 'Production', 'Your shirts are printed with care', 'Printer', 4),
    (5, 'Quality Check', 'Each shirt is inspected', 'CheckCircle', 5),
    (6, 'Delivery', 'Shipped to your door', 'Truck', 6)
  ) AS s(step_number, title, description, icon_name, display_order)
),
insert_specs AS (
  INSERT INTO service_specs (id, service_id, label, value, display_order) 
  SELECT gen_random_uuid(), id, label, value, display_order
  FROM inserted_service, (VALUES 
    ('Print Methods', 'DTF, Screen Print, DTG', 1),
    ('Max Colors', 'Full CMYK', 2),
    ('Fabric Types', 'Cotton, Polyester, Blends', 3),
    ('Size Range', 'XS to 5XL', 4)
  ) AS s(label, value, display_order)
),
insert_materials AS (
  INSERT INTO service_materials (id, service_id, material, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    '100% Cotton', '100% Polyester', 'Tri-Blend', 'Ring-spun Cotton', 
    'Organic Cotton', 'Performance Fabric'
  ]), generate_series(1,6)
  FROM inserted_service
),
insert_formats AS (
  INSERT INTO service_formats (id, service_id, format, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'AI', 'PNG', 'PDF', 'PSD', 'JPG', 'EPS'
  ]), generate_series(1,6)
  FROM inserted_service
),
insert_colors AS (
  INSERT INTO service_colors (id, service_id, color, display_order) 
  SELECT gen_random_uuid(), id, unnest(ARRAY[
    'White', 'Black', 'Navy', 'Red', 'Royal Blue', 'Forest Green', 'Maroon', 'Gray'
  ]), generate_series(1,8)
  FROM inserted_service
),
insert_faqs AS (
  INSERT INTO service_faqs (id, service_id, question, answer, display_order) 
  SELECT gen_random_uuid(), id, question, answer, display_order
  FROM inserted_service, (VALUES 
    ('What t-shirt brands do you use?', 'We use premium brands including Gildan, Bella+Canvas, Hanes, and Anvil. We can also print on customer-supplied shirts.', 1),
    ('What is the best printing method for my design?', 'For full-color photos and complex designs, DTF is best. For simple designs in bulk, screen printing is most economical. For small quantities, DTG works well.', 2),
    ('What is the minimum order?', 'Minimum order is just 1 piece for DTF printing. Screen printing requires 24 pieces minimum.', 3)
  ) AS s(question, answer, display_order)
)
SELECT 'T-Shirt Printing seeded successfully' as result;

-- Continue this pattern for all remaining services...