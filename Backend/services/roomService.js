// TTMS API Service
class TTMSService {
  constructor() {
    this.baseURL = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi"
    this.adminAuthURL = "http://web.fc.utm.my/ttms/auth-admin.php"
  }

  // Helper method to make API requests
  async fetchJSON(url) {
    console.log("[TTMS Service] Fetching:", url)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      console.log("[TTMS Service] Response:", json)
      return json
    } catch (error) {
      console.error("[TTMS Service] Fetch error:", error)
      throw error
    }
  }

  // Get admin session ID
  async getAdminSession(userSessionId) {
    const cacheKey = `admin_session_${userSessionId}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { adminSessionId, timestamp } = JSON.parse(cached)
      // Check if cache is still valid (24 hours)
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return adminSessionId
      }
    }

    const url = `${this.adminAuthURL}?session_id=${userSessionId}`
    const [adminAuth] = await this.fetchJSON(url)
    const adminSessionId = adminAuth.session_id

    // Cache the admin session
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        adminSessionId,
        timestamp: Date.now(),
      }),
    )

    return adminSessionId
  }

  // Get current session and semester
  async getCurrentPeriod() {
    const cacheKey = "current_session_period"
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache for 1 hour
      if (Date.now() - timestamp < 60 * 60 * 1000) {
        return data
      }
    }

    const url = `${this.baseURL}?entity=sesisemester`
    const [sessionData] = await this.fetchJSON(url)

    const result = {
      session: sessionData.sesi,
      semester: sessionData.semester,
    }

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: result,
        timestamp: Date.now(),
      }),
    )

    return result
  }

  // Get all subjects for a session/semester
  async getSubjects(session, semester) {
    const cacheKey = `subjects_${session}_${semester}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache for 30 minutes
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        return data
      }
    }

    const url = `${this.baseURL}?entity=subjek&sesi=${session}&semester=${semester}`
    const subjects = await this.fetchJSON(url)

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: subjects,
        timestamp: Date.now(),
      }),
    )

    return subjects
  }

  // Get schedule/timetable for a subject and section
  async getSubjectSchedule(session, semester, subjectCode, section) {
    const cacheKey = `schedule_${session}_${semester}_${subjectCode}_${section}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache for 15 minutes
      if (Date.now() - timestamp < 15 * 60 * 1000) {
        return data
      }
    }

    const url = `${this.baseURL}?entity=jadual_subjek&sesi=${session}&semester=${semester}&kod_subjek=${subjectCode}&seksyen=${section}`
    const schedule = await this.fetchJSON(url)

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: schedule,
        timestamp: Date.now(),
      }),
    )

    return schedule
  }

  // Get all schedules for room availability analysis
  async getAllSchedules(session, semester) {
    const cacheKey = `all_schedules_${session}_${semester}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache for 30 minutes
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        return data
      }
    }

    const url = `${this.baseURL}?entity=jadual_subjek&sesi=${session}&semester=${semester}`
    const schedules = await this.fetchJSON(url)

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: schedules,
        timestamp: Date.now(),
      }),
    )

    return schedules
  }

  // Get students in a subject section (requires admin session)
  async getStudentsInSection(adminSessionId, session, semester, subjectCode, section) {
    const cacheKey = `students_${session}_${semester}_${subjectCode}_${section}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Cache for 30 minutes
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        return data
      }
    }

    const url = `${this.baseURL}?entity=subjek_pelajar&session_id=${adminSessionId}&sesi=${session}&semester=${semester}&kod_subjek=${subjectCode}&seksyen=${section}`
    const students = await this.fetchJSON(url)

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: students,
        timestamp: Date.now(),
      }),
    )

    return students
  }

  // Get room information from schedules
  async getRoomsFromSchedules(session, semester) {
    const schedules = await this.getAllSchedules(session, semester)

    // Extract unique rooms from schedules
    const roomsMap = new Map()

    schedules.forEach((schedule) => {
      if (schedule.kod_ruang) {
        const roomKey = schedule.kod_ruang
        if (!roomsMap.has(roomKey)) {
          roomsMap.set(roomKey, {
            id: schedule.kod_ruang,
            name: schedule.kod_ruang,
            building: this.extractBuilding(schedule.kod_ruang),
            schedules: [],
          })
        }
        roomsMap.get(roomKey).schedules.push(schedule)
      }
    })

    return Array.from(roomsMap.values())
  }

  // Helper to extract building from room code
  extractBuilding(roomCode) {
    if (!roomCode) return "Unknown"

    // Common building prefixes in UTM
    const buildingMap = {
      A: "Block A",
      B: "Block B",
      C: "Block C",
      D: "Block D",
      E: "Block E",
      F: "Block F",
      G: "Block G",
      H: "Block H",
      K: "Block K",
      L: "Block L",
      M: "Block M",
      N: "Block N",
      P: "Block P",
      Q: "Block Q",
      R: "Block R",
      S: "Block S",
      T: "Block T",
      U: "Block U",
      V: "Block V",
      W: "Block W",
      X: "Block X",
      Y: "Block Y",
      Z: "Block Z",
    }

    const firstChar = roomCode.charAt(0).toUpperCase()
    return buildingMap[firstChar] || "Unknown Building"
  }

  // Check room availability for specific time slot
  async checkRoomAvailability(session, semester, day, timeSlot, roomCode = null) {
    const schedules = await this.getAllSchedules(session, semester)

    // Filter schedules by day and time
    const conflictingSchedules = schedules.filter((schedule) => {
      const scheduleDay = schedule.hari?.toLowerCase()
      const scheduleTime = schedule.masa

      return (
        scheduleDay === day.toLowerCase() &&
        this.isTimeConflict(timeSlot, scheduleTime) &&
        (roomCode ? schedule.kod_ruang === roomCode : true)
      )
    })

    if (roomCode) {
      // Check specific room
      return conflictingSchedules.length === 0
    } else {
      // Get all available rooms
      const allRooms = await this.getRoomsFromSchedules(session, semester)
      const occupiedRooms = new Set(conflictingSchedules.map((s) => s.kod_ruang))

      return allRooms.filter((room) => !occupiedRooms.has(room.id))
    }
  }

  // Helper to check time conflict
  isTimeConflict(requestedTime, scheduledTime) {
    if (!scheduledTime || !requestedTime) return false

    // Parse time slots (assuming format like "08:00-09:00")
    const parseTime = (timeStr) => {
      const [start, end] = timeStr.split("-")
      return {
        start: this.timeToMinutes(start),
        end: this.timeToMinutes(end),
      }
    }

    try {
      const requested = parseTime(requestedTime)
      const scheduled = parseTime(scheduledTime)

      // Check for overlap
      return !(requested.end <= scheduled.start || requested.start >= scheduled.end)
    } catch (error) {
      console.warn("Error parsing time:", error)
      return false
    }
  }

  // Convert time string to minutes
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Get room statistics
  async getRoomStatistics(session, semester) {
    const rooms = await this.getRoomsFromSchedules(session, semester)
    const schedules = await this.getAllSchedules(session, semester)

    const totalRooms = rooms.length
    const roomsWithSchedules = rooms.filter((room) => room.schedules.length > 0).length
    const totalScheduledSlots = schedules.length

    // Calculate utilization by building
    const buildingStats = {}
    rooms.forEach((room) => {
      const building = room.building
      if (!buildingStats[building]) {
        buildingStats[building] = { total: 0, scheduled: 0 }
      }
      buildingStats[building].total++
      if (room.schedules.length > 0) {
        buildingStats[building].scheduled++
      }
    })

    return {
      totalRooms,
      roomsWithSchedules,
      availableRooms: totalRooms - roomsWithSchedules,
      utilizationRate: totalRooms > 0 ? ((roomsWithSchedules / totalRooms) * 100).toFixed(2) : 0,
      totalScheduledSlots,
      buildingStats,
    }
  }

  // Clear all cache
  clearCache() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.includes("subjects_") ||
          key.includes("schedule_") ||
          key.includes("students_") ||
          key.includes("admin_session_") ||
          key.includes("current_session_") ||
          key.includes("all_schedules_"))
      ) {
        keys.push(key)
      }
    }
    keys.forEach((key) => localStorage.removeItem(key))
    console.log("[TTMS Service] Cleared cache:", keys.length, "items")
  }
}

// Export singleton instance
export default new TTMSService()
