-- =====================================================
-- FIRST: ADD COLOR COLUMN TO SERVICE CATEGORIES (if not exists)
-- =====================================================
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- =====================================================
-- SERVICE CATEGORIES SEED DATA - 6 MAIN CATEGORIES ONLY
-- =====================================================

INSERT INTO service_categories (id, name, slug, description, icon_name, display_order, color) VALUES
-- 1. Apparel Printing
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apparel Printing', 'apparel-printing', 'Custom printing on t-shirts, hoodies, hats and more', 'Shirt', 1, 'red'),

-- 2. Large Format
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Large Format', 'large-format', 'Large format banners, posters, and signage', 'Megaphone', 2, 'orange'),

-- 3. Stickers & Labels
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Stickers & Labels', 'stickers-labels', 'Custom stickers, labels, and decals', 'Tag', 3, 'yellow'),

-- 4. Drinkware
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Drinkware', 'drinkware', 'Custom printed mugs and bottles', 'Coffee', 4, 'orange'),

-- 5. Print & Promo
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Print & Promo', 'print-promo', 'Business cards, flyers, and promotional items', 'FileText', 5, 'blue'),

-- 6. Specialty
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Specialty', 'specialty', 'Specialty printing services', 'Award', 6, 'purple');

-- =====================================================
-- SERVICES SEED DATA - Grouped under 6 Main Categories
-- =====================================================

-- =====================================================
-- 1. APPAREL PRINTING SERVICES (7 services)
-- =====================================================

