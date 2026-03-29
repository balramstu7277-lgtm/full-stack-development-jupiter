const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/mainRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Connect DB and start
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Seed admin (password will be auto-hashed by User model pre-save hook)
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@jupiterclasses.com' });
    if (!existing) {
      await User.create({
        name: 'Sandeep Kumar',
        email: 'admin@jupiterclasses.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin seeded: admin@jupiterclasses.com / admin123');
    }
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => { console.error('MongoDB connection error:', err.message); process.exit(1); });
