const users = [
  { id: 1, username: 'student1', password: 'pass123', role: 'student' },
  { id: 2, username: 'lecturer1', password: 'lect456', role: 'lecturer' }
];

const jwt = require('jsonwebtoken');

exports.authenticate = async (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;

  // Generate fake JWT token (use secret key in real app)
  const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', {
    expiresIn: '1h'
  });

  return token;
};