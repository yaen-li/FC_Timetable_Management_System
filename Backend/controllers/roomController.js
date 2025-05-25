exports.checkAvailability = async (req, res) => {
  const { date } = req.query;

  const availableRooms = [
    { roomId: 'mkp9-N28', capacity: 20, available: true },
    { roomId: 'bk1-N24', capacity: 50, available: true }
  ];

  res.status(200).json(availableRooms);
};

exports.createBooking = async (req, res) => {
  const { roomId, date, startTime, endTime } = req.body;

  res.status(201).json({
    message: 'Booking created successfully',
    booking: { roomId, date, startTime, endTime }
  });
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  res.status(200).json({ message: `Booking ${id} cancelled successfully` });
};

// Verify if lecturer is available before booking
const lecturerService = require('../services/lecturerService');

exports.createBooking = async (req, res) => {
  const { lecturerId, roomId, date, startTime, endTime } = req.body;

  const isAvailable = await lecturerService.checkAvailability(lecturerId, date);
  if (!isAvailable) {
    return res.status(400).json({ message: 'Lecturer not available on selected date' });
  }

  // Proceed with booking
  res.status(201).json({ message: 'Booking created successfully' });
};