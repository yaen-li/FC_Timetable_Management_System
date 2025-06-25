const express = require('express');
const authRouter = require('./router/auth');
const timetableRouter = require('./router/timetable');
const studentRouter = require('./router/student');
const lecturerRouter = require('./router/lecturer');
const roomRouter = require('./router/room');

const app = express();
const PORT = 3000;

// Routes
app.use('/api/auth', authRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/student', studentRouter);
app.use('/api/lecturer', lecturerRouter);
app.use('/api/room', roomRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});