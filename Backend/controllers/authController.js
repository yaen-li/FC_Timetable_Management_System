const authService = require('../services/authService');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = await authService.authenticate(username, password);
    if (!token) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.logout = async (req, res) => { /* Invalidate token/session */ }
exports.refreshToken = async (req, res) => { /* AuthService.refreshToken */ }