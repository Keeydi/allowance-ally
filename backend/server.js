/**
 * Allowance Ally Backend API Server
 * Optimized version with middleware and utilities
 */

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'allowance_ally',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || '2788586556239fc3edf9bee4a806f67e';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.error('Please check your .env file and MySQL server');
  });

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract YouTube video ID from URL
 */
const extractYouTubeVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
};

/**
 * Generate YouTube embed URL and thumbnail from video URL
 */
const processYouTubeUrl = (videoUrl) => {
  const videoId = extractYouTubeVideoId(videoUrl);
  return {
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl,
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
  };
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Format date to relative string (Today, Yesterday, X days ago, etc.)
 */
const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expenseDate = new Date(date);
  expenseDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - expenseDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Send error response
 */
const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

/**
 * Recalculate and update budget spent amounts based on expenses for current period
 */
const updateBudgetSpent = async (userId) => {
  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [userId]
  );

  if (budgets.length === 0) return;

  const budget = budgets[0];
  const periodType = budget.period_type || 'monthly';
  const today = formatDate(new Date());

  // Determine the start date of the current period
  let periodStartDate;
  if (periodType === 'daily') {
    periodStartDate = today;
  } else if (periodType === 'weekly') {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    periodStartDate = formatDate(startOfWeek);
  } else { // monthly
    const now = new Date();
    periodStartDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  // Get expenses for current period only
  const [expenses] = await pool.execute(
    `SELECT category, SUM(amount) as total 
     FROM expenses 
     WHERE user_id = ? AND date >= ?
     GROUP BY category`,
    [userId, periodStartDate]
  );

  let needsSpent = 0;
  let wantsSpent = 0;
  let savingsSpent = 0;

  expenses.forEach(exp => {
    const cat = exp.category.toLowerCase();
    if (cat === 'food' || cat === 'transportation' || cat === 'school') {
      needsSpent += parseFloat(exp.total);
    } else if (cat === 'wants' || cat === 'others') {
      wantsSpent += parseFloat(exp.total);
    } else if (cat === 'savings') {
      savingsSpent += parseFloat(exp.total);
    }
  });

  await pool.execute(
    'UPDATE budgets SET needs_spent = ?, wants_spent = ?, savings_spent = ? WHERE user_id = ?',
    [needsSpent, wantsSpent, savingsSpent, userId]
  );
};

/**
 * Handle daily budget reset and carryover
 * For daily budgets, leftover amount from previous day is added to today's budget
 */
const handleBudgetPeriodReset = async (userId) => {
  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [userId]
  );

  if (budgets.length === 0) return;

  const budget = budgets[0];
  const periodType = budget.period_type || 'monthly';
  const today = formatDate(new Date());
  const lastResetDate = budget.last_reset_date ? formatDate(budget.last_reset_date) : null;
  const currentCarryover = parseFloat(budget.carryover_amount || 0);

  // Only handle reset for daily budgets
  if (periodType === 'daily' && lastResetDate !== today) {
    // Calculate leftover from previous day
    // Available budget = base allowance + previous carryover
    const totalSpent = parseFloat(budget.needs_spent || 0) + 
                      parseFloat(budget.wants_spent || 0) + 
                      parseFloat(budget.savings_spent || 0);
    const totalAllowance = parseFloat(budget.total_allowance || 0);
    const availableBudget = totalAllowance + currentCarryover;
    const leftover = Math.max(0, availableBudget - totalSpent);
    
    // New carryover = leftover from last day (carryover is already included in availableBudget)
    const newCarryover = leftover;

    // Reset spent amounts for new day
    await pool.execute(
      `UPDATE budgets 
       SET needs_spent = 0, 
           wants_spent = 0, 
           savings_spent = 0,
           carryover_amount = ?,
           last_reset_date = ?
       WHERE user_id = ?`,
      [newCarryover, today, userId]
    );

    // Recalculate spent amounts for today
    await updateBudgetSpent(userId);
  } else if (periodType !== 'daily' && lastResetDate !== today) {
    // For weekly/monthly, just update the reset date (no carryover)
    await pool.execute(
      'UPDATE budgets SET last_reset_date = ? WHERE user_id = ?',
      [today, userId]
    );
  }
};

// ============================================================================
// SUPABASE HELPERS
// ============================================================================

/**
 * Verify Supabase JWT and return payload (sub, email, user_metadata) or null
 */
const verifySupabaseToken = (token) => {
  if (!SUPABASE_JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ['HS256'] });
    return {
      sub: decoded.sub,
      email: decoded.email || '',
      user_metadata: decoded.user_metadata || {}
    };
  } catch {
    return null;
  }
};

