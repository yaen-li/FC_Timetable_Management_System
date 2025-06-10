const lecturerService = require('./lecturerService');

class LecturerController {
  
  /**
   * Get all lecturers for current session
   * GET /api/lecturers
   */
  async getLecturers(req, res) {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const lecturers = await lecturerService.getAllLecturers(session_id);
      
      res.json({
        success: true,
        data: lecturers,
        count: lecturers.length
      });

    } catch (error) {
      console.error('Error in getLecturers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lecturers',
        error: error.message
      });
    }
  }

  /**
   * Get lecturer sections/subjects
   * GET /api/lecturers/:no_pekerja/sections
   */
  async getLecturerSections(req, res) {
    try {
      const { no_pekerja } = req.params;
      const { sesi, semester } = req.query;

      if (!no_pekerja) {
        return res.status(400).json({
          success: false,
          message: 'Staff number (no_pekerja) is required'
        });
      }

      const sections = await lecturerService.getLecturerSections(
        no_pekerja, 
        sesi, 
        semester
      );

      res.json({
        success: true,
        data: sections,
        lecturer_id: no_pekerja,
        count: sections.length
      });

    } catch (error) {
      console.error('Error in getLecturerSections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lecturer sections',
        error: error.message
      });
    }
  }

  /**
   * Get lecturer's detailed schedule/timetable
   * GET /api/lecturers/:no_pekerja/schedule
   */
  async getLecturerSchedule(req, res) {
    try {
      const { no_pekerja } = req.params;
      const { sesi, semester } = req.query;

      if (!no_pekerja) {
        return res.status(400).json({
          success: false,
          message: 'Staff number (no_pekerja) is required'
        });
      }

      const schedule = await lecturerService.getLecturerSchedule(
        no_pekerja,
        sesi,
        semester
      );

      res.json({
        success: true,
        data: schedule,
        lecturer_id: no_pekerja
      });

    } catch (error) {
      console.error('Error in getLecturerSchedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lecturer schedule',
        error: error.message
      });
    }
  }

  /**
   * Get current session information
   * GET /api/session/current
   */
  async getCurrentSession(req, res) {
    try {
      const sessionInfo = await lecturerService.getCurrentSession();
      
      res.json({
        success: true,
        data: sessionInfo
      });

    } catch (error) {
      console.error('Error in getCurrentSession:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current session',
        error: error.message
      });
    }
  }

  /**
   * Get admin authentication
   * POST /api/auth/admin
   */
  async getAdminAuth(req, res) {
    try {
      const { session_id } = req.body;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const adminAuth = await lecturerService.getAdminAuth(session_id);
      
      res.json({
        success: true,
        data: adminAuth
      });

    } catch (error) {
      console.error('Error in getAdminAuth:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to authenticate admin',
        error: error.message
      });
    }
  }

  /**
   * Search lecturers
   * GET /api/lecturers/search
   */
  async searchLecturers(req, res) {
    try {
      const { query, session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const lecturers = await lecturerService.searchLecturers(query, session_id);
      
      res.json({
        success: true,
        data: lecturers,
        query: query,
        count: lecturers.length
      });

    } catch (error) {
      console.error('Error in searchLecturers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search lecturers',
        error: error.message
      });
    }
  }

  /**
   * Get lecturer statistics
   * GET /api/lecturers/stats
   */
  async getLecturerStats(req, res) {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const stats = await lecturerService.getLecturerStats(session_id);
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error in getLecturerStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lecturer statistics',
        error: error.message
      });
    }
  }
}

module.exports = new LecturerController();