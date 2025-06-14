const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File paths for data storage
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const FAVORITES_FILE = path.join(__dirname, 'data', 'favorites.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  await ensureDataDirectory();
  
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(FAVORITES_FILE);
  } catch {
    await fs.writeFile(FAVORITES_FILE, JSON.stringify({}, null, 2));
  }
}

// Read data from files
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function readFavorites() {
  try {
    const data = await fs.readFile(FAVORITES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Write data to files
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function writeFavorites(favorites) {
  await fs.writeFile(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await readUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add course to favorites
app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const favorites = await readFavorites();
    
    if (!favorites[userId]) {
      favorites[userId] = [];
    }

    // Check if course is already in favorites
    if (favorites[userId].includes(courseId)) {
      return res.status(400).json({ message: 'Course already in favorites' });
    }

    favorites[userId].push(courseId);
    await writeFavorites(favorites);

    res.json({ message: 'Course added to favorites', favorites: favorites[userId] });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove course from favorites
app.delete('/api/favorites/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const favorites = await readFavorites();
    
    if (!favorites[userId]) {
      return res.status(404).json({ message: 'No favorites found' });
    }

    const index = favorites[userId].indexOf(courseId);
    if (index === -1) {
      return res.status(404).json({ message: 'Course not in favorites' });
    }

    favorites[userId].splice(index, 1);
    await writeFavorites(favorites);

    res.json({ message: 'Course removed from favorites', favorites: favorites[userId] });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's favorite courses
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const favorites = await readFavorites();
    
    const userFavorites = favorites[userId] || [];
    res.json({ favorites: userFavorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if course is in favorites
app.get('/api/favorites/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const favorites = await readFavorites();
    
    const userFavorites = favorites[userId] || [];
    const isFavorite = userFavorites.includes(courseId);
    
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Initialize server
async function startServer() {
  await initializeDataFiles();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error); 