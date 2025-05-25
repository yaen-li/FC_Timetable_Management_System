const timetables = {
  1: [
    { day: 'Monday', time: '10:00', course: 'Math 101' },
    { day: 'Wednesday', time: '14:00', course: 'Physics 202' }
  ],
  2: [
    { day: 'Tuesday', time: '11:00', course: 'Biology 105' }
  ]
};

exports.getTimetable = async (userId) => {
  return timetables[userId] || [];
};