const express = require("express")
const router = express.Router()
const StudentService = require("../services/studentService")

/**
 * Student Controller for TTMS Integration
 * Handles all student-related API endpoints
 */
class StudentController {
  constructor() {
    this.studentService = new StudentService()
  }

  /**
   * GET /api/students/auth - Get admin authentication
   */
  async getAdminAuth(req, res) {
    try {
      const { session_id } = req.query

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "User session_id is required",
        })
      }

      const adminSessionId = await this.studentService.getAdminSession(session_id)

      res.json({
        success: true,
        data: {
          admin_session_id: adminSessionId,
          expires_in: "15 minutes",
        },
        message: "Admin authentication successful for student access",
      })
    } catch (error) {
      console.error("Student admin auth error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to authenticate admin session for student access",
        error: error.message,
      })
    }
  }

  /**
   * GET /api/students/current-period - Get current academic period
   */
  async getCurrentPeriod(req, res) {
    try {
      const period = await this.studentService.getCurrentPeriod()

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

  /**
   * GET /api/students/section - Get students in a section
   */
  async getStudentsInSection(req, res) {
    try {
      const { admin_session_id, session, semester, subject_code, section, sort_by, filter_status } = req.query

      if (!admin_session_id || !session || !semester || !subject_code || !section) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, semester, subject_code, and section are required",
        })
      }

      // Get students using the TTMS API
      const students = await this.studentService.getStudentsInSection(
        admin_session_id,
        session,
        semester,
        subject_code,
        section,
      )

      // Apply status filter if provided
      let filteredStudents = students
      if (filter_status) {
        if (filter_status === "active") {
          filteredStudents = students.filter((s) => s.status === "-" || !s.status)
        } else if (filter_status === "inactive") {
          filteredStudents = students.filter((s) => s.status && s.status !== "-")
        }
      }

      // Apply sorting
      if (sort_by) {
        filteredStudents.sort((a, b) => {
          switch (sort_by) {
            case "name":
              return (a.nama || "").localeCompare(b.nama || "")
            case "id":
              return (a.no_kp || "").localeCompare(b.no_kp || "")
            case "program":
              return (a.kod_kursus || "").localeCompare(b.kod_kursus || "")
            case "year":
              return (a.tahun_kursus || 0) - (b.tahun_kursus || 0)
            case "faculty":
              return (a.kod_fakulti || "").localeCompare(b.kod_fakulti || "")
            default:
              return 0
          }
        })
      }

      // Calculate statistics
      const statistics = {
        total_students: students.length,
        active_students: students.filter((s) => s.status === "-" || !s.status).length,
        inactive_students: students.filter((s) => s.status && s.status !== "-").length,
        faculties: [...new Set(students.map((s) => s.kod_fakulti).filter(Boolean))],
        programs: [...new Set(students.map((s) => s.kod_kursus).filter(Boolean))],
        years: [...new Set(students.map((s) => s.tahun_kursus).filter(Boolean))],
      }

      res.json({
        success: true,
        data: {
          section_info: {
            subject_code,
            section,
            session,
            semester,
          },
          students: filteredStudents,
          statistics,
          filters_applied: { sort_by, filter_status },
        },
        total: filteredStudents.length,
        message: "Students in section retrieved successfully",
      })
    } catch (error) {
      console.error("Get students in section error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get students in section",
        error: error.message,
      })
    }
  }

  /**
   * GET /api/students/:studentId - Get student details by ID
   */
  async getStudentById(req, res) {
    try {
      const { studentId } = req.params
      const { admin_session_id, session, semester, subject_code } = req.query

      if (!admin_session_id || !session || !semester) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, and semester are required",
        })
      }

      const studentData = await this.studentService.getStudentById(
        admin_session_id,
        session,
        semester,
        studentId,
        subject_code,
      )

      if (!studentData.student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
          query: { studentId, session, semester, subject_code },
        })
      }

      res.json({
        success: true,
        data: studentData,
        message: "Student details retrieved successfully",
      })
    } catch (error) {
      console.error("Get student by ID error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get student details",
        error: error.message,
      })
    }
  }

  /**
   * GET /api/students/search - Search for students
   */
  async searchStudents(req, res) {
    try {
      const { admin_session_id, session, semester, query, search_type, subject_code, limit } = req.query

      if (!admin_session_id || !session || !semester || !query) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, semester, and query are required",
        })
      }

      const students = await this.studentService.searchStudents(
        admin_session_id,
        session,
        semester,
        query,
        search_type,
        subject_code,
      )

      // Apply limit if provided
      const limitedResults = limit ? students.slice(0, Number.parseInt(limit)) : students

      res.json({
        success: true,
        data: limitedResults,
        total: limitedResults.length,
        total_found: students.length,
        query: { query, search_type, subject_code, limit },
        message: `Found ${students.length} matching students${limit ? `, showing ${limitedResults.length}` : ""}`,
      })
    } catch (error) {
      console.error("Search students error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to search students",
        error: error.message,
      })
    }
  }

  /**
   * GET /api/students/statistics - Get student statistics
   */
  async getStudentStatistics(req, res) {
    try {
      const { admin_session_id, session, semester, subject_code } = req.query

      if (!admin_session_id || !session || !semester) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, and semester are required",
        })
      }

      const statistics = await this.studentService.getStudentStatistics(
        admin_session_id,
        session,
        semester,
        subject_code,
      )

      res.json({
        success: true,
        data: statistics,
        query: { session, semester, subject_code },
        message: "Student statistics retrieved successfully",
        note: "Statistics are based on a limited sample to prevent timeout",
      })
    } catch (error) {
      console.error("Get student statistics error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get student statistics",
        error: error.message,
      })
    }
  }

  /**
   * POST /api/students/export - Export student data
   */
  async exportStudentData(req, res) {
    try {
      const { admin_session_id, session, semester, subject_code, section, format = "json" } = req.body

      if (!admin_session_id || !session || !semester || !subject_code || !section) {
        return res.status(400).json({
          success: false,
          message: "admin_session_id, session, semester, subject_code, and section are required",
        })
      }

      const students = await this.studentService.getStudentsInSection(
        admin_session_id,
        session,
        semester,
        subject_code,
        section,
      )

      const exportData = this.studentService.formatStudentsForExport(students, format)

      res.json({
        success: true,
        data: exportData,
        format,
        filename: `students_${subject_code}_section_${section}_${session.replace("/", "-")}_sem${semester}.${format}`,
        total_records: students.length,
        message: "Export data generated successfully",
      })
    } catch (error) {
      console.error("Export student data error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to export student data",
        error: error.message,
      })
    }
  }

  /**
   * POST /api/students/cache/clear - Clear cache
   */
  async clearCache(req, res) {
    try {
      this.studentService.clearCache()

      res.json({
        success: true,
        message: "Student cache cleared successfully",
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
}

// Create controller instance
const studentController = new StudentController()

// Define routes
router.get("/auth", (req, res) => studentController.getAdminAuth(req, res))
router.get("/current-period", (req, res) => studentController.getCurrentPeriod(req, res))
router.get("/section", (req, res) => studentController.getStudentsInSection(req, res))
router.get("/search", (req, res) => studentController.searchStudents(req, res))
router.get("/statistics", (req, res) => studentController.getStudentStatistics(req, res))
router.get("/:studentId", (req, res) => studentController.getStudentById(req, res))
router.post("/export", (req, res) => studentController.exportStudentData(req, res))
router.post("/cache/clear", (req, res) => studentController.clearCache(req, res))

module.exports = router