-- DTF Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-DTF-001',
    'DTF Printing',
    'dtf',
    'Direct to Film printing for vibrant, durable designs on any fabric.',
    'DTF (Direct to Film) printing is our most popular service, offering vibrant colors and exceptional durability on any fabric type. Perfect for custom apparel, sportswear, and promotional items. The process involves printing your design onto a special film, applying adhesive powder, and then heat pressing it onto the fabric. This method works on cotton, polyester, blends, nylon, leather, and more.',
    'Printer',
    'from-purple-500',
    'to-pink-500',
    'Popular',
    'apparel-printing',
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
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Any fabric type - cotton, polyester, blends, nylon, leather', 1),
    (gen_random_uuid(), v_service_id, 'Vibrant colors with high opacity', 2),
    (gen_random_uuid(), v_service_id, 'Wash durable - 50+ washes', 3),
    (gen_random_uuid(), v_service_id, 'No minimum order quantity', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround - 2-3 days', 5),
    (gen_random_uuid(), v_service_id, 'High resolution up to 1440 DPI', 6),
    (gen_random_uuid(), v_service_id, 'Soft hand feel - no heavy layer', 7),
    (gen_random_uuid(), v_service_id, 'Stretchable without cracking', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'T-Shirts & Apparel', 1),
    (gen_random_uuid(), v_service_id, 'Sportswear & Jerseys', 2),
    (gen_random_uuid(), v_service_id, 'Work Uniforms', 3),
    (gen_random_uuid(), v_service_id, 'Promotional Items', 4),
    (gen_random_uuid(), v_service_id, 'Bags & Totes', 5),
    (gen_random_uuid(), v_service_id, 'Hoodies & Sweatshirts', 6),
    (gen_random_uuid(), v_service_id, 'Baby Clothes', 7),
    (gen_random_uuid(), v_service_id, 'Pet Apparel', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Upload Design', 'Upload your artwork in PNG, AI, or PSD format', 'Upload', 1),
    (gen_random_uuid(), v_service_id, 2, 'Color Separation', 'We prepare your design for DTF printing', 'Palette', 2),
    (gen_random_uuid(), v_service_id, 3, 'Print on Film', 'Design printed on special DTF film', 'Printer', 3),
    (gen_random_uuid(), v_service_id, 4, 'Apply Adhesive', 'Hot melt adhesive powder applied', 'Sparkles', 4),
    (gen_random_uuid(), v_service_id, 5, 'Heat Press', 'Design transferred to your garment', 'Flame', 5),
    (gen_random_uuid(), v_service_id, 6, 'Quality Check', 'Final inspection and packaging', 'CheckCircle', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Print Size', '16" x 20"', 1),
    (gen_random_uuid(), v_service_id, 'Resolution', '1440 DPI', 2),
    (gen_random_uuid(), v_service_id, 'Color Mode', 'CMYK + White', 3),
    (gen_random_uuid(), v_service_id, 'Washability', '50+ washes', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Cotton', 1),
    (gen_random_uuid(), v_service_id, 'Polyester', 2),
    (gen_random_uuid(), v_service_id, 'Cotton-Polyester Blends', 3),
    (gen_random_uuid(), v_service_id, 'Nylon', 4),
    (gen_random_uuid(), v_service_id, 'Leather', 5),
    (gen_random_uuid(), v_service_id, 'Denim', 6),
    (gen_random_uuid(), v_service_id, 'Canvas', 7),
    (gen_random_uuid(), v_service_id, 'Rayon', 8);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'PNG', 1),
    (gen_random_uuid(), v_service_id, 'AI', 2),
    (gen_random_uuid(), v_service_id, 'PSD', 3),
    (gen_random_uuid(), v_service_id, 'PDF', 4),
    (gen_random_uuid(), v_service_id, 'EPS', 5),
    (gen_random_uuid(), v_service_id, 'TIFF', 6);

  INSERT INTO service_colors (id, service_id, color, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Full Color CMYK', 1),
    (gen_random_uuid(), v_service_id, 'Spot Colors', 2),
    (gen_random_uuid(), v_service_id, 'White Underbase', 3),
    (gen_random_uuid(), v_service_id, 'Neon Colors', 4),
    (gen_random_uuid(), v_service_id, 'Metallic Options', 5);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is DTF printing?', 'DTF (Direct to Film) is a printing method where your design is printed onto a special film, coated with adhesive, and then heat pressed onto fabric. It works on almost any material and produces vibrant, durable prints.', 1),
    (gen_random_uuid(), v_service_id, 'How durable are DTF prints?', 'DTF prints are extremely durable and can withstand 50+ washes without fading or cracking when properly cared for.', 2),
    (gen_random_uuid(), v_service_id, 'Can you print on dark colored garments?', 'Yes! DTF printing works perfectly on any color, including black. We use a white underbase to ensure vibrant colors on dark fabrics.', 3),
    (gen_random_uuid(), v_service_id, 'What is the turnaround time?', 'Standard turnaround is 2-3 business days. Rush orders may be available for an additional fee.', 4);

  RAISE NOTICE 'DTF Printing seeded successfully';
END $$;

-- T-Shirt Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-TSHIRT-001',
    'T-Shirt Printing',
    'tshirt',
    'Custom t-shirts using DTF, screen printing, and DTG methods.',
    'Premium custom t-shirt printing for any occasion. We offer multiple printing methods including DTF for full color, screen printing for bulk orders, and DTG for detailed designs. Whether you need one shirt or thousands, we have the perfect solution for your project.',
    'Shirt',
    'from-red-500',
    'to-pink-500',
    'Best Seller',
    'apparel-printing',
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
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Multiple printing methods', 1),
    (gen_random_uuid(), v_service_id, 'All colors available', 2),
    (gen_random_uuid(), v_service_id, 'Bulk discounts up to 40%', 3),
    (gen_random_uuid(), v_service_id, 'Design assistance included', 4),
    (gen_random_uuid(), v_service_id, 'Fast delivery', 5),
    (gen_random_uuid(), v_service_id, 'Quality guarantee', 6),
    (gen_random_uuid(), v_service_id, 'Eco-friendly options', 7),
    (gen_random_uuid(), v_service_id, 'Size range XS-5XL', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Event T-Shirts', 1),
    (gen_random_uuid(), v_service_id, 'Team Uniforms', 2),
    (gen_random_uuid(), v_service_id, 'Corporate Branding', 3),
    (gen_random_uuid(), v_service_id, 'Family Reunions', 4),
    (gen_random_uuid(), v_service_id, 'School Spirit Wear', 5),
    (gen_random_uuid(), v_service_id, 'Bachelorette Parties', 6),
    (gen_random_uuid(), v_service_id, 'Fundraising Events', 7),
    (gen_random_uuid(), v_service_id, 'Sports Teams', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Choose Style', 'Select t-shirt style, color, and quantity', 'Shirt', 1),
    (gen_random_uuid(), v_service_id, 2, 'Upload Design', 'Submit your artwork or describe your idea', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Get Proof', 'Receive digital proof for approval', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Production', 'Your shirts are printed with care', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Quality Check', 'Each shirt is inspected', 'CheckCircle', 5),
    (gen_random_uuid(), v_service_id, 6, 'Delivery', 'Shipped to your door', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Print Methods', 'DTF, Screen Print, DTG', 1),
    (gen_random_uuid(), v_service_id, 'Max Colors', 'Full CMYK', 2),
    (gen_random_uuid(), v_service_id, 'Fabric Types', 'Cotton, Polyester, Blends', 3),
    (gen_random_uuid(), v_service_id, 'Size Range', 'XS to 5XL', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, '100% Cotton', 1),
    (gen_random_uuid(), v_service_id, '100% Polyester', 2),
    (gen_random_uuid(), v_service_id, 'Tri-Blend', 3),
    (gen_random_uuid(), v_service_id, 'Ring-spun Cotton', 4),
    (gen_random_uuid(), v_service_id, 'Organic Cotton', 5),
    (gen_random_uuid(), v_service_id, 'Performance Fabric', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PNG', 2),
    (gen_random_uuid(), v_service_id, 'PDF', 3),
    (gen_random_uuid(), v_service_id, 'PSD', 4),
    (gen_random_uuid(), v_service_id, 'JPG', 5),
    (gen_random_uuid(), v_service_id, 'EPS', 6);

  INSERT INTO service_colors (id, service_id, color, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'White', 1),
    (gen_random_uuid(), v_service_id, 'Black', 2),
    (gen_random_uuid(), v_service_id, 'Navy', 3),
    (gen_random_uuid(), v_service_id, 'Red', 4),
    (gen_random_uuid(), v_service_id, 'Royal Blue', 5),
    (gen_random_uuid(), v_service_id, 'Forest Green', 6),
    (gen_random_uuid(), v_service_id, 'Maroon', 7),
    (gen_random_uuid(), v_service_id, 'Gray', 8);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What t-shirt brands do you use?', 'We use premium brands including Gildan, Bella+Canvas, Hanes, and Anvil. We can also print on customer-supplied shirts.', 1),
    (gen_random_uuid(), v_service_id, 'What is the best printing method for my design?', 'For full-color photos and complex designs, DTF is best. For simple designs in bulk, screen printing is most economical. For small quantities, DTG works well.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is just 1 piece for DTF printing. Screen printing requires 24 pieces minimum.', 3);

  RAISE NOTICE 'T-Shirt Printing seeded successfully';
END $$;

-- Custom Hats
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-HATS-001',
    'Custom Hats',
    'hats',
    'Personalized hats and caps with embroidery or printed designs.',
    'Make a statement with custom headwear for your team, brand, or event. We offer a wide range of hat styles including baseball caps, snapbacks, beanies, visors, and trucker hats. Choose from embroidery for a premium look or printed designs for full-color artwork.',
    'Shirt',
    'from-blue-500',
    'to-cyan-500',
    'Trending',
    'apparel-printing',
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
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Embroidery included', 1),
    (gen_random_uuid(), v_service_id, 'Printed options available', 2),
    (gen_random_uuid(), v_service_id, 'Adjustable fit styles', 3),
    (gen_random_uuid(), v_service_id, 'Various crown styles', 4),
    (gen_random_uuid(), v_service_id, 'Bulk discounts', 5),
    (gen_random_uuid(), v_service_id, 'Fast delivery', 6),
    (gen_random_uuid(), v_service_id, 'Custom patches', 7),
    (gen_random_uuid(), v_service_id, '3D puff embroidery', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Events', 1),
    (gen_random_uuid(), v_service_id, 'Sports Teams', 2),
    (gen_random_uuid(), v_service_id, 'Trade Shows', 3),
    (gen_random_uuid(), v_service_id, 'Golf Tournaments', 4),
    (gen_random_uuid(), v_service_id, 'Brand Promotion', 5),
    (gen_random_uuid(), v_service_id, 'Wedding Parties', 6),
    (gen_random_uuid(), v_service_id, 'Music Festivals', 7),
    (gen_random_uuid(), v_service_id, 'Streetwear Brands', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Choose Style', 'Select hat style and color', 'Shirt', 1),
    (gen_random_uuid(), v_service_id, 2, 'Submit Logo', 'Upload your artwork', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Digitize', 'We prepare your design for embroidery', 'Sparkles', 3),
    (gen_random_uuid(), v_service_id, 4, 'Production', 'Your hats are embroidered', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Quality Check', 'Each hat inspected', 'CheckCircle', 5),
    (gen_random_uuid(), v_service_id, 6, 'Ship', 'Delivered to your location', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Embroidery', 'Up to 12 colors', 1),
    (gen_random_uuid(), v_service_id, 'Max Stitches', '15,000', 2),
    (gen_random_uuid(), v_service_id, 'Hat Styles', 'Baseball, Snapback, Beanie, Visor', 3),
    (gen_random_uuid(), v_service_id, 'Closure', 'Adjustable, Strapback, Flexfit', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Cotton Twill', 1),
    (gen_random_uuid(), v_service_id, 'Polyester', 2),
    (gen_random_uuid(), v_service_id, 'Wool Blend', 3),
    (gen_random_uuid(), v_service_id, 'Acrylic', 4),
    (gen_random_uuid(), v_service_id, 'Mesh Back', 5),
    (gen_random_uuid(), v_service_id, 'Denim', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PNG', 2),
    (gen_random_uuid(), v_service_id, 'PDF', 3),
    (gen_random_uuid(), v_service_id, 'EPS', 4),
    (gen_random_uuid(), v_service_id, 'DST', 5),
    (gen_random_uuid(), v_service_id, 'PES', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can I get a sample before bulk order?', 'Yes! We offer sample service for bulk orders. Order 1-2 pieces to approve quality before placing your full order.', 1),
    (gen_random_uuid(), v_service_id, 'What is the difference between embroidery and print?', 'Embroidery is stitched thread for a premium, textured look that lasts forever. Printing allows full-color, photo-realistic designs but may fade over time.', 2),
    (gen_random_uuid(), v_service_id, 'Do you offer custom patches?', 'Yes! We can create custom woven or embroidered patches that can be attached to hats.', 3);

  RAISE NOTICE 'Custom Hats seeded successfully';
END $$;

-- Screen Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-SCREEN-001',
    'Screen Printing',
    'screen-printing',
    'Traditional screen printing for bulk orders with excellent color payoff.',
    'Screen printing is the industry standard for bulk orders, offering excellent color payoff and cost-effectiveness for larger quantities. Ideal for team uniforms, events, and merchandise. Each color is applied through a separate screen, creating vibrant, durable prints that last.',
    'Layers',
    'from-blue-500',
    'to-cyan-500',
    'Best for Bulk',
    'apparel-printing',
    'ETB 120 - 400',
    '24 pieces',
    '5-7 days',
    true, true, false,
    4,
    'active',
    'Screen Printing Services | Bulk Order Printing',
    'Professional screen printing for bulk apparel orders. Spot colors, Pantone matching, durable prints.',
    'screen printing, bulk t-shirt printing, custom screen printing, apparel printing',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Bulk orders - best pricing for 24+ pieces', 1),
    (gen_random_uuid(), v_service_id, 'Spot colors with Pantone matching', 2),
    (gen_random_uuid(), v_service_id, 'Cost effective for large quantities', 3),
    (gen_random_uuid(), v_service_id, 'Durable prints that last', 4),
    (gen_random_uuid(), v_service_id, 'Specialty inks available', 5),
    (gen_random_uuid(), v_service_id, 'Underbase for dark garments', 6),
    (gen_random_uuid(), v_service_id, 'Simulated process for full color', 7),
    (gen_random_uuid(), v_service_id, 'Discharge printing option', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Team Uniforms', 1),
    (gen_random_uuid(), v_service_id, 'Event T-Shirts', 2),
    (gen_random_uuid(), v_service_id, 'Band Merchandise', 3),
    (gen_random_uuid(), v_service_id, 'School Spirit Wear', 4),
    (gen_random_uuid(), v_service_id, 'Corporate Apparel', 5),
    (gen_random_uuid(), v_service_id, 'Festival T-Shirts', 6),
    (gen_random_uuid(), v_service_id, 'Sports Jerseys', 7),
    (gen_random_uuid(), v_service_id, 'Promotional Wear', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Artwork Prep', 'Separate colors and prepare films', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Screen Creation', 'Expose screens for each color', 'Layers', 2),
    (gen_random_uuid(), v_service_id, 3, 'Setup', 'Register screens on press', 'Settings', 3),
    (gen_random_uuid(), v_service_id, 4, 'Print', 'Apply colors layer by layer', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Flash Cure', 'Partial cure between colors', 'Flame', 5),
    (gen_random_uuid(), v_service_id, 6, 'Final Cure', 'Heat set for durability', 'CheckCircle', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Colors', 'Up to 6 spot colors', 1),
    (gen_random_uuid(), v_service_id, 'Sim Process', 'Up to 4 colors', 2),
    (gen_random_uuid(), v_service_id, 'Min Order', '24 pieces', 3),
    (gen_random_uuid(), v_service_id, 'Artwork', 'Vector required', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, '100% Cotton', 1),
    (gen_random_uuid(), v_service_id, 'Cotton/Polyester Blends', 2),
    (gen_random_uuid(), v_service_id, 'Performance Fabrics', 3),
    (gen_random_uuid(), v_service_id, 'Dark Garments', 4),
    (gen_random_uuid(), v_service_id, 'Light Garments', 5),
    (gen_random_uuid(), v_service_id, 'Hoodies', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the minimum order for screen printing?', 'Our minimum order is 24 pieces for screen printing to make it cost-effective. For smaller quantities, we recommend DTF printing.', 1),
    (gen_random_uuid(), v_service_id, 'How many colors can you print?', 'We can print up to 6 spot colors. For full-color designs, we offer simulated process printing using 4 colors.', 2),
    (gen_random_uuid(), v_service_id, 'What file format do you need?', 'We require vector files (AI, EPS, PDF) for screen printing. Our designers can convert your files if needed.', 3);

  RAISE NOTICE 'Screen Printing seeded successfully';
END $$;

-- Embroidery
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-EMBROIDERY-001',
    'Embroidery',
    'embroidery',
    'Professional embroidery for a premium, textured look.',
    'Add a touch of class with our professional embroidery service. Perfect for corporate wear, caps, jackets, and bags. We offer digitizing services and thread matching for a premium finish that lasts forever. Embroidery adds texture and dimension that stands out.',
    'Sparkles',
    'from-green-500',
    'to-emerald-500',
    'Premium',
    'apparel-printing',
    'ETB 180 - 550',
    '6 pieces',
    '5-7 days',
    true, true, false,
    5,
    'active',
    'Professional Embroidery Services | Custom Logo Embroidery',
    'Premium custom embroidery for corporate wear, caps, and jackets. Digitizing included, thread matching, 3D puff option.',
    'embroidery, custom embroidery, logo embroidery, digitizing, 3d puff embroidery',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, '3D puff embroidery option', 1),
    (gen_random_uuid(), v_service_id, 'Perfect thread matching', 2),
    (gen_random_uuid(), v_service_id, 'Digitizing included', 3),
    (gen_random_uuid(), v_service_id, 'Multiple placement options', 4),
    (gen_random_uuid(), v_service_id, 'Bulk discounts available', 5),
    (gen_random_uuid(), v_service_id, 'Professional finish', 6),
    (gen_random_uuid(), v_service_id, 'Left chest, full front, sleeve', 7),
    (gen_random_uuid(), v_service_id, 'Back embroidery available', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Polos', 1),
    (gen_random_uuid(), v_service_id, 'Company Caps', 2),
    (gen_random_uuid(), v_service_id, 'Team Jackets', 3),
    (gen_random_uuid(), v_service_id, 'Uniforms', 4),
    (gen_random_uuid(), v_service_id, 'Golf Shirts', 5),
    (gen_random_uuid(), v_service_id, 'Workwear', 6),
    (gen_random_uuid(), v_service_id, 'Tote Bags', 7),
    (gen_random_uuid(), v_service_id, 'Hoodies', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Digitize', 'Convert artwork to stitch file', 'Sparkles', 1),
    (gen_random_uuid(), v_service_id, 2, 'Thread Select', 'Match thread colors', 'Palette', 2),
    (gen_random_uuid(), v_service_id, 3, 'Hoop', 'Mount garment in hoop', 'Package', 3),
    (gen_random_uuid(), v_service_id, 4, 'Stitch', 'Machine embroidery', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Trim', 'Remove excess threads', 'Scissors', 5),
    (gen_random_uuid(), v_service_id, 6, 'Press', 'Final pressing', 'Flame', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Stitches', '15,000 per design', 1),
    (gen_random_uuid(), v_service_id, 'Max Size', '12" x 12"', 2),
    (gen_random_uuid(), v_service_id, 'Colors', 'Up to 12 thread colors', 3),
    (gen_random_uuid(), v_service_id, 'Min Order', '6 pieces', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Polo Shirts', 1),
    (gen_random_uuid(), v_service_id, 'Caps & Hats', 2),
    (gen_random_uuid(), v_service_id, 'Jackets', 3),
    (gen_random_uuid(), v_service_id, 'Hoodies', 4),
    (gen_random_uuid(), v_service_id, 'Tote Bags', 5),
    (gen_random_uuid(), v_service_id, 'Aprons', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PNG', 2),
    (gen_random_uuid(), v_service_id, 'JPG', 3),
    (gen_random_uuid(), v_service_id, 'DST', 4),
    (gen_random_uuid(), v_service_id, 'PES', 5),
    (gen_random_uuid(), v_service_id, 'EXP', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is digitizing?', 'Digitizing is the process of converting your logo into a stitch file that embroidery machines can read. It determines stitch types, directions, and densities for the best result.', 1),
    (gen_random_uuid(), v_service_id, 'How long does embroidery last?', 'Embroidery is permanent and will last as long as the garment itself. It won''t fade, crack, or peel like printed designs.', 2),
    (gen_random_uuid(), v_service_id, 'What is 3D puff embroidery?', '3D puff uses a foam underlay to create raised, three-dimensional text or logos for a standout effect.', 3);

  RAISE NOTICE 'Embroidery seeded successfully';
END $$;

-- Hoodies
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-HOODIE-001',
    'Hoodies',
    'hoodies',
    'Comfortable custom hoodies for any season.',
    'Stay warm and stylish with our custom hoodies and sweatshirts. Perfect for teams, events, and corporate wear. Various styles and colors available with multiple print methods including DTF, screen printing, and embroidery.',
    'Shirt',
    'from-blue-500',
    'to-purple-500',
    NULL,
    'apparel-printing',
    'ETB 250 - 600',
    '6 pieces',
    '3-5 days',
    false, true, false,
    6,
    'active',
    'Custom Hoodies & Sweatshirts | Team Apparel',
    'Premium custom hoodies and sweatshirts for teams, events, and corporate wear. DTF, screen print, embroidery options.',
    'custom hoodies, printed hoodies, embroidered sweatshirts, team apparel',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Premium blank hoodies', 1),
    (gen_random_uuid(), v_service_id, 'All sizes XS-5XL', 2),
    (gen_random_uuid(), v_service_id, 'Embroidery option', 3),
    (gen_random_uuid(), v_service_id, 'Bulk pricing available', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Quality materials', 6),
    (gen_random_uuid(), v_service_id, 'Pockets available', 7),
    (gen_random_uuid(), v_service_id, 'Zipper or pullover', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Team Warm-ups', 1),
    (gen_random_uuid(), v_service_id, 'Company Events', 2),
    (gen_random_uuid(), v_service_id, 'Brand Merchandise', 3),
    (gen_random_uuid(), v_service_id, 'Gifts', 4),
    (gen_random_uuid(), v_service_id, 'School Spirit', 5),
    (gen_random_uuid(), v_service_id, 'Music Bands', 6),
    (gen_random_uuid(), v_service_id, 'Sports Teams', 7),
    (gen_random_uuid(), v_service_id, 'Family Reunions', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Choose Style', 'Select hoodie type and color', 'Shirt', 1),
    (gen_random_uuid(), v_service_id, 2, 'Design', 'Submit your artwork', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Method', 'Choose print or embroidery', 'Palette', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve digital mockup', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Production', 'Print or embroider', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Ship', 'Deliver to you', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Styles', 'Pullover, Zip-up, Hoodless', 1),
    (gen_random_uuid(), v_service_id, 'Fabrics', 'Cotton, Fleece, Blends', 2),
    (gen_random_uuid(), v_service_id, 'Weights', '7.5oz - 12oz', 3),
    (gen_random_uuid(), v_service_id, 'Print Area', 'Full front, back, sleeve', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, '80/20 Cotton/Poly', 1),
    (gen_random_uuid(), v_service_id, '50/50 Cotton/Poly', 2),
    (gen_random_uuid(), v_service_id, '100% Cotton', 3),
    (gen_random_uuid(), v_service_id, 'French Terry', 4),
    (gen_random_uuid(), v_service_id, 'Fleece', 5),
    (gen_random_uuid(), v_service_id, 'Performance Fabric', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What print methods work best on hoodies?', 'DTF printing works great for full-color designs on any color hoodie. Screen printing is best for bulk orders with spot colors. Embroidery gives a premium, textured look.', 1),
    (gen_random_uuid(), v_service_id, 'Do you offer youth sizes?', 'Yes! We carry youth sizes in most hoodie styles. Please specify when ordering.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 6 pieces for custom hoodies. Smaller quantities may be available for DTF printing.', 3);

  RAISE NOTICE 'Hoodies seeded successfully';
END $$;

-- Tote Bags
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-TOTE-001',
    'Tote Bags',
    'totes',
    'Eco-friendly custom tote bags for retail and promotions.',
    'Eco-friendly custom tote bags perfect for retail, events, and promotional giveaways. Various materials and printing options available. Our bags are reusable, durable, and help reduce plastic waste while promoting your brand.',
    'ShoppingBag',
    'from-green-500',
    'to-emerald-500',
    'Eco',
    'apparel-printing',
    'ETB 100 - 300',
    '25 pieces',
    '3-5 days',
    false, false, true,
    7,
    'active',
    'Custom Tote Bags | Eco-Friendly Promotional Bags',
    'Custom printed tote bags for retail and promotions. Eco-friendly materials, reusable, durable.',
    'custom tote bags, promotional bags, eco-friendly bags, printed shopping bags',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Eco-friendly materials', 1),
    (gen_random_uuid(), v_service_id, 'Reusable and durable', 2),
    (gen_random_uuid(), v_service_id, 'Custom printing', 3),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Multiple sizes', 6),
    (gen_random_uuid(), v_service_id, 'Reinforced handles', 7),
    (gen_random_uuid(), v_service_id, 'Foldable options', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Grocery Shopping', 1),
    (gen_random_uuid(), v_service_id, 'Retail Stores', 2),
    (gen_random_uuid(), v_service_id, 'Trade Shows', 3),
    (gen_random_uuid(), v_service_id, 'Conference Swag', 4),
    (gen_random_uuid(), v_service_id, 'Brand Giveaways', 5),
    (gen_random_uuid(), v_service_id, 'Farmers Markets', 6),
    (gen_random_uuid(), v_service_id, 'Bookstores', 7),
    (gen_random_uuid(), v_service_id, 'Gift Shops', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Select Bag', 'Choose style and material', 'ShoppingBag', 1),
    (gen_random_uuid(), v_service_id, 2, 'Design', 'Submit your artwork', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Print Method', 'Screen print or DTF', 'Printer', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve design', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Production', 'Print and assemble', 'Package', 5),
    (gen_random_uuid(), v_service_id, 6, 'Ship', 'Deliver to you', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Cotton, Canvas, Non-woven', 1),
    (gen_random_uuid(), v_service_id, 'Sizes', '15"x15", 16"x18", Custom', 2),
    (gen_random_uuid(), v_service_id, 'Handle Types', 'Short, Long, Shoulder', 3),
    (gen_random_uuid(), v_service_id, 'Print Area', 'One or two sides', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, '100% Cotton', 1),
    (gen_random_uuid(), v_service_id, 'Canvas', 2),
    (gen_random_uuid(), v_service_id, 'Non-woven Polypropylene', 3),
    (gen_random_uuid(), v_service_id, 'Jute', 4),
    (gen_random_uuid(), v_service_id, 'Recycled PET', 5),
    (gen_random_uuid(), v_service_id, 'Muslin', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the most eco-friendly option?', 'Our 100% cotton and jute bags are biodegradable and most eco-friendly. Recycled PET bags are made from recycled plastic bottles.', 1),
    (gen_random_uuid(), v_service_id, 'Can I get a sample before bulk order?', 'Yes! We offer sample service. Order 1-3 pieces to approve quality before placing your full order.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 25 pieces for custom tote bags.', 3);

  RAISE NOTICE 'Tote Bags seeded successfully';
END $$;

-- =====================================================
-- 2. LARGE FORMAT SERVICES (6 services)
-- =====================================================

-- Banner Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-BANNER-001',
    'Banner Printing',
    'banners',
    'Large format banners for indoor and outdoor advertising.',
    'High-quality banner printing for events, retail displays, trade shows, and outdoor advertising. We offer various materials including vinyl, mesh, and fabric, with finishes to suit any environment. Our banners are weather-resistant and built to last.',
    'Megaphone',
    'from-red-500',
    'to-orange-500',
    'Popular',
    'large-format',
    'ETB 250 - 2000',
    '1 piece',
    '1-2 days',
    true, true, false,
    8,
    'active',
    'Professional Banner Printing | Indoor & Outdoor Banners',
    'High-quality custom banner printing. Indoor and outdoor options, various sizes, weather-resistant. Perfect for events and advertising.',
    'banner printing, vinyl banners, mesh banners, outdoor signs, event banners',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Indoor/outdoor options', 1),
    (gen_random_uuid(), v_service_id, 'Multiple sizes up to 5m', 2),
    (gen_random_uuid(), v_service_id, 'Grommets included', 3),
    (gen_random_uuid(), v_service_id, 'Weather resistant', 4),
    (gen_random_uuid(), v_service_id, 'UV protection', 5),
    (gen_random_uuid(), v_service_id, 'Fast production', 6),
    (gen_random_uuid(), v_service_id, 'Hemmed edges', 7),
    (gen_random_uuid(), v_service_id, 'Pole pockets available', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Trade Show Displays', 1),
    (gen_random_uuid(), v_service_id, 'Store Fronts', 2),
    (gen_random_uuid(), v_service_id, 'Event Backdrops', 3),
    (gen_random_uuid(), v_service_id, 'Construction Sites', 4),
    (gen_random_uuid(), v_service_id, 'Retail Promotions', 5),
    (gen_random_uuid(), v_service_id, 'Festivals & Fairs', 6),
    (gen_random_uuid(), v_service_id, 'Political Campaigns', 7),
    (gen_random_uuid(), v_service_id, 'Real Estate Signs', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Upload Design', 'Submit your artwork', 'Upload', 1),
    (gen_random_uuid(), v_service_id, 2, 'Size Selection', 'Choose dimensions and material', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Proof Approval', 'Review digital proof', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Printing', 'Large format printing', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Finishing', 'Add grommets, hems, or pockets', 'Scissors', 5),
    (gen_random_uuid(), v_service_id, 6, 'Delivery', 'Shipped or ready for pickup', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Width', '5 meters', 1),
    (gen_random_uuid(), v_service_id, 'Resolution', '720 DPI', 2),
    (gen_random_uuid(), v_service_id, 'Material Options', 'Vinyl, Mesh, Fabric', 3),
    (gen_random_uuid(), v_service_id, 'Finishing', 'Grommets, Hems, Pockets', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Vinyl Banner', 1),
    (gen_random_uuid(), v_service_id, 'Mesh Banner', 2),
    (gen_random_uuid(), v_service_id, 'Fabric Banner', 3),
    (gen_random_uuid(), v_service_id, 'Backlit Film', 4),
    (gen_random_uuid(), v_service_id, 'Scrim Vinyl', 5),
    (gen_random_uuid(), v_service_id, 'Blockout Vinyl', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the difference between vinyl and mesh?', 'Vinyl is solid and waterproof, ideal for general use. Mesh has small holes that allow wind to pass through, making it perfect for large outdoor banners in windy areas.', 1),
    (gen_random_uuid(), v_service_id, 'How do I install my banner?', 'Banners come with grommets (metal rings) every 2-3 feet for easy hanging with zip ties or rope. We can also add pole pockets for display on stands.', 2),
    (gen_random_uuid(), v_service_id, 'What file format should I use?', 'We accept AI, PDF, TIFF, JPG, and PSD. For best results, provide vector files at actual size.', 3);

  RAISE NOTICE 'Banner Printing seeded successfully';
END $$;

-- Posters
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-POSTER-001',
    'Posters',
    'posters',
    'High-quality posters for events and advertising.',
    'Vibrant posters for events, promotions, and advertising. Various sizes and paper options available for indoor and outdoor use. Perfect for concerts, movies, exhibitions, and retail displays.',
    'Camera',
    'from-purple-500',
    'to-pink-500',
    NULL,
    'large-format',
    'ETB 150 - 1500',
    '1 piece',
    '1-2 days',
    false, true, false,
    9,
    'active',
    'Custom Poster Printing | High-Quality Posters',
    'Professional poster printing for events, advertising, and displays. Various sizes, finishes, and paper options.',
    'poster printing, custom posters, event posters, movie posters, large format posters',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Multiple sizes available', 1),
    (gen_random_uuid(), v_service_id, 'High resolution up to 2400 DPI', 2),
    (gen_random_uuid(), v_service_id, 'UV resistant options', 3),
    (gen_random_uuid(), v_service_id, 'Fast printing', 4),
    (gen_random_uuid(), v_service_id, 'Bulk orders welcome', 5),
    (gen_random_uuid(), v_service_id, 'Lamination available', 6),
    (gen_random_uuid(), v_service_id, 'Matte or gloss finish', 7),
    (gen_random_uuid(), v_service_id, 'Mounting options', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Movie Posters', 1),
    (gen_random_uuid(), v_service_id, 'Concert Announcements', 2),
    (gen_random_uuid(), v_service_id, 'Exhibition Displays', 3),
    (gen_random_uuid(), v_service_id, 'Retail Advertising', 4),
    (gen_random_uuid(), v_service_id, 'Educational Charts', 5),
    (gen_random_uuid(), v_service_id, 'Art Prints', 6),
    (gen_random_uuid(), v_service_id, 'Event Promotion', 7),
    (gen_random_uuid(), v_service_id, 'Wall Decor', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Upload Design', 'Submit high-resolution file', 'Upload', 1),
    (gen_random_uuid(), v_service_id, 2, 'Size Select', 'Choose dimensions', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Paper Choice', 'Select paper type', 'FileText', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Review digital proof', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Print', 'Large format printing', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Finish', 'Trim and package', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Sizes', 'A3, A2, A1, A0, Custom', 1),
    (gen_random_uuid(), v_service_id, 'Paper Weight', '150-300gsm', 2),
    (gen_random_uuid(), v_service_id, 'Resolution', '300 DPI minimum', 3),
    (gen_random_uuid(), v_service_id, 'Finishes', 'Matte, Gloss, Satin', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Gloss Paper', 1),
    (gen_random_uuid(), v_service_id, 'Matte Paper', 2),
    (gen_random_uuid(), v_service_id, 'Photo Paper', 3),
    (gen_random_uuid(), v_service_id, 'Canvas', 4),
    (gen_random_uuid(), v_service_id, 'Vinyl', 5),
    (gen_random_uuid(), v_service_id, 'Cardstock', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What resolution do I need for a poster?', 'For best results, provide files at 300 DPI at final size. Large format posters can sometimes use 150 DPI if viewed from a distance.', 1),
    (gen_random_uuid(), v_service_id, 'Can you print one poster or do I need bulk?', 'We print single posters as well as bulk orders. No minimum quantity!', 2),
    (gen_random_uuid(), v_service_id, 'What paper types do you offer?', 'We offer gloss, matte, photo paper, and canvas options for posters.', 3);

  RAISE NOTICE 'Posters seeded successfully';
END $$;

-- Vehicle Wraps
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-WRAPS-001',
    'Vehicle Wraps',
    'wraps',
    'Full and partial vehicle wraps for mobile advertising.',
    'Turn your fleet into moving billboards with our professional vehicle wrap service. Full wraps, partial wraps, and decals available with professional installation. Our wraps are made from high-quality cast vinyl that conforms to every curve of your vehicle.',
    'Car',
    'from-blue-500',
    'to-indigo-500',
    'Professional',
    'large-format',
    'ETB 5000 - 30000',
    '1 vehicle',
    '3-5 days',
    false, false, true,
    10,
    'active',
    'Vehicle Wraps | Full & Partial Car Wraps | Fleet Branding',
    'Professional vehicle wrap services. Full wraps, partial wraps, fleet branding. Premium cast vinyl, professional installation.',
    'vehicle wraps, car wraps, fleet branding, vinyl wraps, vehicle advertising',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Full and partial wraps', 1),
    (gen_random_uuid(), v_service_id, 'Commercial and personal vehicles', 2),
    (gen_random_uuid(), v_service_id, 'Premium cast vinyl', 3),
    (gen_random_uuid(), v_service_id, 'Design service included', 4),
    (gen_random_uuid(), v_service_id, 'Professional installation', 5),
    (gen_random_uuid(), v_service_id, 'Removable without damage', 6),
    (gen_random_uuid(), v_service_id, 'UV protection', 7),
    (gen_random_uuid(), v_service_id, '5-7 year durability', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Company Fleet Vehicles', 1),
    (gen_random_uuid(), v_service_id, 'Food Trucks', 2),
    (gen_random_uuid(), v_service_id, 'Racing Cars', 3),
    (gen_random_uuid(), v_service_id, 'Delivery Vans', 4),
    (gen_random_uuid(), v_service_id, 'Ride-share Cars', 5),
    (gen_random_uuid(), v_service_id, 'Buses', 6),
    (gen_random_uuid(), v_service_id, 'Trailers', 7),
    (gen_random_uuid(), v_service_id, 'Boats', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Consultation', 'Discuss design and goals', 'MessageCircle', 1),
    (gen_random_uuid(), v_service_id, 2, 'Design', 'Create custom wrap design', 'Palette', 2),
    (gen_random_uuid(), v_service_id, 3, 'Proof', 'Approve design', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Print', 'Large format printing', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Laminate', 'Add protective layer', 'Sparkles', 5),
    (gen_random_uuid(), v_service_id, 6, 'Install', 'Professional application', 'Car', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Vinyl Type', 'Cast (premium) or Calendared', 1),
    (gen_random_uuid(), v_service_id, 'Laminate', 'Gloss, Matte, Satin', 2),
    (gen_random_uuid(), v_service_id, 'Durability', '5-7 years', 3),
    (gen_random_uuid(), v_service_id, 'Coverage', 'Full, Partial, Spot graphics', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Cast Vinyl', 1),
    (gen_random_uuid(), v_service_id, 'Calendared Vinyl', 2),
    (gen_random_uuid(), v_service_id, 'Overlaminate', 3),
    (gen_random_uuid(), v_service_id, 'Air-release Technology', 4),
    (gen_random_uuid(), v_service_id, 'Reflective Vinyl', 5);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'How long do vehicle wraps last?', 'Premium cast vinyl wraps last 5-7 years with proper care. They protect your original paint and can be removed without damage.', 1),
    (gen_random_uuid(), v_service_id, 'Can I wash my wrapped vehicle?', 'Yes! Hand washing is recommended. Avoid automatic car washes with brushes. We provide complete care instructions.', 2),
    (gen_random_uuid(), v_service_id, 'Do you offer design services?', 'Yes, our professional designers will create a custom wrap design for your vehicle based on your branding and requirements.', 3);

  RAISE NOTICE 'Vehicle Wraps seeded successfully';
END $$;

-- Light Box
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-LIGHTBOX-001',
    'Light Box',
    'light-box',
    'LED illuminated signs for eye-catching displays.',
    'Professional LED light boxes for retail, business signage, and events. Custom sizes and designs with bright, energy-efficient LED lighting. Our light boxes create stunning visual impact day and night, perfect for storefronts, trade shows, and interior displays.',
    'Lightbulb',
    'from-yellow-500',
    'to-amber-500',
    'Premium',
    'large-format',
    'ETB 1500 - 5000',
    '1 piece',
    '5-7 days',
    true, false, false,
    11,
    'active',
    'LED Light Boxes | Custom Illuminated Signs',
    'Professional LED light boxes for retail and business signage. Custom sizes, energy-efficient, stunning illumination.',
    'light box, LED sign, illuminated sign, retail signage, custom light box',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'LED illumination', 1),
    (gen_random_uuid(), v_service_id, 'Custom sizes', 2),
    (gen_random_uuid(), v_service_id, 'Energy efficient', 3),
    (gen_random_uuid(), v_service_id, 'Long lifespan', 4),
    (gen_random_uuid(), v_service_id, 'Indoor/outdoor', 5),
    (gen_random_uuid(), v_service_id, 'Easy installation', 6),
    (gen_random_uuid(), v_service_id, 'Even lighting', 7),
    (gen_random_uuid(), v_service_id, 'Slim profile', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Store Fronts', 1),
    (gen_random_uuid(), v_service_id, 'Menu Boards', 2),
    (gen_random_uuid(), v_service_id, 'Trade Show Displays', 3),
    (gen_random_uuid(), v_service_id, 'Wayfinding Signs', 4),
    (gen_random_uuid(), v_service_id, 'Brand Displays', 5),
    (gen_random_uuid(), v_service_id, 'Museum Exhibits', 6),
    (gen_random_uuid(), v_service_id, 'Hotel Lobbies', 7),
    (gen_random_uuid(), v_service_id, 'Restaurant Signs', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create your artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Size Selection', 'Choose dimensions', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Frame Build', 'Construct aluminum frame', 'Package', 3),
    (gen_random_uuid(), v_service_id, 4, 'LED Installation', 'Install LED lighting', 'Lightbulb', 4),
    (gen_random_uuid(), v_service_id, 5, 'Print Face', 'Print graphic on acrylic', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Assembly', 'Complete and test', 'CheckCircle', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Frame Material', 'Aluminum', 1),
    (gen_random_uuid(), v_service_id, 'Face Material', 'Acrylic', 2),
    (gen_random_uuid(), v_service_id, 'LED Type', 'SMD 2835', 3),
    (gen_random_uuid(), v_service_id, 'Lifespan', '50,000 hours', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Aluminum Frame', 1),
    (gen_random_uuid(), v_service_id, 'Acrylic Face', 2),
    (gen_random_uuid(), v_service_id, 'PVC Back', 3),
    (gen_random_uuid(), v_service_id, 'LED Strips', 4),
    (gen_random_uuid(), v_service_id, 'Power Supply', 5),
    (gen_random_uuid(), v_service_id, 'Mounting Hardware', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can I change the graphic later?', 'Yes! Many of our light boxes feature removable faces, allowing you to update graphics as needed without replacing the entire unit.', 1),
    (gen_random_uuid(), v_service_id, 'Are they suitable for outdoor use?', 'Absolutely! We offer weatherproof options with sealed frames and UV-protected faces specifically designed for outdoor installation.', 2),
    (gen_random_uuid(), v_service_id, 'What is the turnaround time?', 'Standard production takes 5-7 business days. Rush orders may be available for an additional fee.', 3);

  RAISE NOTICE 'Light Box seeded successfully';
END $$;

-- Neo Light
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-NEON-001',
    'Neo Light',
    'neo-light',
    'Flexible LED neon signs with modern appeal.',
    'Modern LED neon signs that mimic the look of traditional glass neon but are flexible, durable, and energy-efficient. Perfect for business signs, home decor, and events. Create custom shapes, logos, and text with our flexible LED tubing in various colors.',
    'Sparkles',
    'from-pink-500',
    'to-purple-500',
    'Trending',
    'large-format',
    'ETB 2000 - 8000',
    '1 piece',
    '7-10 days',
    false, true, true,
    12,
    'active',
    'LED Neon Signs | Custom Neo Light Signs',
    'Custom flexible LED neon signs for business and home decor. Energy-efficient, durable, fully customizable.',
    'led neon signs, neo light, custom neon, flexible neon, led signage',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Flexible design', 1),
    (gen_random_uuid(), v_service_id, 'Energy efficient', 2),
    (gen_random_uuid(), v_service_id, 'Custom shapes', 3),
    (gen_random_uuid(), v_service_id, 'Durable', 4),
    (gen_random_uuid(), v_service_id, 'Indoor/outdoor', 5),
    (gen_random_uuid(), v_service_id, 'Remote control', 6),
    (gen_random_uuid(), v_service_id, 'Dimmable options', 7),
    (gen_random_uuid(), v_service_id, 'RGB color changing', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Business Logos', 1),
    (gen_random_uuid(), v_service_id, 'Wedding Backdrops', 2),
    (gen_random_uuid(), v_service_id, 'Home Decor', 3),
    (gen_random_uuid(), v_service_id, 'Bar Signs', 4),
    (gen_random_uuid(), v_service_id, 'Store Windows', 5),
    (gen_random_uuid(), v_service_id, 'Photo Booths', 6),
    (gen_random_uuid(), v_service_id, 'Kids Room Decor', 7),
    (gen_random_uuid(), v_service_id, 'Event Branding', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Sketch Idea', 'Share your concept', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Digital Design', 'Create vector artwork', 'PenTool', 2),
    (gen_random_uuid(), v_service_id, 3, 'Size Selection', 'Choose dimensions', 'Ruler', 3),
    (gen_random_uuid(), v_service_id, 4, 'LED Fabrication', 'Bend and assemble', 'Sparkles', 4),
    (gen_random_uuid(), v_service_id, 5, 'Backer Board', 'Mount on acrylic', 'Package', 5),
    (gen_random_uuid(), v_service_id, 6, 'Test & Ship', 'Quality check and delivery', 'Truck', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'LED Type', 'Flexible Neon', 1),
    (gen_random_uuid(), v_service_id, 'Colors', 'Single, Multi, RGB', 2),
    (gen_random_uuid(), v_service_id, 'Power', '12V DC', 3),
    (gen_random_uuid(), v_service_id, 'Lifespan', '50,000 hours', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Flexible LED Tubing', 1),
    (gen_random_uuid(), v_service_id, 'Acrylic Backer', 2),
    (gen_random_uuid(), v_service_id, 'Power Supply', 3),
    (gen_random_uuid(), v_service_id, 'Mounting Hardware', 4),
    (gen_random_uuid(), v_service_id, 'Remote Control', 5),
    (gen_random_uuid(), v_service_id, 'Dimming Module', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'How does LED neon compare to glass neon?', 'LED neon is safer (no glass, low voltage), more durable, energy-efficient, and flexible. It can be shaped into custom designs that would be impossible with glass.', 1),
    (gen_random_uuid(), v_service_id, 'Can I hang it outdoors?', 'Yes! Our LED neon signs are weather-resistant and suitable for both indoor and outdoor use. We can add weatherproofing for exposed installations.', 2),
    (gen_random_uuid(), v_service_id, 'Can I get RGB color changing?', 'Yes! We offer RGB options with remote control for multiple color effects and dimming.', 3);

  RAISE NOTICE 'Neo Light seeded successfully';
END $$;

-- Cutout
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-CUTOUT-001',
    'Cutout',
    'cutout',
    'Custom die-cut shapes and letters.',
    'Custom die-cut shapes, letters, and designs in various materials. Perfect for signage, displays, stickers, and craft projects. Our precision cutting machines can create any shape you can imagine from vinyl, paper, cardboard, acrylic, and foam.',
    'Scissors',
    'from-green-500',
    'to-teal-500',
    NULL,
    'large-format',
    'ETB 100 - 1500',
    '1 piece',
    '2-3 days',
    false, false, true,
    13,
    'active',
    'Custom Cutouts | Die-Cut Shapes & Letters',
    'Precision die-cut shapes and letters in vinyl, acrylic, cardboard, and foam. Perfect for displays and crafts.',
    'custom cutouts, die-cut shapes, vinyl lettering, acrylic shapes, custom signage',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Custom shapes', 1),
    (gen_random_uuid(), v_service_id, 'Multiple materials', 2),
    (gen_random_uuid(), v_service_id, 'Precision cutting', 3),
    (gen_random_uuid(), v_service_id, 'Small to bulk', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Ready to use', 6),
    (gen_random_uuid(), v_service_id, 'Weeding included', 7),
    (gen_random_uuid(), v_service_id, 'Transfer tape', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Wall Decals', 1),
    (gen_random_uuid(), v_service_id, 'Window Graphics', 2),
    (gen_random_uuid(), v_service_id, 'Lettering', 3),
    (gen_random_uuid(), v_service_id, 'Craft Projects', 4),
    (gen_random_uuid(), v_service_id, 'Signage', 5),
    (gen_random_uuid(), v_service_id, 'Model Making', 6),
    (gen_random_uuid(), v_service_id, 'Packaging', 7),
    (gen_random_uuid(), v_service_id, 'Scrapbooking', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create vector artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Material', 'Select your material', 'Package', 2),
    (gen_random_uuid(), v_service_id, 3, 'Cut', 'Precision cutting', 'Scissors', 3),
    (gen_random_uuid(), v_service_id, 4, 'Weed', 'Remove excess', 'Scissors', 4),
    (gen_random_uuid(), v_service_id, 5, 'Apply Transfer', 'Add application tape', 'Sparkles', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Ready for use', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Width', '24"', 1),
    (gen_random_uuid(), v_service_id, 'Materials', 'Vinyl, Paper, Cardboard, Acrylic, Foam', 2),
    (gen_random_uuid(), v_service_id, 'Thickness', 'Up to 10mm', 3),
    (gen_random_uuid(), v_service_id, 'Tolerance', '±0.1mm', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Adhesive Vinyl', 1),
    (gen_random_uuid(), v_service_id, 'Heat Transfer Vinyl', 2),
    (gen_random_uuid(), v_service_id, 'Cardboard', 3),
    (gen_random_uuid(), v_service_id, 'Paper', 4),
    (gen_random_uuid(), v_service_id, 'Acrylic', 5),
    (gen_random_uuid(), v_service_id, 'Foam Board', 6),
    (gen_random_uuid(), v_service_id, 'Magnetic Sheet', 7),
    (gen_random_uuid(), v_service_id, 'Felt', 8);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'SVG', 3),
    (gen_random_uuid(), v_service_id, 'DXF', 4),
    (gen_random_uuid(), v_service_id, 'CDR', 5),
    (gen_random_uuid(), v_service_id, 'EPS', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the smallest detail you can cut?', 'We can cut details as small as 1mm in vinyl, 3mm in thicker materials. Contact us to discuss your specific needs.', 1),
    (gen_random_uuid(), v_service_id, 'Do you include application tape?', 'Yes! All adhesive vinyl cutouts include transfer tape for easy application. We also provide application instructions.', 2),
    (gen_random_uuid(), v_service_id, 'What materials can you cut?', 'We cut adhesive vinyl, heat transfer vinyl, paper, cardboard, acrylic (up to 3mm), foam board, and magnetic sheet.', 3);

  RAISE NOTICE 'Cutout seeded successfully';
END $$;

-- =====================================================
-- 3. STICKERS & LABELS SERVICES (3 services)
-- =====================================================

-- Custom Stickers
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-STICKER-001',
    'Custom Stickers',
    'stickers',
    'Die-cut and kiss-cut stickers in various finishes.',
    'High-quality custom stickers perfect for branding, products, and promotions. Choose from various shapes, sizes, and finishes including matte, glossy, and transparent. Our stickers are weather-resistant and durable, suitable for indoor and outdoor use.',
    'Tag',
    'from-yellow-500',
    'to-orange-500',
    'Popular',
    'stickers-labels',
    'ETB 100 - 1000',
    '10 pieces',
    '2-3 days',
    true, true, false,
    14,
    'active',
    'Custom Stickers | Die-Cut & Kiss-Cut | Waterproof Vinyl',
    'Professional custom sticker printing. Die-cut, kiss-cut, waterproof vinyl. Perfect for branding and promotions.',
    'custom stickers, die-cut stickers, kiss-cut stickers, vinyl stickers, waterproof stickers',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Custom die-cut shapes', 1),
    (gen_random_uuid(), v_service_id, 'Kiss-cut on sheets or rolls', 2),
    (gen_random_uuid(), v_service_id, 'Matte/glossy finish', 3),
    (gen_random_uuid(), v_service_id, 'Weather resistant', 4),
    (gen_random_uuid(), v_service_id, 'Small to bulk orders', 5),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 6),
    (gen_random_uuid(), v_service_id, 'Easy application', 7),
    (gen_random_uuid(), v_service_id, 'Removable options', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Product Branding', 1),
    (gen_random_uuid(), v_service_id, 'Laptop Decals', 2),
    (gen_random_uuid(), v_service_id, 'Water Bottles', 3),
    (gen_random_uuid(), v_service_id, 'Car Bumpers', 4),
    (gen_random_uuid(), v_service_id, 'Packaging Seals', 5),
    (gen_random_uuid(), v_service_id, 'Event Giveaways', 6),
    (gen_random_uuid(), v_service_id, 'Business Branding', 7),
    (gen_random_uuid(), v_service_id, 'Scrapbooking', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create or upload your artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Shape Selection', 'Choose custom or standard shape', 'Scissors', 2),
    (gen_random_uuid(), v_service_id, 3, 'Material', 'Select vinyl type and finish', 'Tag', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve digital proof', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Production', 'Print and cut your stickers', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Packaging', 'Shipped on sheets or rolls', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Size', '12" x 24"', 1),
    (gen_random_uuid(), v_service_id, 'Materials', 'Vinyl, Paper, Clear', 2),
    (gen_random_uuid(), v_service_id, 'Finishes', 'Matte, Glossy', 3),
    (gen_random_uuid(), v_service_id, 'Cut Type', 'Die-cut, Kiss-cut', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'White Vinyl', 1),
    (gen_random_uuid(), v_service_id, 'Clear Vinyl', 2),
    (gen_random_uuid(), v_service_id, 'Matte Paper', 3),
    (gen_random_uuid(), v_service_id, 'Glossy Paper', 4),
    (gen_random_uuid(), v_service_id, 'Weatherproof Vinyl', 5),
    (gen_random_uuid(), v_service_id, 'Removable Vinyl', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PNG', 2),
    (gen_random_uuid(), v_service_id, 'PDF', 3),
    (gen_random_uuid(), v_service_id, 'EPS', 4),
    (gen_random_uuid(), v_service_id, 'SVG', 5),
    (gen_random_uuid(), v_service_id, 'PSD', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the difference between die-cut and kiss-cut?', 'Die-cut stickers are cut through the material to the exact shape. Kiss-cut stickers are cut through the sticker layer but leave the backing intact, making them easy to peel.', 1),
    (gen_random_uuid(), v_service_id, 'Are your stickers waterproof?', 'Yes! Our vinyl stickers are waterproof and weather-resistant, perfect for outdoor use on cars, water bottles, and more.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is just 10 pieces, but we can print as few as 1 for custom shapes.', 3);

  RAISE NOTICE 'Custom Stickers seeded successfully';
END $$;

-- Product Labels
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-LABEL-001',
    'Product Labels',
    'labels',
    'Custom product labels for packaging and branding.',
    'Professional product labels for your packaging needs. Various materials and adhesives available for different applications, from food products to industrial items. Our labels are durable, waterproof, and designed to enhance your product presentation.',
    'Tag',
    'from-green-500',
    'to-teal-500',
    'Business',
    'stickers-labels',
    'ETB 200 - 1500',
    '100 pieces',
    '3-4 days',
    false, false, false,
    15,
    'active',
    'Custom Product Labels | Packaging Labels',
    'Professional custom labels for your products. Various materials, waterproof options, barcode ready.',
    'product labels, custom labels, packaging labels, sticker labels, barcode labels',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Barcode ready', 1),
    (gen_random_uuid(), v_service_id, 'Water resistant options', 2),
    (gen_random_uuid(), v_service_id, 'Custom sizes and shapes', 3),
    (gen_random_uuid(), v_service_id, 'Multiple materials', 4),
    (gen_random_uuid(), v_service_id, 'Bulk rolls available', 5),
    (gen_random_uuid(), v_service_id, 'FDA compliant materials', 6),
    (gen_random_uuid(), v_service_id, 'Permanent or removable', 7),
    (gen_random_uuid(), v_service_id, 'Thermal transfer compatible', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Food & Beverage', 1),
    (gen_random_uuid(), v_service_id, 'Cosmetics', 2),
    (gen_random_uuid(), v_service_id, 'Candle Jars', 3),
    (gen_random_uuid(), v_service_id, 'Bottles', 4),
    (gen_random_uuid(), v_service_id, 'Product Packaging', 5),
    (gen_random_uuid(), v_service_id, 'Shipping Labels', 6),
    (gen_random_uuid(), v_service_id, 'Warning Labels', 7),
    (gen_random_uuid(), v_service_id, 'Brand Stickers', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create label artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Size/Shape', 'Choose dimensions', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Material', 'Select label material', 'Tag', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve design', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Print', 'Flexo or digital print', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Cut', 'Die-cut to shape', 'Scissors', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Paper, Vinyl, Clear, Kraft', 1),
    (gen_random_uuid(), v_service_id, 'Adhesive', 'Permanent, Removable', 2),
    (gen_random_uuid(), v_service_id, 'Finishes', 'Matte, Gloss, White', 3),
    (gen_random_uuid(), v_service_id, 'Application', 'Hand or machine apply', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'White Paper', 1),
    (gen_random_uuid(), v_service_id, 'Kraft Paper', 2),
    (gen_random_uuid(), v_service_id, 'White Vinyl', 3),
    (gen_random_uuid(), v_service_id, 'Clear Vinyl', 4),
    (gen_random_uuid(), v_service_id, 'Silver Vinyl', 5),
    (gen_random_uuid(), v_service_id, 'Weatherproof Vinyl', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'EPS', 3),
    (gen_random_uuid(), v_service_id, 'CDR', 4),
    (gen_random_uuid(), v_service_id, 'PNG', 5),
    (gen_random_uuid(), v_service_id, 'JPG', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can you print barcodes on labels?', 'Yes! We can include barcodes, QR codes, and variable data on your labels. Perfect for retail products.', 1),
    (gen_random_uuid(), v_service_id, 'Are your labels food-safe?', 'Yes, we offer FDA-compliant materials suitable for food packaging and direct food contact where required.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 100 pieces or 1 roll for custom labels.', 3);

  RAISE NOTICE 'Product Labels seeded successfully';
END $$;

-- Frosted Glass
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-FROST-001',
    'Frosted Glass',
    'frosted',
    'Elegant frosted glass effects for privacy and style.',
    'Professional frosted glass application for windows, doors, partitions, and glassware. Creates elegant privacy while allowing light transmission. Choose from etched-look vinyl or true acid etching for permanent results. Perfect for offices, homes, and commercial spaces.',
    'Snowflake',
    'from-cyan-500',
    'to-blue-500',
    'Elegant',
    'stickers-labels',
    'ETB 300 - 2000',
    '1 sq meter',
    '2-3 days',
    false, false, true,
    16,
    'active',
    'Frosted Glass | Privacy Film & Etching Services',
    'Professional frosted glass applications for offices and homes. Custom patterns, logos, and privacy solutions.',
    'frosted glass, privacy film, glass etching, window film, office partitions',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Privacy solution', 1),
    (gen_random_uuid(), v_service_id, 'UV protection', 2),
    (gen_random_uuid(), v_service_id, 'Custom patterns', 3),
    (gen_random_uuid(), v_service_id, 'Easy application', 4),
    (gen_random_uuid(), v_service_id, 'Removable options', 5),
    (gen_random_uuid(), v_service_id, 'Durable finish', 6),
    (gen_random_uuid(), v_service_id, 'Logo integration', 7),
    (gen_random_uuid(), v_service_id, 'Various opacities', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Office Partitions', 1),
    (gen_random_uuid(), v_service_id, 'Conference Rooms', 2),
    (gen_random_uuid(), v_service_id, 'Shower Doors', 3),
    (gen_random_uuid(), v_service_id, 'Store Fronts', 4),
    (gen_random_uuid(), v_service_id, 'Windows', 5),
    (gen_random_uuid(), v_service_id, 'Glass Doors', 6),
    (gen_random_uuid(), v_service_id, 'Display Cases', 7),
    (gen_random_uuid(), v_service_id, 'Drinkware', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create pattern or logo', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Measure', 'Precise measurements', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Cut', 'Precision cutting', 'Scissors', 3),
    (gen_random_uuid(), v_service_id, 4, 'Apply', 'Professional installation', 'Sparkles', 4),
    (gen_random_uuid(), v_service_id, 5, 'Squeegee', 'Remove bubbles', 'Sparkles', 5),
    (gen_random_uuid(), v_service_id, 6, 'Finish', 'Perfect final look', 'Eye', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Vinyl Film, Etching Cream', 1),
    (gen_random_uuid(), v_service_id, 'Opacity', '10-90%', 2),
    (gen_random_uuid(), v_service_id, 'Application', 'Interior/Exterior', 3),
    (gen_random_uuid(), v_service_id, 'Durability', '5-10 years', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Frosted Vinyl', 1),
    (gen_random_uuid(), v_service_id, 'Clear Vinyl', 2),
    (gen_random_uuid(), v_service_id, 'Etching Cream', 3),
    (gen_random_uuid(), v_service_id, 'Sandblast Resist', 4),
    (gen_random_uuid(), v_service_id, 'Patterned Film', 5);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Is it permanent or removable?', 'We offer both! Vinyl film is removable and great for rentals. Acid etching is permanent for a lifetime solution.', 1),
    (gen_random_uuid(), v_service_id, 'Can you create custom patterns?', 'Absolutely! Any design, logo, or pattern can be created. From simple stripes to complex company logos.', 2),
    (gen_random_uuid(), v_service_id, 'How long does installation take?', 'Most installations are completed in 1-2 days depending on the size and complexity of the project.', 3);

  RAISE NOTICE 'Frosted Glass seeded successfully';
END $$;

-- =====================================================
-- 4. DRINKWARE SERVICES (2 services)
-- =====================================================

-- Mug Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-MUG-001',
    'Mug Printing',
    'mugs',
    'Custom printed mugs for gifts and promotions.',
    'Personalized ceramic mugs perfect for corporate gifts, events, and personal use. Full-color printing with sublimation technology for durable, dishwasher-safe results. Choose from standard white mugs or colored options with white printing areas.',
    'Coffee',
    'from-orange-500',
    'to-red-500',
    'Gift Idea',
    'drinkware',
    'ETB 120 - 350',
    '6 pieces',
    '3-4 days',
    false, true, true,
    17,
    'active',
    'Custom Mug Printing | Photo Gifts | Sublimation Printing',
    'Personalized ceramic mugs with photo-quality printing. Perfect for gifts, corporate events, and promotions.',
    'custom mugs, photo mugs, printed mugs, sublimation mugs, coffee mugs',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Full color printing', 1),
    (gen_random_uuid(), v_service_id, 'Dishwasher safe', 2),
    (gen_random_uuid(), v_service_id, 'Various sizes', 3),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Gift packaging', 6),
    (gen_random_uuid(), v_service_id, 'Photo quality prints', 7),
    (gen_random_uuid(), v_service_id, 'Magic mug options', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Gifts', 1),
    (gen_random_uuid(), v_service_id, 'Wedding Favors', 2),
    (gen_random_uuid(), v_service_id, 'Family Photos', 3),
    (gen_random_uuid(), v_service_id, 'Business Promotions', 4),
    (gen_random_uuid(), v_service_id, 'Thank You Gifts', 5),
    (gen_random_uuid(), v_service_id, 'Event Souvenirs', 6),
    (gen_random_uuid(), v_service_id, 'Holiday Gifts', 7),
    (gen_random_uuid(), v_service_id, 'Employee Recognition', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Choose Mug', 'Select size and color', 'Coffee', 1),
    (gen_random_uuid(), v_service_id, 2, 'Upload Design', 'Submit your artwork or photo', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Proof', 'Approve digital mockup', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Print', 'Sublimation printing', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Heat Press', 'Design permanently fused', 'Flame', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Gift boxed and shipped', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Sizes', '11oz, 15oz, Espresso', 1),
    (gen_random_uuid(), v_service_id, 'Material', 'Ceramic', 2),
    (gen_random_uuid(), v_service_id, 'Print Area', 'Full wrap', 3),
    (gen_random_uuid(), v_service_id, 'Care', 'Dishwasher safe', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'White Ceramic', 1),
    (gen_random_uuid(), v_service_id, 'Black Ceramic', 2),
    (gen_random_uuid(), v_service_id, 'Color Ceramic', 3),
    (gen_random_uuid(), v_service_id, 'Enamel', 4),
    (gen_random_uuid(), v_service_id, 'Travel Mugs', 5),
    (gen_random_uuid(), v_service_id, 'Magic Mugs', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'PNG', 1),
    (gen_random_uuid(), v_service_id, 'JPG', 2),
    (gen_random_uuid(), v_service_id, 'AI', 3),
    (gen_random_uuid(), v_service_id, 'PSD', 4),
    (gen_random_uuid(), v_service_id, 'PDF', 5),
    (gen_random_uuid(), v_service_id, 'EPS', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can I print photos on mugs?', 'Yes! Photo quality printing is our specialty. Send us your favorite photos and we''ll create beautiful, lasting memories on mugs.', 1),
    (gen_random_uuid(), v_service_id, 'Are the prints dishwasher safe?', 'Absolutely! Our sublimation prints become part of the mug coating and are completely dishwasher safe for years of use.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 6 pieces for custom mug printing.', 3);

  RAISE NOTICE 'Mug Printing seeded successfully';
END $$;

-- Bottle Printing
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-BOTTLE-001',
    'Bottle Printing',
    'bottles',
    'Custom printed water bottles, tumblers, and drinkware.',
    'Personalized stainless steel bottles, tumblers, and glassware. Perfect for corporate gifts, events, and eco-friendly promotions. Our durable printing lasts through daily use and washing. Choose from various styles including insulated bottles, wine glasses, and shot glasses.',
    'Wine',
    'from-blue-500',
    'to-indigo-500',
    'Eco',
    'drinkware',
    'ETB 250 - 800',
    '10 pieces',
    '4-5 days',
    false, false, true,
    18,
    'active',
    'Custom Bottle Printing | Stainless Steel & Glass Drinkware',
    'Personalized water bottles, tumblers, and glassware. Eco-friendly, durable printing for corporate gifts.',
    'custom bottles, printed water bottles, personalized tumblers, drinkware printing',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Stainless steel options', 1),
    (gen_random_uuid(), v_service_id, 'Glass available', 2),
    (gen_random_uuid(), v_service_id, 'Insulated styles', 3),
    (gen_random_uuid(), v_service_id, 'Dishwasher safe', 4),
    (gen_random_uuid(), v_service_id, 'Bulk discounts', 5),
    (gen_random_uuid(), v_service_id, 'Custom colors', 6),
    (gen_random_uuid(), v_service_id, 'Engraving available', 7),
    (gen_random_uuid(), v_service_id, 'Gift packaging', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Gifts', 1),
    (gen_random_uuid(), v_service_id, 'Eco-Friendly Promos', 2),
    (gen_random_uuid(), v_service_id, 'Wedding Favors', 3),
    (gen_random_uuid(), v_service_id, 'Sports Teams', 4),
    (gen_random_uuid(), v_service_id, 'Gym Promotions', 5),
    (gen_random_uuid(), v_service_id, 'Outdoor Events', 6),
    (gen_random_uuid(), v_service_id, 'Brand Merchandise', 7),
    (gen_random_uuid(), v_service_id, 'Thank You Gifts', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Select Bottle', 'Choose style and color', 'Wine', 1),
    (gen_random_uuid(), v_service_id, 2, 'Design', 'Upload your logo or artwork', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Proof', 'Approve digital mockup', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Print/Engrave', 'Apply your design', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Quality Check', 'Inspect each bottle', 'CheckCircle', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Gift box and ship', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Stainless Steel, Glass', 1),
    (gen_random_uuid(), v_service_id, 'Sizes', '12oz, 16oz, 20oz, 32oz', 2),
    (gen_random_uuid(), v_service_id, 'Print Method', 'Sublimation, Engraving', 3),
    (gen_random_uuid(), v_service_id, 'Insulation', 'Double-wall available', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Stainless Steel', 1),
    (gen_random_uuid(), v_service_id, 'Glass', 2),
    (gen_random_uuid(), v_service_id, 'Tritan Plastic', 3),
    (gen_random_uuid(), v_service_id, 'Aluminum', 4),
    (gen_random_uuid(), v_service_id, 'Copper-lined', 5),
    (gen_random_uuid(), v_service_id, 'Ceramic', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can you print on both stainless steel and glass?', 'Yes! We offer sublimation printing on stainless steel and ceramic coating on glass for durable, beautiful results on both materials.', 1),
    (gen_random_uuid(), v_service_id, 'How durable is the print?', 'Our prints are extremely durable and designed to last through daily use and dishwasher cycles without fading or peeling.', 2),
    (gen_random_uuid(), v_service_id, 'Do you offer bulk discounts?', 'Yes! Significant discounts available for orders of 50+ pieces. Contact us for custom quotes.', 3);

  RAISE NOTICE 'Bottle Printing seeded successfully';
END $$;

-- =====================================================
-- 5. PRINT & PROMO SERVICES (5 services)
-- =====================================================

-- Business Cards
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-CARDS-001',
    'Business Cards',
    'business-cards',
    'Premium business cards with various finishes.',
    'Make a lasting impression with our premium business cards. Choose from various paper stocks, finishes, and special effects like foil stamping and embossing. Your business card is often the first physical representation of your brand - make it count.',
    'FileText',
    'from-gray-500',
    'to-gray-700',
    'Essential',
    'print-promo',
    'ETB 250 - 800',
    '100 pieces',
    '2-3 days',
    true, true, false,
    19,
    'active',
    'Premium Business Cards | Custom Design & Printing',
    'High-quality custom business cards with foil stamping, embossing, spot UV. Make a lasting impression.',
    'business cards, custom business cards, premium business cards, foil stamping, embossing',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Premium paper stocks', 1),
    (gen_random_uuid(), v_service_id, 'Foil stamping options', 2),
    (gen_random_uuid(), v_service_id, 'Spot UV coating', 3),
    (gen_random_uuid(), v_service_id, 'Embossing and debossing', 4),
    (gen_random_uuid(), v_service_id, 'Rounded corners', 5),
    (gen_random_uuid(), v_service_id, 'Matching sets', 6),
    (gen_random_uuid(), v_service_id, 'Thick card stock', 7),
    (gen_random_uuid(), v_service_id, 'Matte or gloss finish', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Professionals', 1),
    (gen_random_uuid(), v_service_id, 'Small Business Owners', 2),
    (gen_random_uuid(), v_service_id, 'Freelancers', 3),
    (gen_random_uuid(), v_service_id, 'Real Estate Agents', 4),
    (gen_random_uuid(), v_service_id, 'Artists & Creatives', 5),
    (gen_random_uuid(), v_service_id, 'Networkers', 6),
    (gen_random_uuid(), v_service_id, 'Event Planners', 7),
    (gen_random_uuid(), v_service_id, 'Consultants', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create or upload design', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Paper Select', 'Choose paper stock', 'FileText', 2),
    (gen_random_uuid(), v_service_id, 3, 'Finishes', 'Select special effects', 'Sparkles', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve digital proof', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Print', 'Professional printing', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Cut', 'Precision cutting', 'Scissors', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Standard Size', '85mm x 55mm', 1),
    (gen_random_uuid(), v_service_id, 'Paper Weight', '300-400gsm', 2),
    (gen_random_uuid(), v_service_id, 'Finishes', 'Matte, Gloss, Silk', 3),
    (gen_random_uuid(), v_service_id, 'Special Effects', 'Foil, UV, Emboss', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Matte Cardstock', 1),
    (gen_random_uuid(), v_service_id, 'Gloss Cardstock', 2),
    (gen_random_uuid(), v_service_id, 'Recycled Paper', 3),
    (gen_random_uuid(), v_service_id, 'Kraft Paper', 4),
    (gen_random_uuid(), v_service_id, 'Plastic Cards', 5),
    (gen_random_uuid(), v_service_id, 'Soft-touch Laminate', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'PSD', 3),
    (gen_random_uuid(), v_service_id, 'INDD', 4),
    (gen_random_uuid(), v_service_id, 'EPS', 5),
    (gen_random_uuid(), v_service_id, 'JPG', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the best paper weight for business cards?', 'We recommend 350-400gsm for a premium, sturdy feel. 300gsm is also popular and slightly more flexible.', 1),
    (gen_random_uuid(), v_service_id, 'How long does foil stamping take?', 'Foil stamping adds 1-2 days to production time but creates an impressive, luxurious finish.', 2),
    (gen_random_uuid(), v_service_id, 'Can you match my brand colors?', 'Absolutely! We offer full-color CMYK printing and can match specific Pantone colors for spot color printing.', 3);

  RAISE NOTICE 'Business Cards seeded successfully';
END $$;

-- Flyers & Brochures
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-FLYER-001',
    'Flyers & Brochures',
    'flyers',
    'Marketing materials for your business promotions.',
    'Professional flyers and brochures for your marketing campaigns. Various sizes, folds, and paper options available. Perfect for product launches, events, and business promotions.',
    'FileText',
    'from-blue-500',
    'to-cyan-500',
    'Marketing',
    'print-promo',
    'ETB 300 - 2000',
    '50 pieces',
    '2-3 days',
    false, false, false,
    20,
    'active',
    'Flyer & Brochure Printing | Marketing Materials',
    'Professional flyer and brochure printing for your marketing campaigns. Various sizes and folds available.',
    'flyer printing, brochure printing, marketing materials, promotional flyers',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Multiple sizes available', 1),
    (gen_random_uuid(), v_service_id, 'Folding options', 2),
    (gen_random_uuid(), v_service_id, 'Glossy or matte finish', 3),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 4),
    (gen_random_uuid(), v_service_id, 'Design service included', 5),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 6),
    (gen_random_uuid(), v_service_id, 'High-quality printing', 7),
    (gen_random_uuid(), v_service_id, 'Eco-friendly paper options', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Product Catalogs', 1),
    (gen_random_uuid(), v_service_id, 'Event Programs', 2),
    (gen_random_uuid(), v_service_id, 'Restaurant Menus', 3),
    (gen_random_uuid(), v_service_id, 'Real Estate Flyers', 4),
    (gen_random_uuid(), v_service_id, 'Sale Promotions', 5),
    (gen_random_uuid(), v_service_id, 'Information Guides', 6),
    (gen_random_uuid(), v_service_id, 'Travel Brochures', 7),
    (gen_random_uuid(), v_service_id, 'Educational Materials', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create or submit design', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Size/Fold', 'Select format', 'Ruler', 2),
    (gen_random_uuid(), v_service_id, 3, 'Paper', 'Choose paper type', 'FileText', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve digital proof', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Print', 'Offset or digital printing', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Fold', 'Machine folding', 'Scissors', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Sizes', 'A5, A4, A3, DL, Custom', 1),
    (gen_random_uuid(), v_service_id, 'Folds', 'Half, Tri, Z, Gate, None', 2),
    (gen_random_uuid(), v_service_id, 'Paper', '100-300gsm', 3),
    (gen_random_uuid(), v_service_id, 'Pages', '1-32 pages', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Gloss Paper', 1),
    (gen_random_uuid(), v_service_id, 'Matte Paper', 2),
    (gen_random_uuid(), v_service_id, 'Recycled Paper', 3),
    (gen_random_uuid(), v_service_id, 'Kraft Paper', 4),
    (gen_random_uuid(), v_service_id, 'Textured Paper', 5),
    (gen_random_uuid(), v_service_id, 'Cardstock', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'INDD', 3),
    (gen_random_uuid(), v_service_id, 'PSD', 4),
    (gen_random_uuid(), v_service_id, 'JPG', 5),
    (gen_random_uuid(), v_service_id, 'EPS', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the most popular flyer size?', 'A5 (148 x 210mm) and A4 (210 x 297mm) are most popular for flyers. DL (99 x 210mm) is common for brochures.', 1),
    (gen_random_uuid(), v_service_id, 'Can you help with the design?', 'Yes! Our graphic designers can create professional flyers from your ideas or polish your existing design.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 50 pieces for flyers and brochures.', 3);

  RAISE NOTICE 'Flyers seeded successfully';
END $$;

-- Custom Packaging
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-PACK-001',
    'Custom Packaging',
    'packaging',
    'Custom boxes and packaging for your products.',
    'Elevate your brand with custom packaging solutions. From product boxes to shipping mailers, we create packaging that protects and promotes. Our packaging is designed to enhance unboxing experience and build brand loyalty.',
    'Package',
    'from-blue-500',
    'to-indigo-500',
    'Premium',
    'print-promo',
    'ETB 1000 - 10000',
    '100 pieces',
    '7-10 days',
    false, false, false,
    21,
    'active',
    'Custom Packaging | Product Boxes & Mailers',
    'Custom boxes and packaging solutions for your products. Enhance your brand with premium packaging.',
    'custom packaging, product boxes, gift boxes, branded packaging, shipping boxes',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Custom sizes and shapes', 1),
    (gen_random_uuid(), v_service_id, 'Full color printing', 2),
    (gen_random_uuid(), v_service_id, 'Various materials', 3),
    (gen_random_uuid(), v_service_id, 'Structural design', 4),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 5),
    (gen_random_uuid(), v_service_id, 'Eco-friendly options', 6),
    (gen_random_uuid(), v_service_id, 'Window cutouts', 7),
    (gen_random_uuid(), v_service_id, 'Foil stamping available', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Product Boxes', 1),
    (gen_random_uuid(), v_service_id, 'Gift Boxes', 2),
    (gen_random_uuid(), v_service_id, 'Shipping Boxes', 3),
    (gen_random_uuid(), v_service_id, 'Retail Packaging', 4),
    (gen_random_uuid(), v_service_id, 'Cosmetics Boxes', 5),
    (gen_random_uuid(), v_service_id, 'Food Packaging', 6),
    (gen_random_uuid(), v_service_id, 'Subscription Boxes', 7),
    (gen_random_uuid(), v_service_id, 'Display Boxes', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Consultation', 'Discuss product needs', 'MessageCircle', 1),
    (gen_random_uuid(), v_service_id, 2, 'Structural Design', 'Create box prototype', 'Package', 2),
    (gen_random_uuid(), v_service_id, 3, 'Graphic Design', 'Design box artwork', 'Palette', 3),
    (gen_random_uuid(), v_service_id, 4, 'Sample', 'Produce physical sample', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Production', 'Mass production', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Assembly', 'Fold and ship flat', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Cardboard, Kraft, Rigid', 1),
    (gen_random_uuid(), v_service_id, 'Printing', 'Offset, Digital, Flexo', 2),
    (gen_random_uuid(), v_service_id, 'Finishes', 'Matte, Gloss, Soft-touch', 3),
    (gen_random_uuid(), v_service_id, 'Minimum', '100-500 pieces', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Cardboard', 1),
    (gen_random_uuid(), v_service_id, 'Kraft Paper', 2),
    (gen_random_uuid(), v_service_id, 'Rigid Box Board', 3),
    (gen_random_uuid(), v_service_id, 'Corrugated', 4),
    (gen_random_uuid(), v_service_id, 'Magnetic Closure', 5),
    (gen_random_uuid(), v_service_id, 'Eco-friendly Materials', 6);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'CDR', 3),
    (gen_random_uuid(), v_service_id, 'INDD', 4),
    (gen_random_uuid(), v_service_id, 'CAD', 5),
    (gen_random_uuid(), v_service_id, 'EPS', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the minimum order for custom boxes?', 'Minimum orders vary by box type and complexity, typically starting at 100-500 pieces. Contact us for a quote.', 1),
    (gen_random_uuid(), v_service_id, 'Can you create a prototype?', 'Yes! We offer prototyping services to ensure your packaging looks and functions perfectly before mass production.', 2),
    (gen_random_uuid(), v_service_id, 'Do you offer eco-friendly options?', 'Yes! We offer recycled materials and sustainable packaging options for environmentally conscious brands.', 3);

  RAISE NOTICE 'Custom Packaging seeded successfully';
END $$;

-- Custom Pens
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-PENS-001',
    'Custom Pens',
    'pens',
    'Promotional pens with your logo.',
    'Classic promotional pens with your logo. Perfect for giveaways, trade shows, and everyday use. Various colors and styles available. Pens are one of the most cost-effective promotional items with the highest retention rate.',
    'Pen',
    'from-yellow-500',
    'to-orange-500',
    NULL,
    'print-promo',
    'ETB 10 - 50',
    '100 pieces',
    '5-7 days',
    false, false, false,
    22,
    'active',
    'Custom Promotional Pens | Printed Logo Pens',
    'Custom printed pens for promotional giveaways. Budget-friendly, various styles and colors.',
    'custom pens, promotional pens, printed pens, logo pens, giveaways',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Custom logo printing', 1),
    (gen_random_uuid(), v_service_id, 'Multiple colors available', 2),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 3),
    (gen_random_uuid(), v_service_id, 'Fast delivery', 4),
    (gen_random_uuid(), v_service_id, 'Various styles', 5),
    (gen_random_uuid(), v_service_id, 'Refillable options', 6),
    (gen_random_uuid(), v_service_id, 'Metal or plastic', 7),
    (gen_random_uuid(), v_service_id, 'Stylus tip available', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Trade Shows', 1),
    (gen_random_uuid(), v_service_id, 'Corporate Gifts', 2),
    (gen_random_uuid(), v_service_id, 'Bank Giveaways', 3),
    (gen_random_uuid(), v_service_id, 'Real Estate Agents', 4),
    (gen_random_uuid(), v_service_id, 'Doctor Offices', 5),
    (gen_random_uuid(), v_service_id, 'Schools', 6),
    (gen_random_uuid(), v_service_id, 'Business Conferences', 7),
    (gen_random_uuid(), v_service_id, 'Welcome Bags', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Select Pen', 'Choose style and color', 'Pen', 1),
    (gen_random_uuid(), v_service_id, 2, 'Submit Logo', 'Upload your artwork', 'Upload', 2),
    (gen_random_uuid(), v_service_id, 3, 'Proof', 'Approve digital mockup', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Print', 'Pad print or laser engrave', 'Printer', 4),
    (gen_random_uuid(), v_service_id, 5, 'Quality', 'Check each pen', 'CheckCircle', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Box or bulk pack', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Print Area', '1.5" x 0.5"', 1),
    (gen_random_uuid(), v_service_id, 'Colors', '1-4 spot colors', 2),
    (gen_random_uuid(), v_service_id, 'Ink Type', 'Ballpoint, Gel', 3),
    (gen_random_uuid(), v_service_id, 'Materials', 'Plastic, Metal', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Plastic', 1),
    (gen_random_uuid(), v_service_id, 'Metal', 2),
    (gen_random_uuid(), v_service_id, 'Aluminum', 3),
    (gen_random_uuid(), v_service_id, 'Brass', 4),
    (gen_random_uuid(), v_service_id, 'Eco-friendly Materials', 5),
    (gen_random_uuid(), v_service_id, 'Recycled Plastic', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the best pen for logo printing?', 'Metal pens with a larger barrel provide the best printing surface and feel more premium. Plastic pens are most cost-effective for large giveaways.', 1),
    (gen_random_uuid(), v_service_id, 'How long does imprinting take?', 'Standard imprinting takes 5-7 business days after proof approval. Rush service available.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 100 pieces for custom pens.', 3);

  RAISE NOTICE 'Custom Pens seeded successfully';
END $$;

-- Keychains
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-KEY-001',
    'Keychains',
    'keychains',
    'Custom keychains for lasting impressions.',
    'Custom keychains that keep your brand in sight every day. Various materials and designs available for promotional use. Perfect for giveaways, souvenirs, and corporate gifts that people will actually keep and use.',
    'Key',
    'from-purple-500',
    'to-pink-500',
    NULL,
    'print-promo',
    'ETB 50 - 300',
    '50 pieces',
    '4-6 days',
    false, false, false,
    23,
    'active',
    'Custom Keychains | Promotional Giveaways',
    'Personalized keychains in acrylic, metal, and leather. Perfect for corporate gifts and events.',
    'custom keychains, promotional keychains, logo keychains, acrylic keychains',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Custom shapes and designs', 1),
    (gen_random_uuid(), v_service_id, 'Multiple materials', 2),
    (gen_random_uuid(), v_service_id, 'Bulk pricing', 3),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 4),
    (gen_random_uuid(), v_service_id, 'Durable construction', 5),
    (gen_random_uuid(), v_service_id, 'Great giveaways', 6),
    (gen_random_uuid(), v_service_id, 'Photo quality prints', 7),
    (gen_random_uuid(), v_service_id, 'Split ring included', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Corporate Gifts', 1),
    (gen_random_uuid(), v_service_id, 'Event Souvenirs', 2),
    (gen_random_uuid(), v_service_id, 'Trade Show Giveaways', 3),
    (gen_random_uuid(), v_service_id, 'Wedding Favors', 4),
    (gen_random_uuid(), v_service_id, 'Brand Merchandise', 5),
    (gen_random_uuid(), v_service_id, 'Fundraising', 6),
    (gen_random_uuid(), v_service_id, 'Tourist Souvenirs', 7),
    (gen_random_uuid(), v_service_id, 'Welcome Bags', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create or upload artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Material', 'Choose material type', 'Package', 2),
    (gen_random_uuid(), v_service_id, 3, 'Size/Shape', 'Select dimensions', 'Ruler', 3),
    (gen_random_uuid(), v_service_id, 4, 'Proof', 'Approve design', 'Eye', 4),
    (gen_random_uuid(), v_service_id, 5, 'Production', 'Print, cut, assemble', 'Printer', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Bag or box', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Materials', 'Acrylic, Metal, Leather', 1),
    (gen_random_uuid(), v_service_id, 'Sizes', '1-4 inches', 2),
    (gen_random_uuid(), v_service_id, 'Print Method', 'UV Print, Laser Engrave', 3),
    (gen_random_uuid(), v_service_id, 'Attachment', 'Split ring, Ball chain', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Acrylic', 1),
    (gen_random_uuid(), v_service_id, 'Stainless Steel', 2),
    (gen_random_uuid(), v_service_id, 'Brass', 3),
    (gen_random_uuid(), v_service_id, 'Leather', 4),
    (gen_random_uuid(), v_service_id, 'Wood', 5),
    (gen_random_uuid(), v_service_id, 'Silicone', 6),
    (gen_random_uuid(), v_service_id, 'Plastic', 7),
    (gen_random_uuid(), v_service_id, 'Epoxy Resin', 8);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PNG', 2),
    (gen_random_uuid(), v_service_id, 'PDF', 3),
    (gen_random_uuid(), v_service_id, 'EPS', 4),
    (gen_random_uuid(), v_service_id, 'SVG', 5),
    (gen_random_uuid(), v_service_id, 'CDR', 6);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What is the most popular keychain material?', 'Acrylic is most popular for full-color printed designs. Metal is preferred for engraved, premium feel. Leather offers a classic, sophisticated look.', 1),
    (gen_random_uuid(), v_service_id, 'Can you make 3D or shaped keychains?', 'Yes! We can create custom shapes and even 3D molded keychains for unique promotional items.', 2),
    (gen_random_uuid(), v_service_id, 'What is the minimum order?', 'Minimum order is 50 pieces for custom keychains.', 3);

  RAISE NOTICE 'Keychains seeded successfully';
END $$;

-- =====================================================
-- 6. SPECIALTY SERVICES (2 services)
-- =====================================================

-- Laser Engraving
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-ENGRAVE-001',
    'Laser Engraving',
    'engraving',
    'Precision laser engraving on various materials.',
    'High-precision laser engraving on wood, acrylic, metal, glass, and leather. Perfect for trophies, awards, gifts, and personalized items. Our laser systems can create detailed designs, photos, and text with permanent results that will never fade or wear off.',
    'Flame',
    'from-gray-500',
    'to-gray-700',
    'Precision',
    'specialty',
    'ETB 150 - 1000',
    '1 piece',
    '2-3 days',
    false, false, true,
    24,
    'active',
    'Laser Engraving Services | Custom Engraved Gifts',
    'Professional laser engraving on wood, acrylic, metal, glass. Perfect for trophies, awards, and personalized gifts.',
    'laser engraving, custom engraving, engraved gifts, trophy engraving, wood engraving',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Multiple materials', 1),
    (gen_random_uuid(), v_service_id, 'High precision', 2),
    (gen_random_uuid(), v_service_id, 'Permanent marking', 3),
    (gen_random_uuid(), v_service_id, 'Photos possible', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Custom designs', 6),
    (gen_random_uuid(), v_service_id, 'No minimum', 7),
    (gen_random_uuid(), v_service_id, 'Vector and raster', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Trophies & Awards', 1),
    (gen_random_uuid(), v_service_id, 'Personalized Gifts', 2),
    (gen_random_uuid(), v_service_id, 'Nameplates', 3),
    (gen_random_uuid(), v_service_id, 'Jewelry', 4),
    (gen_random_uuid(), v_service_id, 'Corporate Gifts', 5),
    (gen_random_uuid(), v_service_id, 'Wedding Signs', 6),
    (gen_random_uuid(), v_service_id, 'Keychains', 7),
    (gen_random_uuid(), v_service_id, 'Leather Goods', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Design', 'Create or upload artwork', 'Palette', 1),
    (gen_random_uuid(), v_service_id, 2, 'Material Select', 'Choose your material', 'Package', 2),
    (gen_random_uuid(), v_service_id, 3, 'Test', 'Sample on similar material', 'Eye', 3),
    (gen_random_uuid(), v_service_id, 4, 'Engrave', 'Laser precision', 'Flame', 4),
    (gen_random_uuid(), v_service_id, 5, 'Clean', 'Remove residue', 'Sparkles', 5),
    (gen_random_uuid(), v_service_id, 6, 'Package', 'Ready for pickup/ship', 'Package', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Max Size', '24" x 36"', 1),
    (gen_random_uuid(), v_service_id, 'Resolution', '1200 DPI', 2),
    (gen_random_uuid(), v_service_id, 'Materials', 'Wood, Acrylic, Metal, Glass, Leather', 3),
    (gen_random_uuid(), v_service_id, 'Laser Type', 'CO2 & Fiber', 4);

  INSERT INTO service_materials (id, service_id, material, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Wood', 1),
    (gen_random_uuid(), v_service_id, 'Acrylic', 2),
    (gen_random_uuid(), v_service_id, 'Stainless Steel', 3),
    (gen_random_uuid(), v_service_id, 'Brass', 4),
    (gen_random_uuid(), v_service_id, 'Aluminum', 5),
    (gen_random_uuid(), v_service_id, 'Glass', 6),
    (gen_random_uuid(), v_service_id, 'Leather', 7),
    (gen_random_uuid(), v_service_id, 'Paper', 8),
    (gen_random_uuid(), v_service_id, 'Cork', 9),
    (gen_random_uuid(), v_service_id, 'Marble', 10);

  INSERT INTO service_formats (id, service_id, format, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'AI', 1),
    (gen_random_uuid(), v_service_id, 'PDF', 2),
    (gen_random_uuid(), v_service_id, 'SVG', 3),
    (gen_random_uuid(), v_service_id, 'DXF', 4),
    (gen_random_uuid(), v_service_id, 'JPG', 5),
    (gen_random_uuid(), v_service_id, 'PNG', 6),
    (gen_random_uuid(), v_service_id, 'BMP', 7);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Can you engrave photographs?', 'Yes! We can convert photos to detailed engravings on various materials. Best results on wood, acrylic, and coated metals.', 1),
    (gen_random_uuid(), v_service_id, 'How deep is the engraving?', 'Depth varies by material but typically 0.1-0.5mm for detailed work. Deeper engraving available for specific applications.', 2),
    (gen_random_uuid(), v_service_id, 'What materials can you engrave?', 'We engrave wood, acrylic, glass, leather, stainless steel, brass, aluminum, and many other materials.', 3);

  RAISE NOTICE 'Laser Engraving seeded successfully';
END $$;

-- Graphic Design
DO $$
DECLARE
  v_service_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35';
BEGIN
  INSERT INTO services (
    id, service_code, title, slug, short_description, full_description,
    icon_name, gradient_from, gradient_to, badge, category,
    price_range, min_order, turnaround, is_featured, is_popular, is_new,
    display_order, status, seo_title, seo_description, seo_keywords,
    created_at, updated_at
  ) VALUES (
    v_service_id,
    'SRV-DESIGN-001',
    'Graphic Design',
    'design',
    'Professional design services for all your needs.',
    'Our professional designers help bring your vision to life. From logos to complete branding packages, we provide creative solutions that stand out. Whether you need a new logo, print-ready files, or complete brand identity, we''ve got you covered.',
    'Palette',
    'from-orange-500',
    'to-red-500',
    'Creative',
    'specialty',
    'ETB 500 - 5000',
    '1 project',
    '2-5 days',
    false, false, true,
    25,
    'active',
    'Professional Graphic Design Services | Logo & Branding',
    'Expert graphic design services for logos, branding, marketing materials, and print-ready files.',
    'graphic design, logo design, branding, print design, marketing materials',
    NOW(), NOW()
  );

  INSERT INTO service_features (id, service_id, feature, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'Logo design', 1),
    (gen_random_uuid(), v_service_id, 'Brand identity packages', 2),
    (gen_random_uuid(), v_service_id, 'Print-ready file preparation', 3),
    (gen_random_uuid(), v_service_id, 'Revisions included', 4),
    (gen_random_uuid(), v_service_id, 'Fast turnaround', 5),
    (gen_random_uuid(), v_service_id, 'Commercial use rights', 6),
    (gen_random_uuid(), v_service_id, 'Vector formats', 7),
    (gen_random_uuid(), v_service_id, 'Social media graphics', 8);

  INSERT INTO service_applications (id, service_id, application, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'New Business Branding', 1),
    (gen_random_uuid(), v_service_id, 'Logo Creation', 2),
    (gen_random_uuid(), v_service_id, 'Marketing Materials', 3),
    (gen_random_uuid(), v_service_id, 'Social Media Graphics', 4),
    (gen_random_uuid(), v_service_id, 'Product Packaging', 5),
    (gen_random_uuid(), v_service_id, 'Website Graphics', 6),
    (gen_random_uuid(), v_service_id, 'Brochure Design', 7),
    (gen_random_uuid(), v_service_id, 'Business Cards', 8);

  INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order) VALUES
    (gen_random_uuid(), v_service_id, 1, 'Brief', 'Discuss your needs and ideas', 'MessageCircle', 1),
    (gen_random_uuid(), v_service_id, 2, 'Concepts', 'Receive initial design concepts', 'Palette', 2),
    (gen_random_uuid(), v_service_id, 3, 'Feedback', 'Share your feedback', 'MessageCircle', 3),
    (gen_random_uuid(), v_service_id, 4, 'Revisions', 'Refine chosen concept', 'Refresh', 4),
    (gen_random_uuid(), v_service_id, 5, 'Finalize', 'Prepare final files', 'CheckCircle', 5),
    (gen_random_uuid(), v_service_id, 6, 'Delivery', 'Receive all file formats', 'Download', 6);

  INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'File Types', 'AI, EPS, PDF, PNG, JPG', 1),
    (gen_random_uuid(), v_service_id, 'Revisions', '3 rounds included', 2),
    (gen_random_uuid(), v_service_id, 'Turnaround', '2-5 days', 3),
    (gen_random_uuid(), v_service_id, 'Formats', 'Vector & Raster', 4);

  INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES
    (gen_random_uuid(), v_service_id, 'What files will I receive?', 'You''ll receive all final files including vector (AI, EPS, PDF) for printing and raster (PNG, JPG) for web use, plus source files.', 1),
    (gen_random_uuid(), v_service_id, 'Do I own the rights to the design?', 'Yes! Upon final payment, you receive full commercial rights to use the designs for your business.', 2),
    (gen_random_uuid(), v_service_id, 'How many revisions are included?', 'We include 3 rounds of revisions to ensure you''re completely satisfied with the final design.', 3);

  RAISE NOTICE 'Graphic Design seeded successfully';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check total services inserted (should be 25)
SELECT COUNT(*) as total_services FROM services;

-- Check total categories (should be 6)
SELECT COUNT(*) as total_categories FROM service_categories;

-- List all categories with their colors and service counts
SELECT 
  c.name,
  c.slug,
  c.color,
  COUNT(s.id) as service_count
FROM service_categories c
LEFT JOIN services s ON s.category = c.slug AND s.status = 'active'
GROUP BY c.id, c.name, c.slug, c.color
ORDER BY c.display_order;

-- Show services grouped by category (like frontend)
SELECT 
  c.name as category_name,
  c.color,
  c.slug as category_slug,
  json_agg(json_build_object(
    'title', s.title,
    'slug', s.slug,
    'badge', s.badge,
    'short_description', s.short_description,
    'icon_name', s.icon_name,
    'price_range', s.price_range,
    'is_featured', s.is_featured,
    'is_popular', s.is_popular,
    'is_new', s.is_new
  ) ORDER BY s.display_order) as services
FROM service_categories c
LEFT JOIN services s ON s.category = c.slug AND s.status = 'active'
GROUP BY c.id, c.name, c.color, c.slug, c.display_order
ORDER BY c.display_order;