/**
 * Find or create MySQL user from Supabase JWT payload; returns user row or null
 */
const findOrCreateUserFromSupabase = async (payload) => {
  const { sub, email, user_metadata } = payload;
  const firstName = user_metadata.first_name || null;
  const lastName = user_metadata.last_name || null;

  const [existing] = await pool.execute(
    'SELECT id, email, role, first_name, last_name FROM users WHERE supabase_id = ? AND is_active = TRUE',
    [sub]
  );

  if (existing.length > 0) {
    return existing[0];
  }

  const [insertResult] = await pool.execute(
    'INSERT INTO users (supabase_id, email, password, role, first_name, last_name) VALUES (?, ?, NULL, 0, ?, ?)',
    [sub, email, firstName, lastName]
  );

  const [newUser] = await pool.execute(
    'SELECT id, email, role, first_name, last_name FROM users WHERE id = ?',
    [insertResult.insertId]
  );
  return newUser[0] || null;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Verify JWT token (our JWT or Supabase JWT) and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Try our own JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const [users] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ? AND is_active = TRUE',
        [decoded.id]
      );
      if (users.length > 0) {
        req.user = users[0];
        return next();
      }
    } catch (_) {}

    // Try Supabase JWT
    const supabasePayload = verifySupabaseToken(token);
    if (supabasePayload) {
      const user = await findOrCreateUserFromSupabase(supabasePayload);
      if (user) {
        req.user = { id: user.id, role: user.role };
        return next();
      }
    }

    return sendError(res, 401, 'Invalid or expired token');
  } catch (error) {
    console.error('Token verification error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * Verify admin access
 */
const verifyAdmin = async (req, res, next) => {
  if (req.user.role !== 1) {
    return sendError(res, 403, 'Admin access required');
  }
  next();
};

/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Request error:', error);
      sendError(res, 500, 'Internal server error');
    });
  };
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  const [users] = await pool.execute(
    'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = ? AND is_active = TRUE',
    [email]
  );

  if (users.length === 0) {
    return sendError(res, 401, 'Invalid email or password');
  }

  const user = users[0];
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return sendError(res, 401, 'Invalid email or password');
  }

  await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  const token = generateToken(user);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    },
    token
  });
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters');
  }

  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return sendError(res, 409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, 0, ?, ?)',
    [email, hashedPassword, first_name || null, last_name || null]
  );

  const token = generateToken({ id: result.insertId, email, role: 0 });

  res.status(201).json({
    success: true,
    user: {
      id: result.insertId,
      email,
      role: 0,
      first_name: first_name || null,
      last_name: last_name || null
    },
    token
  });
}));

app.get('/api/auth/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  const token = authHeader.substring(7);

  // Try our JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.id]
    );
    if (users.length > 0) {
      return res.json({ valid: true, user: users[0] });
    }
  } catch (_) {}

  // Try Supabase JWT
  const supabasePayload = verifySupabaseToken(token);
  if (supabasePayload) {
    const user = await findOrCreateUserFromSupabase(supabasePayload);
    if (user) {
      return res.json({ valid: true, user });
    }
  }

  return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
}));

/**
 * GET /api/auth/me - Return current app user (used after Supabase login to sync to MySQL)
 * Accepts Bearer token (Supabase access_token or our JWT). Creates MySQL user on first Supabase login.
 */
app.get('/api/auth/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.substring(7);

  // Try our JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.id]
    );
    if (users.length > 0) {
      return res.json({ user: users[0] });
    }
  } catch (_) {}

  // Try Supabase JWT and find or create user
  const supabasePayload = verifySupabaseToken(token);
  if (!supabasePayload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const user = await findOrCreateUserFromSupabase(supabasePayload);
  if (!user) {
    return res.status(500).json({ message: 'Failed to sync user' });
  }
  res.json({ user });
}));

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/api/admin/users', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const [allUsers] = await pool.execute(
    `SELECT id, email, role, first_name, last_name, created_at, last_login, is_active 
     FROM users 
     ORDER BY created_at DESC`
  );

  const formattedUsers = allUsers.map(user => ({
    id: user.id,
    name: user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.first_name || user.last_name || 'N/A',
    email: user.email,
    status: user.is_active ? 'Active' : 'Inactive',
    joined: formatDate(user.created_at),
    savings: '₱0',
    role: user.role,
    last_login: user.last_login ? formatDate(user.last_login) : null
  }));

  res.json({ success: true, users: formattedUsers, count: formattedUsers.length });
}));

