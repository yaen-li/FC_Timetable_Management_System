// Mock data: Assignments and availability
const lecturerSchedules = {
  2: [ // Lecturer ID
    { day: 'Monday', time: '10:00', course: 'SECJ23', room: 'mpk9-N28' },
    { day: 'Wednesday', time: '13:00', course: 'SECV43', room: 'bk1-N24' }
  ]
};

exports.checkAvailability = async (lecturerId, date) => {
  const availableDates = lecturerAvailability[lecturerId] || [];
  return availableDates.includes(date);
};

exports.getLecturerTimetable = async (lecturerId) => {
  return lecturerSchedules[lecturerId] || [];
};

exports.getAssignedCourses = async (lecturerId) => {
  const schedule = lecturerSchedules[lecturerId] || [];
  return schedule.map(s => s.course);
};