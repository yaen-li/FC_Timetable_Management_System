const authSvc = require('../services/authService');

module.exports = {
  login: async (req, res) => {
    try {
      const { login, password } = req.query;
      const userSession  = await authSvc.authenticateUser(login, password);
      const adminSession = await authSvc.fetchAdminSession(userSession.session_id);
      res.json({ userSession, adminSession });
    } catch (e) {
      console.error('Login error:', e);
      const code = e.message==='Invalid credentials'? 401:500;
      res.status(code).json({ error: e.message });
    }
  }
};