app.get('/api/admin/video-tips', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const [videos] = await pool.execute(
    `SELECT id, title, description, video_url as videoUrl, thumbnail_url as thumbnail, 
            category, created_at as createdAt, is_active
     FROM video_tips 
     ORDER BY created_at DESC`
  );

  const formattedVideos = videos.map(video => ({
    id: video.id.toString(),
    title: video.title,
    description: video.description || '',
    videoUrl: video.videoUrl,
    thumbnail: video.thumbnail || '',
    category: video.category,
    createdAt: formatDate(video.createdAt)
  }));

  res.json({ success: true, videos: formattedVideos });
}));

app.post('/api/admin/video-tips', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { title, description, videoUrl, category } = req.body;

  if (!title || !videoUrl || !category) {
    return sendError(res, 400, 'Title, video URL, and category are required');
  }

  const { embedUrl, thumbnail } = processYouTubeUrl(videoUrl);

  const [result] = await pool.execute(
    'INSERT INTO video_tips (title, description, video_url, thumbnail_url, category, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description || '', embedUrl, thumbnail, category, req.user.id]
  );

  const [newVideo] = await pool.execute(
    `SELECT id, title, description, video_url as videoUrl, thumbnail_url as thumbnail, 
            category, created_at as createdAt
     FROM video_tips WHERE id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    video: {
      id: newVideo[0].id.toString(),
      title: newVideo[0].title,
      description: newVideo[0].description || '',
      videoUrl: newVideo[0].videoUrl,
      thumbnail: newVideo[0].thumbnail || '',
      category: newVideo[0].category,
      createdAt: formatDate(newVideo[0].createdAt)
    }
  });
}));

app.put('/api/admin/video-tips/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, videoUrl, category } = req.body;

  if (!title || !videoUrl || !category) {
    return sendError(res, 400, 'Title, video URL, and category are required');
  }

  const { embedUrl, thumbnail } = processYouTubeUrl(videoUrl);

  await pool.execute(
    'UPDATE video_tips SET title = ?, description = ?, video_url = ?, thumbnail_url = ?, category = ? WHERE id = ?',
    [title, description || '', embedUrl, thumbnail, category, id]
  );

  const [updatedVideo] = await pool.execute(
    `SELECT id, title, description, video_url as videoUrl, thumbnail_url as thumbnail, 
            category, created_at as createdAt
     FROM video_tips WHERE id = ?`,
    [id]
  );

  if (updatedVideo.length === 0) {
    return sendError(res, 404, 'Video tip not found');
  }

  res.json({
    success: true,
    video: {
      id: updatedVideo[0].id.toString(),
      title: updatedVideo[0].title,
      description: updatedVideo[0].description || '',
      videoUrl: updatedVideo[0].videoUrl,
      thumbnail: updatedVideo[0].thumbnail || '',
      category: updatedVideo[0].category,
      createdAt: formatDate(updatedVideo[0].createdAt)
    }
  });
}));

app.delete('/api/admin/video-tips/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM video_tips WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return sendError(res, 404, 'Video tip not found');
  }

  res.json({ success: true, message: 'Video tip deleted successfully' });
}));

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

app.get('/api/video-tips', asyncHandler(async (req, res) => {
  const [videos] = await pool.execute(
    `SELECT id, title, description, video_url as videoUrl, thumbnail_url as thumbnail, 
            category, created_at as createdAt
     FROM video_tips 
     WHERE is_active = TRUE 
     ORDER BY created_at DESC`
  );

  const formattedVideos = videos.map(video => ({
    id: video.id.toString(),
    title: video.title,
    description: video.description || '',
    videoUrl: video.videoUrl,
    thumbnail: video.thumbnail || '',
    category: video.category,
    createdAt: formatDate(video.createdAt)
  }));

  res.json({ success: true, videos: formattedVideos });
}));

// ============================================================================
// EXPENSES API
// ============================================================================

app.get('/api/expenses', verifyToken, asyncHandler(async (req, res) => {
  const [expenses] = await pool.execute(
    `SELECT id, category, amount, date, note, created_at 
     FROM expenses 
     WHERE user_id = ? 
     ORDER BY date DESC, created_at DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    expenses: expenses.map(e => ({
      id: e.id,
      category: e.category,
      amount: parseFloat(e.amount),
      date: formatDate(e.date),
      note: e.note || ''
    }))
  });
}));

