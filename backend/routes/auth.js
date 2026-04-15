import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

// In-memory store for simulated OTPs and registrations (for demo purposes)
const pendingRegistrations = new Map();
const mockUsers = [
  {
    _id: "demo_admin_123",
    firstName: "Demo",
    lastName: "User",
    phone: "9121445315",
    password: "admin123",
    state: "Telangana",
    district: "Warangal",
    primaryCrop: "Wheat",
    landAcres: 5
  }
];

// 1. Initiate Registration & Send Simulated OTP
router.post('/register', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Check if user exists (in real DB or Mock DB based on connection)
    let exists = false;
    if (req.isDbConnected) {
      const user = await User.findOne({ phone });
      if (user) exists = true;
    } else {
      if (mockUsers.find(u => u.phone === phone)) exists = true;
    }

    if (exists) {
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    // Generate simulated OTP - for college demo, fixed '123456' is easiest, or a random 6 digit
    const otp = '123456'; 
    console.log(`\n===========================================`);
    console.log(`🔔 SIMULATED SMS SENT TO +91 ${phone}`);
    console.log(`💬 "Your AgriSmart verification code is: ${otp}"`);
    console.log(`===========================================\n`);

    // Store pending registration data temporarily
    pendingRegistrations.set(phone, { data: req.body, otp });

    res.status(200).json({ message: 'OTP sent successfully', otp: otp }); // We return OTP purely for the frontend to auto-fill or log for ease in development
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. Verify OTP & Finalize Registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const pending = pendingRegistrations.get(phone);

    if (!pending) {
      return res.status(400).json({ message: 'Session expired or not found. Please register again.' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Create user
    let newUser;
    if (req.isDbConnected) {
      newUser = new User(pending.data);
      await newUser.save();
    } else {
      newUser = { ...pending.data, _id: Date.now().toString(), createdAt: new Date() };
      mockUsers.push(newUser);
    }

    // Clean up map
    pendingRegistrations.delete(phone);

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. Login Flow
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    let user;
    if (req.isDbConnected) {
      user = await User.findOne({ phone });
    } else {
      user = mockUsers.find(u => u.phone === phone);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Notice: For a real app, use bcrypt.compare here. 
    // Since we didn't hash it in the mock for brevity, we do direct compare.
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Construct response object without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      state: user.state,
      district: user.district,
      primaryCrop: user.primaryCrop,
      landAcres: user.landAcres
    };

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
