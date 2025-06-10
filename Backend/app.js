const express = require('express');
const app = express();

app.use(express.json());

// ---- ADD SESSION MIDDLEWARE FIRST ----
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key', // use a secure secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));
// --------------------------------------

// Routers (must come after session middleware)
app.use('/api/auth', require('./router/auth'));
app.use('/api/scheduling', require('./router/scheduling'));
app.use('/api/timetable', require('./router/timetable'));

// Root
app.get('/', (req, res) => res.send('API Running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
