const axios = require('axios');

class LecturerService {
  constructor() {
    this.TTMS_API = 'http://web.fc.utm.my/ttms/web_man_webservice_json.cgi';
    this.ADMIN_AUTH_API = 'http://web.fc.utm.my/ttms/auth-admin.php';
    
    // Cache configuration
    this.cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generic fetch method with caching
   */
  async fetchWithCache(url, cacheKey = null) {
    const key = cacheKey || url;
    
    // Check cache first
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`[LecturerService] Cache hit for: ${key}`);
        return cached.data;
      }
    }

    try {
      console.log(`[LecturerService] Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'TTMS-Backend/1.0'
        }
      });

      const data = response.data;
      
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`[LecturerService] Error fetching ${url}:`, error.message);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  /**
   * Get current session information
   */
  async getCurrentSession() {
    const url = `${this.TTMS_API}?entity=sesisemester`;
    const data = await this.fetchWithCache(url, 'current_session');
    
    // Return the first session data
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Get admin authentication session
   */
  async getAdminAuth(sessionId) {
    const url = `${this.ADMIN_AUTH_API}?session_id=${sessionId}`;
    const data = await this.fetchWithCache(url, `admin_auth_${sessionId}`);
    
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Get all lecturers for current session
   */
  async getAllLecturers(sessionId) {
    try {
      // First get current session
      const sessionInfo = await this.getCurrentSession();
      
      // Get admin auth
      const adminAuth = await this.getAdminAuth(sessionId);
      
      // Fetch lecturers
      const url = `${this.TTMS_API}?entity=pensyarah&session_id=${adminAuth.session_id}&sesi=${sessionInfo.sesi}&semester=${sessionInfo.semester}`;
      const lecturers = await this.fetchWithCache(url, `lecturers_${sessionId}`);
      
      return Array.isArray(lecturers) ? lecturers : [];
      
    } catch (error) {
      console.error('[LecturerService] Error in getAllLecturers:', error);
      throw error;
    }
  }

  /**
   * Get lecturer sections/subjects
   */
  async getLecturerSections(noPekerja, sesi = null, semester = null) {
    try {
      // If session info not provided, get current session
      let sessionInfo = { sesi, semester };
      if (!sesi || !semester) {
        sessionInfo = await this.getCurrentSession();
      }

      const url = `${this.TTMS_API}?entity=pensyarah_subjek&no_pekerja=${noPekerja}`;
      const allSections = await this.fetchWithCache(url, `lecturer_sections_${noPekerja}`);
      
      // Filter for current session
      const currentSections = allSections.filter(subject => 
        String(subject.sesi) === String(sessionInfo.sesi) &&
        String(subject.semester) === String(sessionInfo.semester)
      );

      return currentSections;
      
    } catch (error) {
      console.error('[LecturerService] Error in getLecturerSections:', error);
      throw error;
    }
  }

  /**
   * Get lecturer's detailed schedule/timetable
   */
  async getLecturerSchedule(noPekerja, sesi = null, semester = null) {
    try {
      // Get lecturer sections first
      const sections = await this.getLecturerSections(noPekerja, sesi, semester);
      
      // If session info not provided, get current session
      let sessionInfo = { sesi, semester };
      if (!sesi || !semester) {
        sessionInfo = await this.getCurrentSession();
      }

      const timetableData = {};
      const dayMap = { 1: 'SUN', 2: 'MON', 3: 'TUE', 4: 'WED', 5: 'THU', 6: 'FRI', 7: 'SAT' };

      // Build timetable from sections
      for (const section of sections) {
        const scheduleUrl = `${this.TTMS_API}?entity=jadual_subjek&sesi=${sessionInfo.sesi}&semester=${sessionInfo.semester}&kod_subjek=${section.kod_subjek}&seksyen=${section.seksyen}`;
        
        try {
          const scheduleList = await this.fetchWithCache(
            scheduleUrl, 
            `schedule_${section.kod_subjek}_${section.seksyen}_${sessionInfo.sesi}_${sessionInfo.semester}`
          );

          for (const item of scheduleList) {
            const day = dayMap[item.hari];
            const slot = String(item.masa);
            
            if (!timetableData[day]) {
              timetableData[day] = {};
            }
            
            timetableData[day][slot] = {
              subject: section.kod_subjek,
              subject_name: section.nama_subjek,
              venue: item.ruang ? item.ruang.nama_ruang_singkatan : 'TBA',
              section: section.seksyen,
              students: section.bil_pelajar,
              faculty: section.kod_fakulti
            };
          }
        } catch (scheduleError) {
          console.warn(`[LecturerService] Failed to fetch schedule for ${section.kod_subjek}-${section.seksyen}:`, scheduleError.message);
        }
      }

      return {
        lecturer_id: noPekerja,
        session: sessionInfo,
        timetable: timetableData,
        total_sections: sections.length
      };
      
    } catch (error) {
      console.error('[LecturerService] Error in getLecturerSchedule:', error);
      throw error;
    }
  }

  /**
   * Search lecturers by name or staff number
   */
  async searchLecturers(query, sessionId) {
    try {
      const allLecturers = await this.getAllLecturers(sessionId);
      
      if (!query || query.trim() === '') {
        return allLecturers;
      }

      const searchTerm = query.toLowerCase().trim();
      
      return allLecturers.filter(lecturer => 
        lecturer.nama.toLowerCase().includes(searchTerm) ||
        String(lecturer.no_pekerja).includes(searchTerm)
      );
      
    } catch (error) {
      console.error('[LecturerService] Error in searchLecturers:', error);
      throw error;
    }
  }

  /**
   * Get lecturer statistics
   */
  async getLecturerStats(sessionId) {
    try {
      const lecturers = await this.getAllLecturers(sessionId);
      
      const stats = {
        total_lecturers: lecturers.length,
        total_students: lecturers.reduce((sum, lecturer) => sum + lecturer.bil_pelajar, 0),
        total_subjects: lecturers.reduce((sum, lecturer) => sum + lecturer.bil_subjek, 0),
        total_sections: lecturers.reduce((sum, lecturer) => sum + lecturer.bil_seksyen, 0),
        average_students_per_lecturer: 0,
        average_subjects_per_lecturer: 0,
        average_sections_per_lecturer: 0
      };

      if (lecturers.length > 0) {
        stats.average_students_per_lecturer = Math.round(stats.total_students / lecturers.length);
        stats.average_subjects_per_lecturer = Math.round(stats.total_subjects / lecturers.length);
        stats.average_sections_per_lecturer = Math.round(stats.total_sections / lecturers.length);
      }

      // Faculty distribution
      const facultyStats = {};
      lecturers.forEach(lecturer => {
        // This would need to be enhanced based on available lecturer data
        // For now, we'll just count lecturers
      });

      stats.faculty_distribution = facultyStats;
      
      return stats;
      
    } catch (error) {
      console.error('[LecturerService] Error in getLecturerStats:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(pattern = null) {
    if (pattern) {
      // Clear specific cache entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
    console.log('[LecturerService] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      total_entries: this.cache.size,
      entries: Array.from(this.cache.keys()),
      ttl_minutes: this.CACHE_TTL / (60 * 1000)
    };
  }
}

module.exports = new LecturerService();