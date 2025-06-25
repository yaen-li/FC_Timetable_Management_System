const express = require('express');
const router  = express.Router();
const studentController = require('../controllers/studentController');

// 1) List all students (admin session required)
router.get('/', studentController.listAll);

// 2) Filter endpoints (client must pass full list as JSON string in `students` query param)
router.get('/filter/program', studentController.searchByProgram);
router.get('/filter/year',    studentController.searchByYear);
router.get('/filter', studentController.filter);
// 3) Timetable endpoints
router.get('/sessions/:studentId',                           studentController.getAvailableSessions);
router.get('/sessions/:studentId/:session/semesters',        studentController.getAvailableSemesters);
router.get('/courses/:studentId/:session/:semester',         studentController.getCourses);
router.get('/timetable/full/:studentId/:session/:semester',  studentController.getFullTimetable);
router.get('/timetable/daily/:studentId/:session/:semester/:day', studentController.getDailyTimetable);

module.exports = router;