app.post('/api/expenses', verifyToken, asyncHandler(async (req, res) => {
  const { category, amount, date, note } = req.body;

  if (!category || !amount || !date) {
    return sendError(res, 400, 'Category, amount, and date are required');
  }

  const [result] = await pool.execute(
    'INSERT INTO expenses (user_id, category, amount, date, note) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, category, amount, date, note || '']
  );

  // Update budget spent amounts
  await updateBudgetSpent(req.user.id);

  const [newExpense] = await pool.execute(
    'SELECT id, category, amount, date, note FROM expenses WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    expense: {
      id: newExpense[0].id,
      category: newExpense[0].category,
      amount: parseFloat(newExpense[0].amount),
      date: formatDate(newExpense[0].date),
      note: newExpense[0].note || ''
    }
  });
}));

app.delete('/api/expenses/:id', verifyToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute(
    'DELETE FROM expenses WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (result.affectedRows === 0) {
    return sendError(res, 404, 'Expense not found');
  }

  // Update budget spent amounts
  await updateBudgetSpent(req.user.id);

  res.json({ success: true, message: 'Expense deleted successfully' });
}));

// ============================================================================
// BUDGET API
// ============================================================================

app.get('/api/budget', verifyToken, asyncHandler(async (req, res) => {
  // Handle period reset and carryover before fetching budget
  await handleBudgetPeriodReset(req.user.id);

  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );

  if (budgets.length === 0) {
    const today = formatDate(new Date());
    await pool.execute(
      'INSERT INTO budgets (user_id, total_allowance, period_type, needs_allocation, wants_allocation, savings_allocation, last_reset_date, carryover_amount) VALUES (?, 2500, ?, 50, 30, 20, ?, 0)',
      [req.user.id, 'monthly', today]
    );
    
    const [newBudget] = await pool.execute(
      'SELECT * FROM budgets WHERE user_id = ?',
      [req.user.id]
    );

    return res.json({
      success: true,
      budget: {
        totalAllowance: parseFloat(newBudget[0].total_allowance),
        periodType: newBudget[0].period_type || 'monthly',
        needsAllocation: newBudget[0].needs_allocation,
        wantsAllocation: newBudget[0].wants_allocation,
        savingsAllocation: newBudget[0].savings_allocation,
        needsSpent: parseFloat(newBudget[0].needs_spent || 0),
        wantsSpent: parseFloat(newBudget[0].wants_spent || 0),
        savingsSpent: parseFloat(newBudget[0].savings_spent || 0),
        carryoverAmount: parseFloat(newBudget[0].carryover_amount || 0)
      }
    });
  }

  const budget = budgets[0];
  const carryoverAmount = parseFloat(budget.carryover_amount || 0);
  const availableBudget = parseFloat(budget.total_allowance) + carryoverAmount;
  
  res.json({
    success: true,
    budget: {
      totalAllowance: parseFloat(budget.total_allowance),
      periodType: budget.period_type || 'monthly',
      needsAllocation: budget.needs_allocation,
      wantsAllocation: budget.wants_allocation,
      savingsAllocation: budget.savings_allocation,
      needsSpent: parseFloat(budget.needs_spent || 0),
      wantsSpent: parseFloat(budget.wants_spent || 0),
      savingsSpent: parseFloat(budget.savings_spent || 0),
      carryoverAmount: carryoverAmount,
      availableBudget: availableBudget
    }
  });
}));

app.put('/api/budget', verifyToken, asyncHandler(async (req, res) => {
  const { totalAllowance, periodType, needsAllocation, wantsAllocation, savingsAllocation } = req.body;

  if (totalAllowance === undefined || needsAllocation === undefined || 
      wantsAllocation === undefined || savingsAllocation === undefined) {
    return sendError(res, 400, 'All budget fields are required');
  }

  // Validate periodType
  const validPeriodTypes = ['daily', 'weekly', 'monthly'];
  const period = validPeriodTypes.includes(periodType) ? periodType : 'monthly';
  const today = formatDate(new Date());

  const [existing] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );

  if (existing.length === 0) {
    await pool.execute(
      'INSERT INTO budgets (user_id, total_allowance, period_type, needs_allocation, wants_allocation, savings_allocation, last_reset_date, carryover_amount) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      [req.user.id, totalAllowance, period, needsAllocation, wantsAllocation, savingsAllocation, today]
    );
  } else {
    // If changing period type, reset carryover
    const oldPeriod = existing[0].period_type || 'monthly';
    const carryoverAmount = (oldPeriod === 'daily' && period === 'daily') 
      ? parseFloat(existing[0].carryover_amount || 0) 
      : 0;
    
    await pool.execute(
      'UPDATE budgets SET total_allowance = ?, period_type = ?, needs_allocation = ?, wants_allocation = ?, savings_allocation = ?, carryover_amount = ?, last_reset_date = ? WHERE user_id = ?',
      [totalAllowance, period, needsAllocation, wantsAllocation, savingsAllocation, carryoverAmount, today, req.user.id]
    );
  }

  // Handle period reset and update spent amounts
  await handleBudgetPeriodReset(req.user.id);
  await updateBudgetSpent(req.user.id);

  const [updated] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );

  const budget = updated[0];
  const carryoverAmount = parseFloat(budget.carryover_amount || 0);
  const availableBudget = parseFloat(budget.total_allowance) + carryoverAmount;

  res.json({
    success: true,
    budget: {
      totalAllowance: parseFloat(budget.total_allowance),
      periodType: budget.period_type || 'monthly',
      needsAllocation: budget.needs_allocation,
      wantsAllocation: budget.wants_allocation,
      savingsAllocation: budget.savings_allocation,
      needsSpent: parseFloat(budget.needs_spent || 0),
      wantsSpent: parseFloat(budget.wants_spent || 0),
      savingsSpent: parseFloat(budget.savings_spent || 0),
      carryoverAmount: carryoverAmount,
      availableBudget: availableBudget
    }
  });
}));

