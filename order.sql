CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,              -- የትዕዛዝ ቁጥር
    customer_internal_id INTEGER REFERENCES customers(id), 
    status TEXT DEFAULT 'pending',      -- pending, priced, completed, cancelled
    total_price DECIMAL(10,2) DEFAULT 0, -- ጠቅላላ ዋጋ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- የታዘዘበት ሰዓት
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,              -- የሲስተሙ የደንበኛ መለያ ቁጥር
    telegram_id BIGINT UNIQUE NOT NULL, -- የቴሌግራም መለያ (አይቀየርም)
    full_name TEXT,                     -- ደንበኛው በቴሌግራም የተጠቀመው ስም
    phone_number TEXT,                  -- ለወደፊት ስልካቸውን ለመቀበል
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, -- ከ orders ጋር ያገናኘዋል
    file_name TEXT NOT NULL,            -- የፋይሉ ስም
    file_id TEXT,                       -- የቴሌግራም ፋይል መለያ (ለትንንሽ ፋይሎች)
    delivery_method TEXT,               -- 'bot' (ትንሽ ከሆነ) ወይም 'direct' (ትልቅ ከሆነ)
    file_size_mb DECIMAL(10,2),         -- የፋይሉ መጠን በ MB
    price DECIMAL(10,2) DEFAULT 0,      -- የዚህ ፋይል ዋጋ (ሪሴፕሽኑ የሚሞላው)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- telegram_id ልዩ (Unique) መሆኑን ማረጋገጫ
ALTER TABLE customers ADD CONSTRAINT unique_telegram_id UNIQUE (telegram_id);