const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const roomController = require('../controllers/roomController');

router.get('/lecturers/availability', lecturerController.checkAvailability);
router.get('/rooms/availability', roomController.checkAvailability);
router.post('/bookings', roomController.createBooking);
router.delete('/bookings/:id', roomController.cancelBooking);

module.exports = router;