// ============================================================================
// SAVINGS GOALS API
// ============================================================================

app.get('/api/savings-goals', verifyToken, asyncHandler(async (req, res) => {
  const [goals] = await pool.execute(
    `SELECT id, name, target, current, target_date 
     FROM savings_goals 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    goals: goals.map(g => ({
      id: g.id,
      name: g.name,
      target: parseFloat(g.target),
      current: parseFloat(g.current),
      targetDate: g.target_date ? formatDate(g.target_date) : null
    }))
  });
}));

app.post('/api/savings-goals', verifyToken, asyncHandler(async (req, res) => {
  const { name, target, targetDate } = req.body;

  if (!name || !target) {
    return sendError(res, 400, 'Name and target are required');
  }

  const [result] = await pool.execute(
    'INSERT INTO savings_goals (user_id, name, target, current, target_date) VALUES (?, ?, ?, 0, ?)',
    [req.user.id, name, target, targetDate || null]
  );

  const [newGoal] = await pool.execute(
    'SELECT id, name, target, current, target_date FROM savings_goals WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    goal: {
      id: newGoal[0].id,
      name: newGoal[0].name,
      target: parseFloat(newGoal[0].target),
      current: parseFloat(newGoal[0].current),
      targetDate: newGoal[0].target_date ? formatDate(newGoal[0].target_date) : null
    }
  });
}));

app.put('/api/savings-goals/:id', verifyToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, name, target, targetDate } = req.body;

  const [goals] = await pool.execute(
    'SELECT * FROM savings_goals WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (goals.length === 0) {
    return sendError(res, 404, 'Savings goal not found');
  }

  const goal = goals[0];

  if (amount !== undefined) {
    const newCurrent = parseFloat(goal.current) + parseFloat(amount);
    await pool.execute('UPDATE savings_goals SET current = ? WHERE id = ?', [newCurrent, id]);
  } else {
    await pool.execute(
      'UPDATE savings_goals SET name = ?, target = ?, target_date = ? WHERE id = ?',
      [name || goal.name, target || goal.target, targetDate !== undefined ? targetDate : goal.target_date, id]
    );
  }

  const [updated] = await pool.execute(
    'SELECT id, name, target, current, target_date FROM savings_goals WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    goal: {
      id: updated[0].id,
      name: updated[0].name,
      target: parseFloat(updated[0].target),
      current: parseFloat(updated[0].current),
      targetDate: updated[0].target_date ? formatDate(updated[0].target_date) : null
    }
  });
}));

app.delete('/api/savings-goals/:id', verifyToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.execute(
    'DELETE FROM savings_goals WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (result.affectedRows === 0) {
    return sendError(res, 404, 'Savings goal not found');
  }

  res.json({ success: true, message: 'Savings goal deleted successfully' });
}));

// ============================================================================
// REPORTS API
// ============================================================================

app.get('/api/reports', verifyToken, asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  
  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );
  
  const budget = budgets.length > 0 ? budgets[0] : null;
  const totalAllowance = budget ? parseFloat(budget.total_allowance) : 2500;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startDate = period === 'week' ? startOfWeek : startOfMonth;
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const [expensesByCat] = await pool.execute(
    `SELECT category, SUM(amount) as total 
     FROM expenses 
     WHERE user_id = ? AND date >= ? AND date <= ?
     GROUP BY category
     ORDER BY total DESC`,
    [req.user.id, formatDate(startDate), formatDate(endDate)]
  );

  const categoryColors = {
    'Food': 'hsl(var(--success))',
    'Transportation': 'hsl(var(--warning))',
    'School': 'hsl(var(--info))',
    'Wants': 'hsl(var(--destructive))',
    'Savings': 'hsl(var(--primary))',
    'Others': 'hsl(var(--muted-foreground))',
  };

  const expensesByCategory = expensesByCat.map((exp) => ({
    name: exp.category,
    value: parseFloat(exp.total),
    fill: categoryColors[exp.category] || 'hsl(var(--muted-foreground))'
  }));

  const weeklyData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const [dayExpenses] = await pool.execute(
      `SELECT SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date = ?`,
      [req.user.id, formatDate(date)]
    );

    const spent = dayExpenses[0]?.total ? parseFloat(dayExpenses[0].total) : 0;
    const dailyBudget = totalAllowance / 30;

    weeklyData.push({
      day: days[date.getDay()],
      spent: Math.round(spent),
      budget: Math.round(dailyBudget)
    });
  }

  const budgetVsActual = [];
  if (budget) {
    const needsBudget = (totalAllowance * budget.needs_allocation) / 100;
    const wantsBudget = (totalAllowance * budget.wants_allocation) / 100;
    const savingsBudget = (totalAllowance * budget.savings_allocation) / 100;

    budgetVsActual.push(
      { category: 'Needs', budget: Math.round(needsBudget), actual: Math.round(parseFloat(budget.needs_spent)) },
      { category: 'Wants', budget: Math.round(wantsBudget), actual: Math.round(parseFloat(budget.wants_spent)) },
      { category: 'Savings', budget: Math.round(savingsBudget), actual: Math.round(parseFloat(budget.savings_spent)) }
    );
  } else {
    budgetVsActual.push(
      { category: 'Needs', budget: 0, actual: 0 },
      { category: 'Wants', budget: 0, actual: 0 },
      { category: 'Savings', budget: 0, actual: 0 }
    );
  }

  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 3; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const [monthExpenses] = await pool.execute(
      `SELECT SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date >= ? AND date <= ?`,
      [req.user.id, formatDate(monthStart), formatDate(monthEnd)]
    );

    const expenses = monthExpenses[0]?.total ? parseFloat(monthExpenses[0].total) : 0;
    const income = totalAllowance;

    monthlyData.push({
      month: monthNames[monthDate.getMonth()],
      income: Math.round(income),
      expenses: Math.round(expenses)
    });
  }

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);
  const daysInPeriod = period === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgDaily = daysInPeriod > 0 ? Math.round(totalExpenses / daysInPeriod) : 0;
  const topCategory = expensesByCategory.length > 0 
    ? expensesByCategory.reduce((a, b) => a.value > b.value ? a : b)
    : { name: 'N/A', value: 0 };

  const insights = [];
  const recommendations = [];

  if (expensesByCategory.length > 0) {
    const topCat = expensesByCategory[0];
    const topCatPercent = totalExpenses > 0 ? Math.round((topCat.value / totalExpenses) * 100) : 0;
    insights.push(`${topCat.name} is your largest expense category at ${topCatPercent}% of total spending.`);
  }

  if (budget) {
    const wantsActual = parseFloat(budget.wants_spent);
    const wantsBudget = (totalAllowance * budget.wants_allocation) / 100;
    if (wantsActual > wantsBudget) {
      const over = Math.round(wantsActual - wantsBudget);
      insights.push(`You've exceeded your "Wants" budget by ₱${over.toLocaleString()} this ${period === 'week' ? 'week' : 'month'}.`);
    }
  }

  if (weeklyData.length > 0) {
    const weekendSpent = weeklyData.filter((d, i) => i >= 5).reduce((sum, d) => sum + d.spent, 0);
    const weekdaySpent = weeklyData.filter((d, i) => i < 5).reduce((sum, d) => sum + d.spent, 0);
    if (weekendSpent > weekdaySpent / 2) {
      insights.push('You tend to spend more on weekends. Consider setting stricter weekend budgets.');
    }
  }

  recommendations.push('Try meal prepping to reduce daily food expenses.');
  recommendations.push('Set up a "no-spend" day once a week to boost savings.');
  recommendations.push('Transfer savings immediately when you receive allowance.');

  res.json({
    success: true,
    data: {
      expensesByCategory,
      weeklyTrend: weeklyData,
      budgetVsActual,
      monthlyOverview: monthlyData,
      summary: {
        totalExpenses,
        avgDaily,
        topCategory: topCategory.name
      },
      insights,
      recommendations
    }
  });
}));

