
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Routes
const medicineRoutes = require('./routes/medicineRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');

// Config
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route Middleware
app.use('/api/medicines', medicineRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('QuickMeds API is running');
});

// Connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickMeds')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
