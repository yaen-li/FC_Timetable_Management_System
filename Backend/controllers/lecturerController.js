// controllers/lecturerController.js
exports.checkAvailability = async (req, res) => { /* LecturerService.checkAvailability */ }

// controllers/roomController.js
exports.checkAvailability = async (req, res) => { /* RoomRepository.findAvailableRooms */ }
exports.createBooking = async (req, res) => { /* Booking.create */ }
exports.cancelBooking = async (req, res) => { /* Booking.cancel */ }