// ============================================================================
// DISCIPLINE API
// ============================================================================

app.get('/api/discipline', verifyToken, asyncHandler(async (req, res) => {
  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );
  
  const budget = budgets.length > 0 ? budgets[0] : null;
  const totalAllowance = budget ? parseFloat(budget.total_allowance) : 2500;
  const needsBudget = budget ? (totalAllowance * budget.needs_allocation) / 100 : 0;
  const wantsBudget = budget ? (totalAllowance * budget.wants_allocation) / 100 : 0;
  const savingsBudget = budget ? (totalAllowance * budget.savings_allocation) / 100 : 0;
  const needsSpent = budget ? parseFloat(budget.needs_spent) : 0;
  const wantsSpent = budget ? parseFloat(budget.wants_spent) : 0;
  const savingsSpent = budget ? parseFloat(budget.savings_spent) : 0;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(now);
  endOfWeek.setHours(23, 59, 59, 999);

  const [weekExpenses] = await pool.execute(
    `SELECT category, SUM(amount) as total 
     FROM expenses 
     WHERE user_id = ? AND date >= ? AND date <= ?
     GROUP BY category`,
    [req.user.id, formatDate(startOfWeek), formatDate(endOfWeek)]
  );

  const categorySpending = {};
  weekExpenses.forEach((exp) => {
    categorySpending[exp.category] = parseFloat(exp.total);
  });

  const alerts = [];

  if (wantsBudget > 0) {
    const wantsPercent = (wantsSpent / wantsBudget) * 100;
    if (wantsPercent >= 100) {
      alerts.push({
        id: 'wants-limit',
        type: 'danger',
        title: 'Budget Limit Reached!',
        message: `You've spent 100% of your 'Wants' budget for this week.`,
        category: 'Wants',
        percentage: 100
      });
    } else if (wantsPercent >= 85) {
      const remaining = Math.round(wantsBudget - wantsSpent);
      alerts.push({
        id: 'wants-warning',
        type: 'warning',
        title: 'Approaching Limit',
        message: `You've used ${Math.round(wantsPercent)}% of your 'Wants' budget. ₱${remaining} remaining.`,
        category: 'Wants',
        percentage: Math.round(wantsPercent)
      });
    }
  }

  const foodSpent = categorySpending['Food'] || 0;
  const foodBudget = needsBudget * 0.6;
  if (foodBudget > 0) {
    const foodPercent = (foodSpent / foodBudget) * 100;
    if (foodPercent >= 85) {
      const remaining = Math.round(foodBudget - foodSpent);
      alerts.push({
        id: 'food-warning',
        type: 'warning',
        title: 'Approaching Limit',
        message: `You've used ${Math.round(foodPercent)}% of your 'Food' budget. ₱${remaining} remaining.`,
        category: 'Food',
        percentage: Math.round(foodPercent)
      });
    }
  }

  const totalWeekSpent = weekExpenses.reduce((sum, exp) => sum + parseFloat(exp.total), 0);
  const savingsTarget = totalAllowance * 0.2;
  if (savingsSpent >= savingsTarget) {
    alerts.push({
      id: 'savings-success',
      type: 'success',
      title: 'Great Savings!',
      message: `You've saved ₱${Math.round(savingsSpent)} this week. Keep it up!`
    });
  }

  let score = 100;
  
  if (wantsSpent > wantsBudget) {
    const overrun = ((wantsSpent - wantsBudget) / wantsBudget) * 100;
    score -= Math.min(30, overrun * 0.5);
  }
  if (needsSpent > needsBudget) {
    const overrun = ((needsSpent - needsBudget) / needsBudget) * 100;
    score -= Math.min(20, overrun * 0.3);
  }

  if (savingsSpent >= savingsTarget) {
    score += 10;
  } else if (savingsSpent >= savingsTarget * 0.8) {
    score += 5;
  }

  const daysWithExpenses = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const [dayExpenses] = await pool.execute(
      `SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND date = ?`,
      [req.user.id, formatDate(date)]
    );
    if (dayExpenses[0].count > 0) {
      daysWithExpenses.push(formatDate(date));
    }
  }
  
  const trackingDays = daysWithExpenses.length;
  if (trackingDays < 5) {
    score -= (5 - trackingDays) * 5;
  } else if (trackingDays === 7) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const rules = [
    { rule: 'Track expenses daily', isFollowed: trackingDays >= 5 },
    { rule: 'Stay within budget categories', isFollowed: wantsSpent <= wantsBudget && needsSpent <= needsBudget },
    { rule: 'Save at least 20% of allowance', isFollowed: savingsSpent >= savingsTarget },
    { rule: 'No impulse purchases', isFollowed: wantsSpent <= wantsBudget * 0.9 },
    { rule: 'Review spending weekly', isFollowed: trackingDays >= 5 }
  ];

  res.json({
    success: true,
    data: {
      alerts,
      disciplineScore: score,
      rules,
      streak: trackingDays
    }
  });
}));

