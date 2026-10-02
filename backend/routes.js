const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./database');

const router = express.Router();

// Helper to generate order numbers
function generateOrderNumber() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `#AK${randNum}`;
}

// 1a. User Authentication: Register
router.post('/auth/register', async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone number are required' });
  }
  
  const userId = uuidv4();
  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ error: 'Phone number already registered. Please login.' });
    }
    
    const result = await pool.query(
      'INSERT INTO users (id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, phone, email || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1b. User Authentication: Login
router.post('/auth/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found. Please register first.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1. Get Menu (supports active filter for front-end mobile app)
router.get('/menu', async (req, res) => {
  const { active } = req.query;
  try {
    let query = 'SELECT * FROM menu_items ORDER BY category, name';
    if (active === 'true') {
      query = 'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name';
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1b. Toggle Menu Item Availability (CRM)
router.put('/menu/:id/availability', async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET is_available = $1 WHERE id = $2 RETURNING *',
      [isAvailable, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1c. Update Menu Item Price (CRM)
router.put('/menu/:id/price', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET price = $1 WHERE id = $2 RETURNING *',
      [price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1d. Get All Orders (for CRM Dashboard)
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows;
    
    for (let order of orders) {
      const itemsResult = await pool.query(
        `SELECT oi.*, mi.name, mi.image, mi.subtitle
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      
      order.items = itemsResult.rows.map(row => ({
        item: {
          id: row.menu_item_id,
          name: row.name,
          price: parseFloat(row.price),
          image: row.image,
          subtitle: row.subtitle
        },
        quantity: row.quantity,
        specialNotes: row.special_notes
      }));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Fetch or Create User Profile
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      // If user doesn't exist, create a mock user for demo/convenience
      const newUser = await pool.query(
        'INSERT INTO users (id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, 'Guest User', '9999999999', 'guest@ammakitchen.com']
      );
      return res.json(newUser.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching/creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Get User Addresses
router.get('/users/:id/addresses', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM addresses WHERE user_id = $1', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Save Address
router.post('/users/:id/addresses', async (req, res) => {
  const { id } = req.params;
  const { label, addressLine, isDefault } = req.body;
  const addressId = uuidv4();
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    if (isDefault) {
      // Set all other addresses for this user to is_default = false
      await client.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [id]);
    }
    
    const result = await client.query(
      `INSERT INTO addresses (id, user_id, label, address_line, is_default)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [addressId, id, label, addressLine, isDefault || false]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving address:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// 5. Place Order
router.post('/orders', async (req, res) => {
  const { userId, items, subtotal, deliveryFee, packagingFee, total, deliveryAddress, paymentMethod, notes, paymentStatus } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const orderId = uuidv4();
  const orderNumber = generateOrderNumber();
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if user exists, if not create them
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      await client.query('INSERT INTO users (id, name, phone) VALUES ($1, $2, $3)', [userId, 'Ganesh Ram', '8667519735']);
    }
    
    // Insert order
    const orderResult = await client.query(
      `INSERT INTO orders (id, order_number, user_id, subtotal, delivery_fee, packaging_fee, total, status, delivery_address, payment_method, notes, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [orderId, orderNumber, userId, subtotal, deliveryFee, packagingFee, total, 'Received', deliveryAddress, paymentMethod, notes || '', paymentStatus || 'Pending']
    );
    
    // Insert items
    for (const cartItem of items) {
      const orderItemId = uuidv4();
      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, special_notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderItemId, orderId, cartItem.item.id, cartItem.quantity, cartItem.item.price, cartItem.specialNotes || '']
      );
    }
    
    await client.query('COMMIT');
    
    const placedOrder = orderResult.rows[0];
    placedOrder.items = items;
    
    // Emit real-time order placement WebSocket alert to listening clients/admin
    if (req.io) {
      req.io.emit('new_order', placedOrder);
    }
    
    res.json(placedOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// 6. Get Order Details & Status
router.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get Order
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get Order Items
    const itemsResult = await pool.query(
      `SELECT oi.*, mi.name, mi.image, mi.subtitle
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [id]
    );
    
    // Format into front-end CartItem interface
    order.items = itemsResult.rows.map(row => ({
      item: {
        id: row.menu_item_id,
        name: row.name,
        price: parseFloat(row.price),
        image: row.image,
        subtitle: row.subtitle
      },
      quantity: row.quantity,
      specialNotes: row.special_notes
    }));
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Update Order Status (Admin/Kitchen Console)
router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Preparing', 'Out for Delivery', 'Delivered'
  
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const updatedOrder = result.rows[0];
    
    // Emit real-time update event so user's phone updates immediately
    if (req.io) {
      req.io.emit(`order_status_${id}`, { status });
      req.io.emit(`order_status_update`, { id, status });
    }
    
    if (status === 'Out for Delivery') {
      const startSim = req.app.get('startDeliverySimulation');
      if (startSim) {
        startSim(id);
      }
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7b. Assign Rider to Order (CRM)
router.put('/orders/:id/rider', async (req, res) => {
  const { id } = req.params;
  const { riderName, riderPhone } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE orders 
       SET rider_name = $1, rider_phone = $2, status = 'Out for Delivery' 
       WHERE id = $3 RETURNING *`,
      [riderName, riderPhone, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const updatedOrder = result.rows[0];
    
    // Emit real-time status & rider details to client app
    if (req.io) {
      req.io.emit(`order_status_${id}`, { 
        status: 'Out for Delivery', 
        rider_name: riderName, 
        rider_phone: riderPhone 
      });
      req.io.emit(`order_status_update`, { 
        id, 
        status: 'Out for Delivery',
        rider_name: riderName, 
        rider_phone: riderPhone 
      });
    }
    
    const startSim = req.app.get('startDeliverySimulation');
    if (startSim) {
      startSim(id);
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error assigning rider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7c. Update Payment Status (CRM/Razorpay webhook)
router.put('/orders/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
      [paymentStatus, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. Get User Order History
router.get('/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const orders = result.rows;
    
    // Attach items to each order
    for (let order of orders) {
      const itemsResult = await pool.query(
        `SELECT oi.*, mi.name, mi.image, mi.subtitle
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      
      order.items = itemsResult.rows.map(row => ({
        item: {
          id: row.menu_item_id,
          name: row.name,
          price: parseFloat(row.price),
          image: row.image,
          subtitle: row.subtitle
        },
        quantity: row.quantity,
        specialNotes: row.special_notes
      }));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// STARTUP FEATURE SET: NEW API ROUTES
// ==========================================

// 1. ELDER CARE PROFILES
// Get all profiles for a user
router.get('/users/:userId/elder-profiles', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM user_elder_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching elder profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create an elder care profile
router.post('/users/:userId/elder-profiles', async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, dietary_restriction, delivery_notes } = req.body;
  if (!name || !phone || !address) {
    return res.status(400).json({ error: 'Name, Phone, and Address are required' });
  }
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO user_elder_profiles (id, user_id, name, phone, address, dietary_restriction, delivery_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, userId, name, phone, address, dietary_restriction || 'none', delivery_notes || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating elder profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an elder care profile
router.delete('/users/:userId/elder-profiles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM user_elder_profiles WHERE id = $1', [id]);
    res.json({ success: true, message: 'Elder profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting elder profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 2. SUBSCRIPTION MEAL PLANNER
// Get meal planner data for a user
router.get('/users/:userId/meal-planner', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT ump.*, mi.name as dish_name, mi.image as dish_image, mi.category as dish_category
       FROM user_meal_planner ump
       LEFT JOIN menu_items mi ON ump.menu_item_id = mi.id
       WHERE ump.user_id = $1
       ORDER BY ump.plan_date ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching meal planner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Swap / Schedule a meal
router.post('/users/:userId/meal-planner/swap', async (req, res) => {
  const { userId } = req.params;
  const { date, slot, menuItemId } = req.body;
  if (!date || !slot) {
    return res.status(400).json({ error: 'Date and slot are required' });
  }
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO user_meal_planner (id, user_id, plan_date, meal_slot, menu_item_id, status)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled')
       ON CONFLICT (user_id, plan_date, meal_slot) 
       DO UPDATE SET menu_item_id = EXCLUDED.menu_item_id, status = 'Scheduled'
       RETURNING *`,
      [id, userId, date, slot, menuItemId || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error swapping/scheduling meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Skip a scheduled meal day/slot
router.post('/users/:userId/meal-planner/skip', async (req, res) => {
  const { userId } = req.params;
  const { date, slot } = req.body;
  if (!date || !slot) {
    return res.status(400).json({ error: 'Date and slot are required' });
  }
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO user_meal_planner (id, user_id, plan_date, meal_slot, status)
       VALUES ($1, $2, $3, $4, 'Skipped')
       ON CONFLICT (user_id, plan_date, meal_slot)
       DO UPDATE SET status = 'Skipped'
       RETURNING *`,
      [id, userId, date, slot]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error skipping meal slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 3. LOYALTY & DONATION PROGRAM
// Get user points balance and donation counts
router.get('/users/:userId/loyalty', async (req, res) => {
  const { userId } = req.params;
  try {
    let result = await pool.query('SELECT * FROM user_loyalty_points WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      // Lazy initialize points record if it doesn't exist
      const initResult = await pool.query(
        'INSERT INTO user_loyalty_points (user_id, points_balance, meals_donated) VALUES ($1, 0, 0) RETURNING *',
        [userId]
      );
      return res.json(initResult.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Donate a meal (reduces points by e.g. 100 or costs money)
router.post('/users/:userId/loyalty/donate', async (req, res) => {
  const { userId } = req.params;
  const { pointsToUse, donationCount } = req.body; // e.g. use points or direct cash donation
  try {
    let result;
    if (pointsToUse && pointsToUse > 0) {
      // Check current points
      const checkResult = await pool.query('SELECT points_balance FROM user_loyalty_points WHERE user_id = $1', [userId]);
      const currentPoints = checkResult.rows[0] ? checkResult.rows[0].points_balance : 0;
      if (currentPoints < pointsToUse) {
        return res.status(400).json({ error: 'Insufficient points balance' });
      }
      
      result = await pool.query(
        `UPDATE user_loyalty_points 
         SET points_balance = points_balance - $1, 
             meals_donated = meals_donated + $2
         WHERE user_id = $3 RETURNING *`,
        [pointsToUse, donationCount || 1, userId]
      );
    } else {
      // Cash/card mock donation increment
      result = await pool.query(
        `UPDATE user_loyalty_points 
         SET meals_donated = meals_donated + $1,
             points_balance = points_balance + ($1 * 10) -- Earn bonus points for donating!
         WHERE user_id = $2 RETURNING *`,
        [donationCount || 1, userId]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error processing meal donation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Award points manually (e.g. after ordering, mock utility)
router.post('/users/:userId/loyalty/add-points', async (req, res) => {
  const { userId } = req.params;
  const { points } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_loyalty_points (user_id, points_balance, meals_donated)
       VALUES ($1, $2, 0)
       ON CONFLICT (user_id) 
       DO UPDATE SET points_balance = user_loyalty_points.points_balance + EXCLUDED.points_balance
       RETURNING *`,
      [userId, points || 15]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 4. HOMESTYLE NUTRITION TRACKER
// Get nutrition summary based on orders
router.get('/nutrition/summary/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT oi.quantity, mi.calories, mi.is_veg, mi.category
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.user_id = $1 AND o.created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const orderedItems = result.rows;
    let totalCalories = 0;
    let totalMealsOrdered = orderedItems.length;
    let vegMealsCount = 0;
    let nonVegMealsCount = 0;

    orderedItems.forEach(item => {
      const calString = item.calories || '300 kcal';
      const calVal = parseInt(calString.replace(/[^0-9]/g, '')) || 300;
      totalCalories += (calVal * item.quantity);

      if (item.is_veg) {
        vegMealsCount += item.quantity;
      } else {
        nonVegMealsCount += item.quantity;
      }
    });

    const totalProtein = Math.round((totalCalories * 0.20) / 4);
    const totalCarbs = Math.round((totalCalories * 0.55) / 4);
    const totalFats = Math.round((totalCalories * 0.25) / 9);

    res.json({
      totalCalories,
      totalMealsOrdered,
      vegMealsCount,
      nonVegMealsCount,
      macros: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFats
      },
      averageDailyCalories: Math.round(totalCalories / 30) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 12. CRM Unified endpoints for combined Admin Console
router.get('/crm/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, COALESCE(l.points_balance, 0) as points_balance 
       FROM users u
       LEFT JOIN user_loyalty_points l ON u.id = l.user_id
       ORDER BY u.name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CRM users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/crm/elder-profiles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as sponsor_name 
       FROM user_elder_profiles e
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CRM elder profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/crm/stats', async (req, res) => {
  try {
    const salesResult = await pool.query(
      "SELECT COALESCE(SUM(total), 0) as total_sales, COUNT(id) as total_orders FROM orders WHERE status = 'Delivered'"
    );
    const usersResult = await pool.query("SELECT COUNT(id) as total_users FROM users");
    const donationResult = await pool.query("SELECT COALESCE(SUM(meals_donated), 0) as total_donations FROM user_loyalty_points");
    const subResult = await pool.query("SELECT COUNT(DISTINCT user_id) as total_subs FROM user_meal_planner");

    res.json({
      totalSales: parseFloat(salesResult.rows[0].total_sales),
      totalOrders: parseInt(salesResult.rows[0].total_orders),
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalDonations: parseInt(donationResult.rows[0].total_donations),
      totalSubscriptions: parseInt(subResult.rows[0].total_subs)
    });
  } catch (error) {
    console.error('Error fetching CRM stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW PREMIUM APIs ---

// 1. Create a new menu item
router.post('/menu', async (req, res) => {
  const { id, name, subtitle, price, original_price, rating, review_count, description, long_description, category, sub_category, is_veg, is_popular, prep_time, serving_size, calories, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, Price, and Category are required' });
  }
  const itemId = id || 'ak-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  try {
    const result = await pool.query(
      `INSERT INTO menu_items (
        id, name, subtitle, price, original_price, rating, review_count, 
        description, long_description, category, sub_category, is_veg, is_popular, 
        prep_time, serving_size, calories, image, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE)
      RETURNING *`,
      [itemId, name, subtitle || '', price, original_price || null, rating || 5.0, review_count || 0, description || '', long_description || '', category, sub_category || null, is_veg !== false, is_popular || false, prep_time || '', serving_size || '', calories || '', image || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Edit details of an existing menu item
router.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subtitle, price, original_price, description, long_description, category, sub_category, is_veg, is_popular, prep_time, serving_size, calories, image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE menu_items SET
        name = COALESCE($1, name),
        subtitle = COALESCE($2, subtitle),
        price = COALESCE($3, price),
        original_price = $4,
        description = COALESCE($5, description),
        long_description = COALESCE($6, long_description),
        category = COALESCE($7, category),
        sub_category = $8,
        is_veg = COALESCE($9, is_veg),
        is_popular = COALESCE($10, is_popular),
        prep_time = COALESCE($11, prep_time),
        serving_size = COALESCE($12, serving_size),
        calories = COALESCE($13, calories),
        image = COALESCE($14, image)
      WHERE id = $15 RETURNING *`,
      [name, subtitle, price, original_price, description, long_description, category, sub_category, is_veg, is_popular, prep_time, serving_size, calories, image, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Fetch all coupons
router.get('/coupons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Validate coupon code
router.get('/coupons/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE', [code.toUpperCase()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Create a new coupon
router.post('/coupons', async (req, res) => {
  const { code, discountValue, discountType } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Coupon code and discount value are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO coupons (code, discount_value, discount_type, is_active)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (code) DO UPDATE SET 
         discount_value = EXCLUDED.discount_value,
         discount_type = EXCLUDED.discount_type,
         is_active = TRUE
       RETURNING *`,
      [code.toUpperCase(), discountValue, discountType || 'fixed']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Toggle coupon status
router.put('/coupons/:code/status', async (req, res) => {
  const { code } = req.params;
  const { isActive } = req.body;
  try {
    const result = await pool.query(
      'UPDATE coupons SET is_active = $1 WHERE code = $2 RETURNING *',
      [isActive, code.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating coupon status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Edit elder care profile diet details
router.put('/crm/elder-profiles/:id/diet', async (req, res) => {
  const { id } = req.params;
  const { dietaryRestriction, deliveryNotes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE user_elder_profiles SET
        dietary_restriction = COALESCE($1, dietary_restriction),
        delivery_notes = COALESCE($2, delivery_notes)
      WHERE id = $3 RETURNING *`,
      [dietaryRestriction, deliveryNotes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elder profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating elder care profile diet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. Simulate sending a customized WhatsApp/SMS notification
router.post('/crm/send-alert', async (req, res) => {
  const { phone, customerName, message, type } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }
  
  try {
    console.log(`[ALERT BROADCAST] Sent ${type || 'WhatsApp'} to ${customerName || 'Customer'} (${phone}): "${message}"`);
    
    // Broadcast live event via Socket.io
    if (req.io) {
      req.io.emit('crm_notification_sent', {
        phone,
        customerName: customerName || 'Customer',
        message,
        timestamp: new Date()
      });
    }
    
    res.json({ success: true, message: 'Notification broadcast simulation complete.' });
  } catch (error) {
    console.error('Error sending alert simulation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
