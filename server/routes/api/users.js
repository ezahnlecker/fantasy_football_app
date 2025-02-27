import express from 'express';
import { User, ESPNCredentials } from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            include: [ESPNCredentials]
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password_hash: hashedPassword
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

// Update ESPN credentials
router.post('/:userId/credentials', auth, async (req, res) => {
    try {
        const [credentials] = await ESPNCredentials.upsert({
            user_id: req.params.userId,
            ...req.body
        });
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update credentials' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email }});
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const isValidPassword = await bcrypt.compare(req.body.password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router; 