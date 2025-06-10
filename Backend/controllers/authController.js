exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Temporary static check (replace with DB call)
  if ((email === 'staff01' || email === 'student01') && password === 'password123') {
    return res.status(200).json({
      token: 'mock-jwt-token',
      user: {
        id: 1,
        role: email === 'staff01' ? 'staff' : 'student',
        email,
      }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
};

exports.logout = async (req, res) => { /* Invalidate token/session */ }
exports.refreshToken = async (req, res) => { /* AuthService.refreshToken */ }
