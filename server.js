require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

connectDB();

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

const corsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.PUBLIC_APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require('./routes/coreRoutes'));
app.use('/analytics', require('./routes/analyticsRoutes'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/client', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/developer', require('./routes/devRoutes'));
app.use('/api/tester', require('./routes/testerRoutes'));

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
