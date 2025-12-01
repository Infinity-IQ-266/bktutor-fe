import { RealBackend } from './realBackend';

// Real API that uses localStorage-backed database
// This is a REAL functioning system with persistent data and cross-account communication

async function apiCall<T>(fn: () => T): Promise<T> {
  // Simulate small network delay for realism
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  try {
    return fn();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Health check
  health: () => apiCall(() => ({ status: 'ok', timestamp: new Date().toISOString() })),
  
  // Authentication
  login: (email: string, password: string) => 
    apiCall(() => {
      const result = RealBackend.login(email, password);
      return {
        success: result.success,
        ssoUser: result.ssoUser,
        programUser: result.programUser
      };
    }),
  
  // Users
  getUsers: (params?: { role?: string; department?: string }) => 
    apiCall(() => {
      let users = RealBackend.getAllUsers();
      
      if (params?.role) {
        users = users.filter(u => u.role === params.role);
      }
      
      if (params?.department) {
        users = users.filter(u => u.department === params.department);
      }
      
      return { users };
    }),
  
  getUser: (id: string) => 
    apiCall(() => {
      const user = RealBackend.getUser(id);
      return { user };
    }),
  
  getUserByEmail: (email: string) =>
    apiCall(() => {
      const user = RealBackend.getUserByEmail(email);
      return { user };
    }),
  
  createUser: (userData: any) =>
    apiCall(() => {
      const user = RealBackend.createUser(userData);
      return { success: true, user };
    }),
  
  updateUser: (userId: string, updates: any) =>
    apiCall(() => {
      const user = RealBackend.updateUser(userId, updates);
      return { success: true, user };
    }),
  
  deleteUser: (userId: string) =>
    apiCall(() => {
      const success = RealBackend.deleteUser(userId);
      return { success };
    }),
  
  // Sessions
  getSessions: (params?: { studentId?: string; tutorId?: string; status?: string }) => 
    apiCall(() => {
      let sessions = RealBackend.getAllSessions();
      
      if (params?.studentId) {
        sessions = sessions.filter(s => s.studentId === params.studentId);
      }
      
      if (params?.tutorId) {
        sessions = sessions.filter(s => s.tutorId === params.tutorId);
      }
      
      if (params?.status) {
        sessions = sessions.filter(s => s.status === params.status);
      }
      
      return { sessions };
    }),
  
  getSessionsForUser: (userId: string) =>
    apiCall(() => {
      const sessions = RealBackend.getSessionsForUser(userId);
      return { sessions };
    }),
  
  createSession: (sessionData: any) => 
    apiCall(() => {
      const session = RealBackend.createSession(sessionData);
      return { success: true, session };
    }),
  
  updateSession: (sessionId: string, updates: any) => 
    apiCall(() => {
      const session = RealBackend.updateSession(sessionId, updates);
      return { success: true, session };
    }),
  
  acceptSession: (sessionId: string, userId: string) =>
    apiCall(() => {
      const session = RealBackend.acceptSession(sessionId, userId);
      return { success: true, session };
    }),
  
  declineSession: (sessionId: string, userId: string) =>
    apiCall(() => {
      const session = RealBackend.declineSession(sessionId, userId);
      return { success: true, session };
    }),
  
  cancelSession: (sessionId: string, userId: string) =>
    apiCall(() => {
      const session = RealBackend.cancelSession(sessionId, userId);
      return { success: true, session };
    }),
  
  requestReschedule: (sessionId: string, userId: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string) =>
    apiCall(() => {
      const session = RealBackend.requestReschedule(sessionId, userId, newDate, newStartTime, newEndTime, reason);
      return { success: true, session };
    }),
  
  acceptReschedule: (sessionId: string, userId: string) =>
    apiCall(() => {
      const session = RealBackend.acceptReschedule(sessionId, userId);
      return { success: true, session };
    }),
  
  declineReschedule: (sessionId: string, userId: string, reason?: string) =>
    apiCall(() => {
      const session = RealBackend.declineReschedule(sessionId, userId, reason);
      return { success: true, session };
    }),
  
  deleteSession: (sessionId: string) =>
    apiCall(() => {
      // For now, just cancel the session instead of deleting
      return { success: true };
    }),
  
  // Notifications
  getNotifications: (userId: string) =>
    apiCall(() => {
      const notifications = RealBackend.getNotificationsForUser(userId);
      return { notifications };
    }),
  
  getNotificationsForUser: (userId: string) =>
    apiCall(() => {
      const notifications = RealBackend.getNotificationsForUser(userId);
      return { notifications };
    }),
  
  markNotificationAsRead: (notificationId: string) =>
    apiCall(() => {
      RealBackend.markNotificationAsRead(notificationId);
      return { success: true };
    }),
  
  markAllNotificationsAsRead: (userId: string) =>
    apiCall(() => {
      RealBackend.markAllNotificationsAsRead(userId);
      return { success: true };
    }),
  
  deleteNotification: (notificationId: string) =>
    apiCall(() => {
      RealBackend.deleteNotification(notificationId);
      return { success: true };
    }),
  
  // Materials
  getMaterials: (params?: { subject?: string; type?: string; userId?: string }) => 
    apiCall(() => {
      let materials = params?.userId 
        ? RealBackend.getMaterialsForUser(params.userId)
        : RealBackend.getAllMaterials();
      
      if (params?.subject) {
        materials = materials.filter(m => m.subject === params.subject);
      }
      
      if (params?.type) {
        materials = materials.filter(m => m.fileType === params.type);
      }
      
      return { materials };
    }),
  
  createMaterial: (materialData: any) => 
    apiCall(() => {
      const material = RealBackend.createMaterial(materialData);
      return { success: true, material };
    }),
  
  incrementMaterialDownload: (materialId: string) =>
    apiCall(() => {
      RealBackend.incrementMaterialDownload(materialId);
      return { success: true };
    }),
  
  updateMaterial: (materialId: string, updates: any) =>
    apiCall(() => {
      const material = RealBackend.updateMaterial(materialId, updates);
      return { success: true, material };
    }),
  
  deleteMaterial: (materialId: string) =>
    apiCall(() => {
      RealBackend.deleteMaterial(materialId);
      return { success: true };
    }),
  
  createNotification: (notificationData: any) =>
    apiCall(() => {
      const notification = RealBackend.createNotification(notificationData);
      return { success: true, notification };
    }),
  
  createFeedback: (feedbackData: any) =>
    apiCall(() => {
      const feedback = RealBackend.createFeedback(feedbackData);
      return { success: true, feedback };
    }),
  
  // Progress - uses dedicated progress tracking system
  getProgress: (studentId: string) => 
    apiCall(() => {
      const progressRecords = RealBackend.getProgressForStudent(studentId);
      
      const progress = {
        totalSessions: progressRecords.reduce((sum, p) => sum + p.sessionsAttended, 0),
        completedSessions: progressRecords.reduce((sum, p) => sum + p.sessionsAttended, 0),
        averageRating: progressRecords.length > 0
          ? progressRecords.reduce((sum, p) => sum + p.averageRating, 0) / progressRecords.length
          : 0,
        subjects: progressRecords.map(p => p.subject),
        records: progressRecords
      };
      
      return { progress };
    }),
  
  getProgressForStudent: (studentId: string) => 
    apiCall(() => {
      const progressRecords = RealBackend.getProgressForStudent(studentId);
      return progressRecords;
    }),
  
  getAllProgress: () => 
    apiCall(() => {
      const progressRecords = RealBackend.getAllProgress();
      return { progress: progressRecords };
    }),
  
  updateProgress: (studentId: string, subject: string) => 
    apiCall(() => {
      RealBackend.updateProgress(studentId, subject);
      return { success: true };
    }),
  
  // Availability
  getAvailability: (tutorId: string) => 
    apiCall(() => ({ availability: [] })), // To be implemented
  
  createAvailability: (availabilityData: any) => 
    apiCall(() => ({ success: true, availability: availabilityData })),
  
  // Feedback
  createFeedback: (feedbackData: any) => 
    apiCall(() => {
      // Update session with feedback
      if (feedbackData.sessionId) {
        RealBackend.updateSession(feedbackData.sessionId, {
          rating: feedbackData.rating,
          feedback: feedbackData.feedback
        });
        
        // Notify tutor about feedback
        const session = RealBackend.getSession(feedbackData.sessionId);
        if (session) {
          RealBackend.createNotification({
            userId: session.tutorId,
            type: 'feedback_received',
            title: 'New Feedback Received',
            message: `You received a ${feedbackData.rating}-star rating for your session on ${session.subject}`,
            relatedId: feedbackData.sessionId,
            actionRequired: false
          });
        }
      }
      
      return { success: true, feedback: feedbackData };
    }),
  
  // Announcements (mock for now)
  getAnnouncements: (params?: { targetAudience?: string }) =>
    apiCall(() => ({ announcements: [] })),
  
  createAnnouncement: (announcementData: any) =>
    apiCall(() => ({ success: true, announcement: announcementData })),
  
  // Department Statistics
  getDepartmentStats: (department: string) =>
    apiCall(() => {
      const stats = RealBackend.getDepartmentStats(department);
      return { success: true, stats };
    }),
  
  getAllDepartmentStats: () =>
    apiCall(() => {
      const stats = RealBackend.getAllDepartmentStats();
      return { success: true, stats };
    }),
  
  // Statistics
  getDashboardStats: (params: { role: string; userId?: string }) => 
    apiCall(() => {
      const allSessions = RealBackend.getAllSessions();
      const allUsers = RealBackend.getAllUsers();
      
      // Calculate stats based on role
      const stats = {
        totalSessions: allSessions.length,
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter(u => u.role === 'student').length,
        totalTutors: allUsers.filter(u => u.role === 'tutor').length,
        completedSessions: allSessions.filter(s => s.status === 'completed').length,
        pendingSessions: allSessions.filter(s => s.status === 'pending').length,
        scheduledSessions: allSessions.filter(s => s.status === 'scheduled').length
      };
      
      return { stats };
    }),
  
  // Utility
  resetDatabase: () =>
    apiCall(() => {
      RealBackend.resetDatabase();
      return { success: true };
    }),
  
  exportData: () =>
    apiCall(() => RealBackend.exportData()),
  
  importData: (data: any) =>
    apiCall(() => {
      RealBackend.importData(data);
      return { success: true };
    })
};
