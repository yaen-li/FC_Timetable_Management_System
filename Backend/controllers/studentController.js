const studentService = require('../services/studentService');

// Loads and caches the current user's timetable in session
exports.viewTimetable = async (req, res) => {
  // Simulate user ID (replace with real logic as needed, e.g., from token/session)
  const userId = req.query.userId || 1;

  // Use session key for this user's timetable
  const sessionKey = `timetable_${userId}`;

  // Check if timetable is already cached in session
  if (req.session && req.session[sessionKey]) {
    return res.status(200).json({
      timetable: req.session[sessionKey],
      cached: true
    });
  }

  try {
    // Load timetable from service
    const timetable = await studentService.getTimetable(userId);

    // Cache in session
    if (req.session) {
      req.session[sessionKey] = timetable;
    }

    res.status(200).json({
      timetable,
      cached: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
};
