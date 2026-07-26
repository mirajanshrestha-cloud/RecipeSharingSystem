import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipe-sharing';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  cookTime: { type: String, required: true, trim: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  ingredients: [{ type: String, trim: true }],
  steps: [{ type: String, trim: true }],
  image: { type: String, default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

recipeSchema.index({ title: 'text', cuisine: 'text' });

const User = mongoose.model('User', userSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);

let useMemoryStore = false;
const memoryUsers = [];
const memoryRecipes = [];

const seedRecipes = [
  {
    _id: 'recipe-1',
    title: 'Cacio e Pepe',
    cuisine: 'Italian',
    cookTime: '25 min',
    difficulty: 'Medium',
    ingredients: ['Pasta', 'Parmesan', 'Black pepper', 'Butter'],
    steps: ['Boil pasta', 'Mix sauce', 'Toss together'],
    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&q=80',
    createdBy: 'user-seed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'recipe-2',
    title: 'Baja Fish Tacos',
    cuisine: 'Mexican',
    cookTime: '30 min',
    difficulty: 'Easy',
    ingredients: ['Fish', 'Tortillas', 'Lime', 'Cabbage'],
    steps: ['Fry fish', 'Assemble tacos', 'Serve'],
    image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600&q=80',
    createdBy: 'user-seed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

memoryRecipes.push(...seedRecipes);

const userStore = {
  async findOne(filter) {
    if (useMemoryStore) {
      return memoryUsers.find((user) => user.email === filter.email) || null;
    }
    return User.findOne(filter);
  },
  async findById(id) {
    if (useMemoryStore) {
      const user = memoryUsers.find((entry) => String(entry._id) === String(id));
      return user ? { ...user } : null;
    }
    return User.findById(id).select('-password');
  },
  async create(data) {
    if (useMemoryStore) {
      const user = {
        _id: `user-${Date.now()}`,
        ...data,
        favourites: [],
      };
      memoryUsers.push(user);
      return user;
    }
    return User.create(data);
  },
  async update(user) {
    if (useMemoryStore) {
      const index = memoryUsers.findIndex((entry) => String(entry._id) === String(user._id));
      if (index >= 0) {
        memoryUsers[index] = { ...memoryUsers[index], ...user };
      }
      return memoryUsers[index];
    }
    return user.save();
  },
};

const recipeStore = {
  async create(data) {
    if (useMemoryStore) {
      const recipe = {
        _id: `recipe-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRecipes.unshift(recipe);
      return recipe;
    }
    return Recipe.create(data);
  },
  async list(filter = {}, search = '') {
    if (useMemoryStore) {
      let items = [...memoryRecipes];
      if (filter.cuisine) {
        items = items.filter((item) => item.cuisine === filter.cuisine);
      }
      if (search) {
        items = items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
      }
      return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    let query = Recipe.find(filter).populate('createdBy', 'name email');
    if (search) {
      query = Recipe.find({ $text: { $search: search } }).populate('createdBy', 'name email');
    }
    return query.sort({ createdAt: -1 });
  },
  async findById(id) {
    if (useMemoryStore) {
      return memoryRecipes.find((entry) => String(entry._id) === String(id)) || null;
    }
    return Recipe.findById(id).populate('createdBy', 'name email');
  },
  async deleteOne(recipe) {
    if (useMemoryStore) {
      const index = memoryRecipes.findIndex((entry) => String(entry._id) === String(recipe._id));
      if (index >= 0) memoryRecipes.splice(index, 1);
      return true;
    }
    return recipe.deleteOne();
  },
};

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await userStore.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { ...user, password: undefined };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await userStore.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userStore.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userStore.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const { cuisine, search } = req.query;
    const recipes = await recipeStore.list(cuisine && cuisine !== 'All' ? { cuisine } : {}, search || '');
    return res.json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recipes', error: error.message });
  }
});

app.post('/api/recipes', auth, async (req, res) => {
  try {
    const recipe = await recipeStore.create({
      ...req.body,
      createdBy: req.user._id,
    });
    return res.status(201).json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create recipe', error: error.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await recipeStore.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    return res.json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recipe', error: error.message });
  }
});

app.delete('/api/recipes/:id', auth, async (req, res) => {
  try {
    const recipe = await recipeStore.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (String(recipe.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own recipes' });
    }

    await recipeStore.deleteOne(recipe);
    return res.json({ message: 'Recipe removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete recipe', error: error.message });
  }
});

app.post('/api/recipes/:id/favourite', auth, async (req, res) => {
  try {
    const user = await userStore.findById(req.user._id);
    const recipeId = req.params.id;
    const exists = user.favourites.includes(recipeId);

    if (exists) {
      user.favourites = user.favourites.filter((f) => String(f) !== recipeId);
    } else {
      user.favourites.push(recipeId);
    }

    await userStore.update(user);
    return res.json({ favourites: user.favourites });
  } catch (error) {
    return res.status(500).json({ message: 'Favourite update failed', error: error.message });
  }
});

app.get('/api/me/favourites', auth, async (req, res) => {
  try {
    const user = await userStore.findById(req.user._id);
    const favourites = memoryRecipes.filter((recipe) => user.favourites.includes(recipe._id));
    return res.json(favourites);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load favourites', error: error.message });
  }
});

app.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    useMemoryStore = false;
    console.log(`Server listening on port ${PORT}`);
  } catch (error) {
    useMemoryStore = true;
    console.warn('MongoDB unavailable, using in-memory store:', error.message);
    console.log(`Server listening on port ${PORT}`);
  }
});
