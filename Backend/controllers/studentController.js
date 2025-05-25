const studentService = require('../services/studentService');

exports.getTimetable = async (req, res) => {
  const userId = req.query.userId || 1; // simulate user ID (in real apps: from token)

  try {
    const timetable = await studentService.getTimetable(userId);
    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
};

exports.viewDashboard = async (req, res) => { /* StudentService.getDashboard */ }
exports.viewTimetable = async (req, res) => { /* StudentService.getTimetable */ }
exports.filterTimetable = async (req, res) => { /* StudentService.filterTimetable */ }