// ============================================================================
// DASHBOARD API
// ============================================================================

app.get('/api/dashboard', verifyToken, asyncHandler(async (req, res) => {
  const [budgets] = await pool.execute(
    'SELECT * FROM budgets WHERE user_id = ?',
    [req.user.id]
  );
  
  const budget = budgets.length > 0 ? budgets[0] : null;
  const totalAllowance = budget ? parseFloat(budget.total_allowance) : 2500;
  const needsSpent = budget ? parseFloat(budget.needs_spent) : 0;
  const wantsSpent = budget ? parseFloat(budget.wants_spent) : 0;
  const savingsSpent = budget ? parseFloat(budget.savings_spent) : 0;
  const totalSpent = needsSpent + wantsSpent + savingsSpent;
  const balance = totalAllowance - totalSpent;
  const budgetUsed = totalAllowance > 0 ? Math.round((totalSpent / totalAllowance) * 100) : 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(now);
  endOfMonth.setHours(23, 59, 59, 999);

  const [recentExpenses] = await pool.execute(
    `SELECT id, category, amount, date, note 
     FROM expenses 
     WHERE user_id = ? AND date >= ? AND date <= ?
     ORDER BY date DESC, id DESC
     LIMIT 5`,
    [req.user.id, formatDate(startOfMonth), formatDate(endOfMonth)]
  );

  const formattedExpenses = recentExpenses.map((exp) => ({
    id: exp.id,
    category: exp.category,
    amount: parseFloat(exp.amount),
    date: formatRelativeDate(exp.date),
    note: exp.note
  }));

  const [savingsGoals] = await pool.execute(
    `SELECT * FROM savings_goals 
     WHERE user_id = ? AND current < target
     ORDER BY created_at DESC
     LIMIT 1`,
    [req.user.id]
  );

  let savingsGoal = null;
  if (savingsGoals.length > 0) {
    const goal = savingsGoals[0];
    savingsGoal = {
      name: goal.name,
      target: parseFloat(goal.target),
      current: parseFloat(goal.current)
    };
  }

  res.json({
    success: true,
    data: {
      balance: Math.max(0, balance),
      allowance: totalAllowance,
      spent: totalSpent,
      budgetUsed,
      recentExpenses: formattedExpenses,
      savingsGoal
    }
  });
}));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Allowance Ally API is running' });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;
// On Railway, RAILWAY_PUBLIC_DOMAIN is set (e.g. allowance-ally-production.up.railway.app)
const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Allowance Ally Backend API Server   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API endpoints available at ${BASE_URL}/api`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  POST   ${BASE_URL}/api/auth/login`);
  console.log(`  POST   ${BASE_URL}/api/auth/register`);
  console.log(`  GET    ${BASE_URL}/api/auth/verify`);
  console.log(`  GET    ${BASE_URL}/api/video-tips (public)`);
  console.log(`  GET    ${BASE_URL}/api/expenses (auth required)`);
  console.log(`  POST   ${BASE_URL}/api/expenses (auth required)`);
  console.log(`  DELETE ${BASE_URL}/api/expenses/:id (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/budget (auth required)`);
  console.log(`  PUT    ${BASE_URL}/api/budget (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/savings-goals (auth required)`);
  console.log(`  POST   ${BASE_URL}/api/savings-goals (auth required)`);
  console.log(`  PUT    ${BASE_URL}/api/savings-goals/:id (auth required)`);
  console.log(`  DELETE ${BASE_URL}/api/savings-goals/:id (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/reports (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/discipline (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/dashboard (auth required)`);
  console.log(`  GET    ${BASE_URL}/api/admin/users (admin only)`);
  console.log(`  GET    ${BASE_URL}/api/admin/video-tips (admin only)`);
  console.log(`  POST   ${BASE_URL}/api/admin/video-tips (admin only)`);
  console.log(`  PUT    ${BASE_URL}/api/admin/video-tips/:id (admin only)`);
  console.log(`  DELETE ${BASE_URL}/api/admin/video-tips/:id (admin only)`);
  console.log(`  GET    ${BASE_URL}/api/health`);
  console.log('');
  console.log('JWT Secret:', JWT_SECRET.substring(0, 20) + '...');
  console.log('');
});
