const express = require("express")
const router = express.Router()
const TTMSService = require("../services/ttmsService")

// Room Controller for TTMS Integration
class RoomController {
  constructor() {
    this.ttmsService = new TTMSService()
  }

  // GET /api/rooms/auth - Get admin authentication
  async getAdminAuth(req, res) {
    try {
      const { session_id } = req.query

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "User session_id is required",
        })
      }

      const adminSessionId = await this.ttmsService.getAdminSession(session_id)

      res.json({
        success: true,
        data: {
          admin_session_id: adminSessionId,
          expires_in: "24 hours",
        },
        message: "Admin authentication successful",
      })
    } catch (error) {
      console.error("Admin auth error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to authenticate admin session",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/period - Get current academic period
  async getCurrentPeriod(req, res) {
    try {
      const period = await this.ttmsService.getCurrentPeriod()

      res.json({
        success: true,
        data: period,
        message: "Current academic period retrieved",
      })
    } catch (error) {
      console.error("Get period error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get current period",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/subjects - Get subjects for session/semester
  async getSubjects(req, res) {
    try {
      const { session, semester } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      const subjects = await this.ttmsService.getSubjects(session, semester)

      res.json({
        success: true,
        data: subjects,
        total: subjects.length,
        query: { session, semester },
        message: "Subjects retrieved successfully",
      })
    } catch (error) {
      console.error("Get subjects error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get subjects",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/schedules - Get all schedules for room analysis
  async getAllSchedules(req, res) {
    try {
      const { session, semester, subject_code, section } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      let schedules
      if (subject_code && section) {
        // Get specific subject schedule
        schedules = await this.ttmsService.getSubjectSchedule(session, semester, subject_code, section)
      } else {
        // Get all schedules
        schedules = await this.ttmsService.getAllSchedules(session, semester)
      }

      res.json({
        success: true,
        data: schedules,
        total: schedules.length,
        query: { session, semester, subject_code, section },
        message: "Schedules retrieved successfully",
      })
    } catch (error) {
      console.error("Get schedules error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get schedules",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/list - Get rooms from schedules
  async getRoomsList(req, res) {
    try {
      const { session, semester, building, available_only } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      let rooms = await this.ttmsService.getRoomsFromSchedules(session, semester)

      // Apply building filter
      if (building) {
        rooms = rooms.filter((room) => room.building.toLowerCase().includes(building.toLowerCase()))
      }

      // Apply availability filter
      if (available_only === "true") {
        const currentTime = new Date()
        const currentDay = this.getDayName(currentTime.getDay())
        const currentTimeSlot = this.getCurrentTimeSlot(currentTime)

        rooms = await Promise.all(
          rooms.map(async (room) => {
            const isAvailable = await this.ttmsService.checkRoomAvailability(
              session,
              semester,
              currentDay,
              currentTimeSlot,
              room.id,
            )
            return { ...room, available: isAvailable }
          }),
        )

        rooms = rooms.filter((room) => room.available)
      }

      res.json({
        success: true,
        data: rooms,
        total: rooms.length,
        query: { session, semester, building, available_only },
        message: "Rooms list retrieved successfully",
      })
    } catch (error) {
      console.error("Get rooms error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get rooms",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/:roomId/schedule - Get specific room schedule
  async getRoomSchedule(req, res) {
    try {
      const { roomId } = req.params
      const { session, semester, day } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      const allSchedules = await this.ttmsService.getAllSchedules(session, semester)
      let roomSchedules = allSchedules.filter((schedule) => schedule.kod_ruang === roomId)

      // Filter by day if specified
      if (day) {
        roomSchedules = roomSchedules.filter((schedule) => schedule.hari?.toLowerCase() === day.toLowerCase())
      }

      // Group by day for better organization
      const schedulesByDay = this.groupSchedulesByDay(roomSchedules)

      res.json({
        success: true,
        data: {
          room_id: roomId,
          schedules: roomSchedules,
          schedules_by_day: schedulesByDay,
          total_slots: roomSchedules.length,
        },
        query: { session, semester, day },
        message: "Room schedule retrieved successfully",
      })
    } catch (error) {
      console.error("Get room schedule error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get room schedule",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/availability/check - Check room availability
  async checkAvailability(req, res) {
    try {
      const { session, semester, day, time_slot, building, room_id } = req.query

      if (!session || !semester || !day || !time_slot) {
        return res.status(400).json({
          success: false,
          message: "Session, semester, day, and time_slot are required",
        })
      }

      if (room_id) {
        // Check specific room
        const isAvailable = await this.ttmsService.checkRoomAvailability(session, semester, day, time_slot, room_id)

        res.json({
          success: true,
          data: {
            room_id,
            available: isAvailable,
            day,
            time_slot,
          },
          message: `Room ${room_id} is ${isAvailable ? "available" : "not available"}`,
        })
      } else {
        // Get all available rooms
        const availableRooms = await this.ttmsService.checkRoomAvailability(session, semester, day, time_slot)

        // Apply building filter
        let filteredRooms = availableRooms
        if (building) {
          filteredRooms = availableRooms.filter((room) => room.building.toLowerCase().includes(building.toLowerCase()))
        }

        res.json({
          success: true,
          data: {
            available_rooms: filteredRooms,
            total_available: filteredRooms.length,
            day,
            time_slot,
            building: building || "all",
          },
          message: `Found ${filteredRooms.length} available rooms`,
        })
      }
    } catch (error) {
      console.error("Check availability error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to check availability",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/statistics - Get room statistics
  async getRoomStatistics(req, res) {
    try {
      const { session, semester } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      const statistics = await this.ttmsService.getRoomStatistics(session, semester)

      res.json({
        success: true,
        data: statistics,
        query: { session, semester },
        message: "Room statistics retrieved successfully",
      })
    } catch (error) {
      console.error("Get statistics error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get room statistics",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/students - Get students in room/subject
  async getStudentsInRoom(req, res) {
    try {
      const { admin_session_id, session, semester, subject_code, section } = req.query

      if (!admin_session_id || !session || !semester || !subject_code || !section) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, semester, subject_code, and section are required",
        })
      }

      const students = await this.ttmsService.getStudentsInSection(
        admin_session_id,
        session,
        semester,
        subject_code,
        section,
      )

      res.json({
        success: true,
        data: students,
        total: students.length,
        query: { session, semester, subject_code, section },
        message: "Students retrieved successfully",
      })
    } catch (error) {
      console.error("Get students error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get students",
        error: error.message,
      })
    }
  }

  // GET /api/rooms/conflicts - Find scheduling conflicts
  async findConflicts(req, res) {
    try {
      const { session, semester, day, time_slot } = req.query

      if (!session || !semester) {
        return res.status(400).json({
          success: false,
          message: "Session and semester are required",
        })
      }

      const allSchedules = await this.ttmsService.getAllSchedules(session, semester)
      const conflicts = []

      if (day && time_slot) {
        // Find conflicts for specific time
        const timeSlotSchedules = allSchedules.filter(
          (schedule) =>
            schedule.hari?.toLowerCase() === day.toLowerCase() &&
            this.ttmsService.isTimeConflict(time_slot, schedule.masa),
        )

        // Group by room to find conflicts
        const roomGroups = {}
        timeSlotSchedules.forEach((schedule) => {
          if (schedule.kod_ruang) {
            if (!roomGroups[schedule.kod_ruang]) {
              roomGroups[schedule.kod_ruang] = []
            }
            roomGroups[schedule.kod_ruang].push(schedule)
          }
        })

        // Find rooms with multiple bookings
        Object.entries(roomGroups).forEach(([roomId, schedules]) => {
          if (schedules.length > 1) {
            conflicts.push({
              room_id: roomId,
              day,
              time_slot,
              conflicting_schedules: schedules,
              conflict_count: schedules.length,
            })
          }
        })
      } else {
        // Find all conflicts
        const roomSchedules = {}
        allSchedules.forEach((schedule) => {
          if (schedule.kod_ruang && schedule.hari && schedule.masa) {
            const key = `${schedule.kod_ruang}_${schedule.hari}_${schedule.masa}`
            if (!roomSchedules[key]) {
              roomSchedules[key] = []
            }
            roomSchedules[key].push(schedule)
          }
        })

        Object.entries(roomSchedules).forEach(([key, schedules]) => {
          if (schedules.length > 1) {
            const [roomId, day, timeSlot] = key.split("_")
            conflicts.push({
              room_id: roomId,
              day,
              time_slot: timeSlot,
              conflicting_schedules: schedules,
              conflict_count: schedules.length,
            })
          }
        })
      }

      res.json({
        success: true,
        data: conflicts,
        total: conflicts.length,
        query: { session, semester, day, time_slot },
        message: `Found ${conflicts.length} scheduling conflicts`,
      })
    } catch (error) {
      console.error("Find conflicts error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to find conflicts",
        error: error.message,
      })
    }
  }

  // POST /api/rooms/cache/clear - Clear cache
  async clearCache(req, res) {
    try {
      this.ttmsService.clearCache()

      res.json({
        success: true,
        message: "Cache cleared successfully",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Clear cache error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to clear cache",
        error: error.message,
      })
    }
  }

  // Helper methods
  getDayName(dayIndex) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[dayIndex]
  }

  getCurrentTimeSlot(date) {
    const hour = date.getHours()
    const nextHour = hour + 1
    return `${hour.toString().padStart(2, "0")}:00-${nextHour.toString().padStart(2, "0")}:00`
  }

  groupSchedulesByDay(schedules) {
    const grouped = {}
    schedules.forEach((schedule) => {
      const day = schedule.hari || "unknown"
      if (!grouped[day]) {
        grouped[day] = []
      }
      grouped[day].push(schedule)
    })
    return grouped
  }
}

// Create controller instance
const roomController = new RoomController()

// Define routes
router.get("/auth", (req, res) => roomController.getAdminAuth(req, res))
router.get("/period", (req, res) => roomController.getCurrentPeriod(req, res))
router.get("/subjects", (req, res) => roomController.getSubjects(req, res))
router.get("/schedules", (req, res) => roomController.getAllSchedules(req, res))
router.get("/list", (req, res) => roomController.getRoomsList(req, res))
router.get("/:roomId/schedule", (req, res) => roomController.getRoomSchedule(req, res))
router.get("/availability/check", (req, res) => roomController.checkAvailability(req, res))
router.get("/statistics", (req, res) => roomController.getRoomStatistics(req, res))
router.get("/students", (req, res) => roomController.getStudentsInRoom(req, res))
router.get("/conflicts", (req, res) => roomController.findConflicts(req, res))
router.post("/cache/clear", (req, res) => roomController.clearCache(req, res))

module.exports = router
