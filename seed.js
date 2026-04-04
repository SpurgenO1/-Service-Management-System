require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

connectDB();

const seedUsers = async () => {
  try {
    await User.deleteMany(); // Reset users

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const users = [
      { name: 'Admin User', email: 'admin@company.com', password, role: 'admin' },
      { name: 'Dev User', email: 'dev@company.com', password, role: 'developer' },
      { name: 'Tester User', email: 'tester@company.com', password, role: 'tester' },
      { name: 'Client User', email: 'client@client.com', password, role: 'client' },
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
