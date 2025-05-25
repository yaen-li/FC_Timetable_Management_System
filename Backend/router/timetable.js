const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/dashboard', studentController.viewDashboard);
router.get('/timetable', studentController.viewTimetable);
router.get('/timetable/filter', studentController.filterTimetable);

module.exports = router;