const fetch = require("node-fetch")

/**
 * Student Service for TTMS Integration
 * Handles all student-related API calls and data processing
 */
class StudentService {
  constructor() {
    this.baseURL = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi"
    this.adminAuthURL = "http://web.fc.utm.my/ttms/auth-admin.php"
    this.cache = new Map()
    this.cacheTimeout = 15 * 60 * 1000 // 15 minutes cache
  }

  /**
   * Make API request to TTMS
   * @param {string} url - Full URL to fetch
   * @returns {Promise<any>} - JSON response
   */
  async fetchJSON(url) {
    console.log("[Student Service] Fetching:", url)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      console.log("[Student Service] Response received:", Array.isArray(json) ? `${json.length} items` : "object")
      return json
    } catch (error) {
      console.error("[Student Service] Fetch error:", error)
      throw error
    }
  }

  /**
   * Set cache with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Get data from cache if valid
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null
   */
  getCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear()
    console.log("[Student Service] Cache cleared")
  }

  /**
   * Get admin session ID for authenticated requests
   * @param {string} userSessionId - User session ID from TTMS login
   * @returns {Promise<string>} - Admin session ID
   */
  async getAdminSession(userSessionId) {
    const cacheKey = `admin_session_${userSessionId}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    const url = `${this.adminAuthURL}?session_id=${userSessionId}`
    const [adminAuth] = await this.fetchJSON(url)
    const adminSessionId = adminAuth.session_id

    this.setCache(cacheKey, adminSessionId)
    return adminSessionId
  }

  /**
   * Get current academic period
   * @returns {Promise<{session: string, semester: string}>} - Current period
   */
  async getCurrentPeriod() {
    const cacheKey = "current_period"
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    const url = `${this.baseURL}?entity=sesisemester`
    const [sessionData] = await this.fetchJSON(url)

    const result = {
      session: sessionData.sesi,
      semester: sessionData.semester,
    }

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * Get all subjects for a session/semester
   * @param {string} session - Academic session (e.g., "2024/2025")
   * @param {string} semester - Semester number
   * @returns {Promise<Array>} - List of subjects
   */
  async getSubjects(session, semester) {
    const cacheKey = `subjects_${session}_${semester}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    const url = `${this.baseURL}?entity=subjek&sesi=${session}&semester=${semester}`
    const subjects = await this.fetchJSON(url)

    this.setCache(cacheKey, subjects)
    return subjects
  }

  /**
   * Get students in a section
   * @param {string} adminSessionId - Admin session ID
   * @param {string} session - Academic session
   * @param {string} semester - Semester number
   * @param {string} subjectCode - Subject code
   * @param {string} section - Section number
   * @returns {Promise<Array>} - List of students
   */
  async getStudentsInSection(adminSessionId, session, semester, subjectCode, section) {
    const cacheKey = `students_${session}_${semester}_${subjectCode}_${section}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    const url = `${this.baseURL}?entity=subjek_pelajar&session_id=${adminSessionId}&sesi=${session}&semester=${semester}&kod_subjek=${subjectCode}&seksyen=${section}`
    const students = await this.fetchJSON(url)

    this.setCache(cacheKey, students)
    return students
  }

  /**
   * Get student details by ID (searches across sections)
   * @param {string} adminSessionId - Admin session ID
   * @param {string} session - Academic session
   * @param {string} semester - Semester number
   * @param {string} studentId - Student ID to search for
   * @param {string} [subjectCode] - Optional subject code to limit search
   * @returns {Promise<{student: Object, enrollments: Array}>} - Student details and enrollments
   */
  async getStudentById(adminSessionId, session, semester, studentId, subjectCode = null) {
    // First get subjects to search through
    let subjects = await this.getSubjects(session, semester)
    subjects = subjects.filter((subject) => subject.bil_seksyen > 0)

    // If subject code is provided, limit search to that subject
    if (subjectCode) {
      subjects = subjects.filter((subject) => subject.kod_subjek === subjectCode)
    }

    // Limit search to prevent timeout (max 10 subjects)
    const subjectsToSearch = subjects.slice(0, 10)
    const enrollments = []
    let studentDetails = null

    // Search for student in each subject's sections
    for (const subject of subjectsToSearch) {
      for (let section = 1; section <= Math.min(subject.bil_seksyen, 3); section++) {
        try {
          const students = await this.getStudentsInSection(
            adminSessionId,
            session,
            semester,
            subject.kod_subjek,
            section.toString(),
          )

          const studentMatch = students.find((student) => student.no_kp === studentId)
          if (studentMatch) {
            // Store student details if not already found
            if (!studentDetails) {
              studentDetails = { ...studentMatch }
            }

            // Add enrollment info
            enrollments.push({
              subject_code: subject.kod_subjek,
              subject_name: subject.nama_subjek,
              section: section.toString(),
              credit_hours: subject.jam_kredit || 0,
            })
          }
        } catch (error) {
          console.warn(`Error searching ${subject.kod_subjek} section ${section}:`, error.message)
        }
      }
    }

    return {
      student: studentDetails,
      enrollments,
      total_enrollments: enrollments.length,
      total_credit_hours: enrollments.reduce((sum, enrollment) => sum + enrollment.credit_hours, 0),
    }
  }

  /**
   * Search for students by name, ID, program, or faculty
   * @param {string} adminSessionId - Admin session ID
   * @param {string} session - Academic session
   * @param {string} semester - Semester number
   * @param {string} query - Search query
   * @param {string} [searchType="all"] - Search type (name, id, program, faculty, all)
   * @param {string} [subjectCode] - Optional subject code to limit search
   * @returns {Promise<Array>} - List of matching students
   */
  async searchStudents(adminSessionId, session, semester, query, searchType = "all", subjectCode = null) {
    const searchResults = []

    // Get subjects to search through
    let subjects = await this.getSubjects(session, semester)
    subjects = subjects.filter((subject) => subject.bil_seksyen > 0)

    // If subject code is provided, limit search to that subject
    if (subjectCode) {
      subjects = subjects.filter((subject) => subject.kod_subjek === subjectCode)
    }

    // Limit search to prevent timeout (max 10 subjects)
    const subjectsToSearch = subjects.slice(0, 10)

    for (const subject of subjectsToSearch) {
      for (let section = 1; section <= Math.min(subject.bil_seksyen, 3); section++) {
        try {
          const students = await this.getStudentsInSection(
            adminSessionId,
            session,
            semester,
            subject.kod_subjek,
            section.toString(),
          )

          const matchingStudents = this.filterStudentsByQuery(students, query, searchType)

          matchingStudents.forEach((student) => {
            searchResults.push({
              ...student,
              subject_code: subject.kod_subjek,
              subject_name: subject.nama_subjek,
              section_number: section.toString(),
            })
          })
        } catch (error) {
          console.warn(`Error searching ${subject.kod_subjek} section ${section}:`, error.message)
        }
      }
    }

    // Remove duplicates based on student ID
    const uniqueResults = searchResults.filter(
      (student, index, self) => index === self.findIndex((s) => s.no_kp === student.no_kp),
    )

    return uniqueResults
  }

  /**
   * Get student statistics
   * @param {string} adminSessionId - Admin session ID
   * @param {string} session - Academic session
   * @param {string} semester - Semester number
   * @param {string} [subjectCode] - Optional subject code to limit statistics
   * @returns {Promise<Object>} - Student statistics
   */
  async getStudentStatistics(adminSessionId, session, semester, subjectCode = null) {
    // Get subjects to analyze
    let subjects = await this.getSubjects(session, semester)
    subjects = subjects.filter((subject) => subject.bil_seksyen > 0)

    // If subject code is provided, limit to that subject
    if (subjectCode) {
      subjects = subjects.filter((subject) => subject.kod_subjek === subjectCode)
    }

    // Limit analysis to prevent timeout (max 5 subjects)
    const subjectsToAnalyze = subjects.slice(0, 5)

    const stats = {
      total_students: 0,
      active_students: 0,
      inactive_students: 0,
      faculty_distribution: {},
      program_distribution: {},
      year_distribution: {},
      subjects_analyzed: subjectsToAnalyze.length,
      subject_details: [],
    }

    // Track unique students to avoid counting duplicates
    const uniqueStudentIds = new Set()

    for (const subject of subjectsToAnalyze) {
      const subjectStats = {
        subject_code: subject.kod_subjek,
        subject_name: subject.nama_subjek,
        total_sections: subject.bil_seksyen,
        total_students: 0,
        sections: [],
      }

      for (let section = 1; section <= subject.bil_seksyen; section++) {
        try {
          const students = await this.getStudentsInSection(
            adminSessionId,
            session,
            semester,
            subject.kod_subjek,
            section.toString(),
          )

          const sectionStats = {
            section_number: section,
            student_count: students.length,
            active_count: students.filter((s) => s.status === "-" || !s.status).length,
            inactive_count: students.filter((s) => s.status && s.status !== "-").length,
          }

          subjectStats.sections.push(sectionStats)
          subjectStats.total_students += students.length

          // Update global statistics
          students.forEach((student) => {
            // Only count each student once for global stats
            if (!uniqueStudentIds.has(student.no_kp)) {
              uniqueStudentIds.add(student.no_kp)

              stats.total_students++

              if (student.status === "-" || !student.status) {
                stats.active_students++
              } else {
                stats.inactive_students++
              }

              // Update distributions
              if (student.kod_fakulti) {
                stats.faculty_distribution[student.kod_fakulti] =
                  (stats.faculty_distribution[student.kod_fakulti] || 0) + 1
              }

              if (student.kod_kursus) {
                stats.program_distribution[student.kod_kursus] =
                  (stats.program_distribution[student.kod_kursus] || 0) + 1
              }

              if (student.tahun_kursus) {
                stats.year_distribution[student.tahun_kursus] = (stats.year_distribution[student.tahun_kursus] || 0) + 1
              }
            }
          })
        } catch (error) {
          console.warn(`Error analyzing ${subject.kod_subjek} section ${section}:`, error.message)
        }
      }

      stats.subject_details.push(subjectStats)
    }

    return stats
  }

  /**
   * Filter students by search query
   * @param {Array} students - List of students
   * @param {string} query - Search query
   * @param {string} searchType - Search type
   * @returns {Array} - Filtered students
   */
  filterStudentsByQuery(students, query, searchType = "all") {
    const searchQuery = query.toLowerCase()

    return students.filter((student) => {
      switch (searchType) {
        case "name":
          return student.nama?.toLowerCase().includes(searchQuery)
        case "id":
          return student.no_kp?.toLowerCase().includes(searchQuery)
        case "program":
          return student.kod_kursus?.toLowerCase().includes(searchQuery)
        case "faculty":
          return student.kod_fakulti?.toLowerCase().includes(searchQuery)
        default: // 'all'
          return (
            student.nama?.toLowerCase().includes(searchQuery) ||
            student.no_kp?.toLowerCase().includes(searchQuery) ||
            student.kod_kursus?.toLowerCase().includes(searchQuery) ||
            student.kod_fakulti?.toLowerCase().includes(searchQuery)
          )
      }
    })
  }

  /**
   * Format student data for export
   * @param {Array} students - List of students
   * @param {string} format - Export format (json, csv, excel)
   * @returns {string|Object} - Formatted data
   */
  formatStudentsForExport(students, format = "json") {
    if (format === "json") {
      return students.map((student, index) => ({
        no: index + 1,
        student_id: student.no_kp || "N/A",
        name: student.nama || "N/A",
        program: student.kod_kursus || "N/A",
        year: student.tahun_kursus || "N/A",
        faculty: student.kod_fakulti || "N/A",
        status: student.status === "-" || !student.status ? "ACTIVE" : student.status,
      }))
    } else if (format === "csv") {
      const csvHeader = ["No", "Student ID", "Name", "Program", "Year", "Faculty", "Status"]
      const csvRows = students.map((student, index) => [
        index + 1,
        student.no_kp || "N/A",
        student.nama || "N/A",
        student.kod_kursus || "N/A",
        student.tahun_kursus || "N/A",
        student.kod_fakulti || "N/A",
        student.status === "-" || !student.status ? "ACTIVE" : student.status,
      ])

      return [csvHeader, ...csvRows].map((row) => row.join(",")).join("\n")
    }

    // Default to JSON
    return students
  }
}

module.exports = StudentService
