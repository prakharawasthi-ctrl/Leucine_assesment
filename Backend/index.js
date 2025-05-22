const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { AppDataSource } = require('./data-source');

const authRoutes = require('./routes/auth.routes');
const softwareRoutes = require('./routes/software.routes');
const requestRoutes = require('./routes/request.routes'); // ✅ Import requests route

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/software', softwareRoutes);
app.use('/api/request', requestRoutes); // ✅ Mount request routes

// Start the server after DB connection
AppDataSource.initialize()
  .then(() => {
    console.log('Connected to PostgreSQL');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
