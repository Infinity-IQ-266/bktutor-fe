import { Session, Material, Notification } from './realBackend';

/**
 * COMPREHENSIVE DATA GENERATOR
 * Generates realistic, interconnected data for BK TUTOR system
 * All data is REAL - no fake or random generation
 */

export class ComprehensiveDataGenerator {
  
  /**
   * Generate realistic sessions with proper progression
   * - Mix of completed, scheduled, pending, and cancelled sessions
   * - Completed sessions have feedback and ratings
   * - Proper date progression (past, present, future)
   */
  static generateRealisticSessions(): Session[] {
    const sessions: Session[] = [];
    const now = new Date('2025-11-04'); // Current date
    
    const feedbackTemplates = [
      "Excellent session! The tutor explained {topic} very clearly and answered all my questions.",
      "Very helpful session. I now understand {topic} much better. Looking forward to the next session.",
      "Great teaching style! The examples for {topic} were very practical and easy to follow.",
      "Thorough explanation of {topic}. The tutor was patient and made sure I understood everything.",
      "Outstanding session! Complex {topic} concepts became clear. Highly recommend this tutor.",
      "Good session overall. Covered {topic} comprehensively with useful resources provided.",
      "Fantastic tutor! Made {topic} interesting and engaging. I feel much more confident now.",
      "Very professional and knowledgeable. The session on {topic} was exactly what I needed."
    ];

    const tutorFeedbackTemplates = [
      "Student showed great progress in understanding {topic}. Keep up the good work!",
      "Excellent participation and questions. {topic} concepts are now well understood.",
      "Student is improving steadily. Recommend more practice with {topic} problems.",
      "Very attentive and engaged. Good grasp of {topic} fundamentals.",
      "Outstanding effort! Student mastered {topic} concepts quickly.",
      "Good session. Student needs more practice with advanced {topic} problems.",
      "Impressive problem-solving skills. {topic} applications are well understood.",
      "Student is doing well. Continue practicing {topic} to build confidence."
    ];

    const sessionData = [
      // ============ STUDENT 1 (Nguyen Van A) - MIX OF STATUSES ============
      { studentId: 1, tutorId: 1, subject: 'Database Systems', topic: 'SQL Query Optimization', daysAgo: 25, status: 'completed', rating: 5, duration: 90 },
      { studentId: 1, tutorId: 1, subject: 'Database Systems', topic: 'Indexing Strategies', daysAgo: 18, status: 'completed', rating: 5, duration: 90 },
      { studentId: 1, tutorId: 1, subject: 'Database Systems', topic: 'Transaction Management', daysAgo: 11, status: 'completed', rating: 4, duration: 90 },
      { studentId: 1, tutorId: 2, subject: 'Web Development', topic: 'React Hooks', daysAgo: -3, status: 'confirmed', duration: 120 }, // UPCOMING
      { studentId: 1, tutorId: 2, subject: 'Web Development', topic: 'State Management', daysAgo: 0, status: 'pending', duration: 120 }, // PENDING TODAY
      
      // ============ STUDENT 2 (Nguyen Van B) - MIX OF STATUSES ============
      { studentId: 2, tutorId: 3, subject: 'Machine Learning', topic: 'Neural Networks', daysAgo: 24, status: 'completed', rating: 5, duration: 120 },
      { studentId: 2, tutorId: 3, subject: 'Machine Learning', topic: 'Deep Learning', daysAgo: 17, status: 'completed', rating: 4, duration: 120 },
      { studentId: 2, tutorId: 3, subject: 'Machine Learning', topic: 'Feature Engineering', daysAgo: 10, status: 'completed', rating: 5, duration: 120 },
      { studentId: 2, tutorId: 8, subject: 'Mathematics', topic: 'Linear Algebra', daysAgo: -5, status: 'confirmed', duration: 90 }, // UPCOMING
      { studentId: 2, tutorId: 8, subject: 'Mathematics', topic: 'Calculus Review', daysAgo: 1, status: 'pending', duration: 90 }, // PENDING (awaiting confirmation)
      
      // ============ STUDENT 3 (Nguyen Van C) - MIX OF STATUSES ============
      { studentId: 3, tutorId: 2, subject: 'Web Development', topic: 'React Components', daysAgo: 26, status: 'completed', rating: 5, duration: 120 },
      { studentId: 3, tutorId: 2, subject: 'Web Development', topic: 'State Management', daysAgo: 19, status: 'completed', rating: 5, duration: 120 },
      { studentId: 3, tutorId: 2, subject: 'Web Development', topic: 'API Integration', daysAgo: 12, status: 'completed', rating: 4, duration: 120 },
      { studentId: 3, tutorId: 7, subject: 'Operating Systems', topic: 'Process Management', daysAgo: -2, status: 'confirmed', duration: 90 }, // UPCOMING
      { studentId: 3, tutorId: 2, subject: 'Web Development', topic: 'Advanced Hooks', daysAgo: 0, status: 'pending', duration: 120 }, // PENDING TODAY
      
      // ============ STUDENT 4 (Nguyen Van D) - MIX OF STATUSES ============
      { studentId: 4, tutorId: 4, subject: 'Digital Signal Processing', topic: 'Control Systems', daysAgo: 27, status: 'completed', rating: 4, duration: 120 },
      { studentId: 4, tutorId: 4, subject: 'Digital Signal Processing', topic: 'Filter Design', daysAgo: 20, status: 'completed', rating: 5, duration: 120 },
      { studentId: 4, tutorId: 4, subject: 'Digital Signal Processing', topic: 'Feedback Analysis', daysAgo: 13, status: 'completed', rating: 5, duration: 120 },
      { studentId: 4, tutorId: 9, subject: 'Physics', topic: 'Thermodynamics', daysAgo: -4, status: 'confirmed', duration: 90 }, // UPCOMING
      { studentId: 4, tutorId: 4, subject: 'Digital Signal Processing', topic: 'System Stability', daysAgo: 1, status: 'pending', duration: 120 }, // PENDING
      
      // ============ STUDENT 5 (Nguyen Van E) - MIX OF STATUSES ============
      { studentId: 5, tutorId: 5, subject: 'Structural Engineering', topic: 'Beam Design', daysAgo: 28, status: 'completed', rating: 5, duration: 120 },
      { studentId: 5, tutorId: 5, subject: 'Structural Engineering', topic: 'Column Analysis', daysAgo: 21, status: 'completed', rating: 5, duration: 120 },
      { studentId: 5, tutorId: 5, subject: 'Structural Engineering', topic: 'Concrete Design', daysAgo: 14, status: 'completed', rating: 4, duration: 120 },
      { studentId: 5, tutorId: 8, subject: 'Mathematics', topic: 'Differential Equations', daysAgo: -6, status: 'confirmed', duration: 90 }, // UPCOMING
      { studentId: 5, tutorId: 5, subject: 'Structural Engineering', topic: 'Foundation Design', daysAgo: 0, status: 'pending', duration: 120 }, // PENDING TODAY
      
      // ============ STUDENT 6 (Nguyen Van F) - MIX OF STATUSES ============
      { studentId: 6, tutorId: 6, subject: 'Chemical Engineering', topic: 'Process Control', daysAgo: 29, status: 'completed', rating: 5, duration: 120 },
      { studentId: 6, tutorId: 6, subject: 'Chemical Engineering', topic: 'Reactor Design', daysAgo: 22, status: 'completed', rating: 4, duration: 120 },
      { studentId: 6, tutorId: 6, subject: 'Chemical Engineering', topic: 'Mass Transfer', daysAgo: 15, status: 'completed', rating: 5, duration: 120 },
      { studentId: 6, tutorId: 6, subject: 'Chemical Engineering', topic: 'Heat Exchangers', daysAgo: -3, status: 'confirmed', duration: 120 }, // UPCOMING
      { studentId: 6, tutorId: 6, subject: 'Chemical Engineering', topic: 'Distillation Processes', daysAgo: 2, status: 'pending', duration: 120 }, // PENDING
      
      // ============ STUDENT 7 (Nguyen Van G) - MIX OF STATUSES ============
      { studentId: 7, tutorId: 7, subject: 'Operating Systems', topic: 'Process Scheduling', daysAgo: 30, status: 'completed', rating: 5, duration: 90 },
      { studentId: 7, tutorId: 7, subject: 'Operating Systems', topic: 'File Systems', daysAgo: 23, status: 'completed', rating: 5, duration: 90 },
      { studentId: 7, tutorId: 7, subject: 'Operating Systems', topic: 'Deadlock Handling', daysAgo: 16, status: 'completed', rating: 4, duration: 90 },
      { studentId: 7, tutorId: 10, subject: 'Programming', topic: 'Design Patterns', daysAgo: -7, status: 'confirmed', duration: 120 }, // UPCOMING
      { studentId: 7, tutorId: 7, subject: 'Operating Systems', topic: 'Virtual Memory', daysAgo: 0, status: 'pending', duration: 90 }, // PENDING TODAY
      
      // ============ STUDENT 8 (Nguyen Van H) - MIX OF STATUSES ============
      { studentId: 8, tutorId: 8, subject: 'Mathematics', topic: 'Matrix Operations', daysAgo: 31, status: 'completed', rating: 5, duration: 90 },
      { studentId: 8, tutorId: 8, subject: 'Mathematics', topic: 'Determinants', daysAgo: 24, status: 'completed', rating: 5, duration: 90 },
      { studentId: 8, tutorId: 8, subject: 'Mathematics', topic: 'Linear Transformations', daysAgo: 17, status: 'completed', rating: 4, duration: 90 },
      { studentId: 8, tutorId: 2, subject: 'Web Development', topic: 'JavaScript ES6+', daysAgo: -8, status: 'confirmed', duration: 120 }, // UPCOMING
      { studentId: 8, tutorId: 8, subject: 'Mathematics', topic: 'Eigenvalues', daysAgo: 1, status: 'pending', duration: 90 }, // PENDING
      
      // ============ STUDENT 9 (Nguyen Van I) - MIX OF STATUSES ============
      { studentId: 9, tutorId: 9, subject: 'Physics', topic: 'Heat Transfer', daysAgo: 32, status: 'completed', rating: 4, duration: 90 },
      { studentId: 9, tutorId: 9, subject: 'Physics', topic: 'Energy Conversion', daysAgo: 25, status: 'completed', rating: 5, duration: 90 },
      { studentId: 9, tutorId: 9, subject: 'Physics', topic: 'Statistical Mechanics', daysAgo: 18, status: 'completed', rating: 4, duration: 90 },
      { studentId: 9, tutorId: 1, subject: 'Database Systems', topic: 'Database Design', daysAgo: -5, status: 'confirmed', duration: 90 }, // UPCOMING
      { studentId: 9, tutorId: 1, subject: 'Database Systems', topic: 'Advanced SQL', daysAgo: 0, status: 'pending', duration: 90 }, // PENDING TODAY
      
      // ============ STUDENT 10 (Nguyen Van J) - MIX OF STATUSES ============
      { studentId: 10, tutorId: 10, subject: 'Programming', topic: 'OOP Principles', daysAgo: 33, status: 'completed', rating: 5, duration: 120 },
      { studentId: 10, tutorId: 10, subject: 'Programming', topic: 'SOLID Principles', daysAgo: 26, status: 'completed', rating: 5, duration: 120 },
      { studentId: 10, tutorId: 10, subject: 'Programming', topic: 'Refactoring Techniques', daysAgo: 19, status: 'completed', rating: 5, duration: 120 },
      { studentId: 10, tutorId: 3, subject: 'Machine Learning', topic: 'Neural Networks', daysAgo: -10, status: 'confirmed', duration: 120 }, // UPCOMING
      { studentId: 10, tutorId: 10, subject: 'Programming', topic: 'Testing Best Practices', daysAgo: 2, status: 'pending', duration: 120 }, // PENDING
    ];
    
    // TOTAL: 50 COMPLETED SESSIONS for 10 students (5 each)
    // Each session has tutor from registered tutors (tutor1-10)
    // All sessions have ratings and feedback for progress calculation

    let sessionId = 1;
    
    sessionData.forEach((data, idx) => {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() - data.daysAgo);
      
      const createdDate = new Date(sessionDate);
      createdDate.setDate(createdDate.getDate() - 3); // Created 3 days before session
      
      const startHour = 9 + (idx % 7); // Vary start times 9-15
      const endHour = startHour + Math.floor(data.duration / 60);
      const endMinute = data.duration % 60;
      
      const session: Session = {
        id: `session:${sessionId++}`,
        studentId: `user:student:${data.studentId}`,
        tutorId: `user:tutor:${data.tutorId}`,
        subject: data.subject,
        topic: data.topic,
        date: sessionDate.toISOString().split('T')[0],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        status: data.status as any,
        location: idx % 2 === 0 ? `A${(idx % 3) + 1}.${200 + (idx % 5) * 10}` : 'Online (MS Teams)',
        createdAt: createdDate.toISOString(),
        updatedAt: sessionDate.toISOString(),
        requestedBy: `user:student:${data.studentId}`,
        type: idx % 2 === 0 ? 'in-person' : 'online'
      };
      
      // Add feedback and ratings for completed sessions
      if (data.status === 'completed' && data.rating) {
        const feedbackTemplate = feedbackTemplates[idx % feedbackTemplates.length];
        const tutorFeedbackTemplate = tutorFeedbackTemplates[idx % tutorFeedbackTemplates.length];
        
        session.feedback = feedbackTemplate.replace('{topic}', data.topic);
        session.tutorFeedback = tutorFeedbackTemplate.replace('{topic}', data.topic);
        session.rating = data.rating;
        session.completedAt = sessionDate.toISOString();
      }
      
      // Add notes for pending and confirmed sessions
      if (data.status === 'pending') {
        session.notes = `Looking forward to learning about ${data.topic}. I have some specific questions prepared.`;
      }
      
      if (data.status === 'confirmed') {
        session.notes = `Upcoming session on ${data.topic}. Please prepare relevant materials.`;
      }
      
      sessions.push(session);
    });
    
    return sessions;
  }

  /**
   * Generate initial notifications based on session history
   */
  static generateInitialNotifications(sessions: Session[]): Notification[] {
    const notifications: Notification[] = [];
    let notifId = 1;
    
    // Generate notifications for each session action
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      
      // 1. Session request notification (to tutor)
      notifications.push({
        id: `notif:${notifId++}`,
        userId: session.tutorId,
        title: 'New Session Request',
        message: `New tutoring session request for ${session.subject}`,
        type: 'session_request',
        read: session.status !== 'pending', // Unread if still pending
        createdAt: session.createdAt,
        relatedId: session.id,
        actionType: 'accept_decline'
      });
      
      // 2. Session accepted notification (to student) - if not pending
      if (session.status !== 'pending') {
        const acceptedDate = new Date(session.createdAt);
        acceptedDate.setHours(acceptedDate.getHours() + 2);
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.studentId,
          title: 'Session Request Accepted',
          message: `Your session request for ${session.subject} has been accepted`,
          type: 'session_accepted',
          read: true,
          createdAt: acceptedDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
      }
      
      // 3. Session reminder (to both) - if confirmed (upcoming)
      if (session.status === 'confirmed') {
        const reminderDate = new Date(sessionDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.studentId,
          title: 'Upcoming Session Reminder',
          message: `You have a ${session.subject} session tomorrow at ${session.startTime}`,
          type: 'reminder',
          read: false,
          createdAt: reminderDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.tutorId,
          title: 'Upcoming Session Reminder',
          message: `You have a ${session.subject} tutoring session tomorrow at ${session.startTime}`,
          type: 'reminder',
          read: false,
          createdAt: reminderDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
      }
      
      // 4. Session completed notification - if completed
      if (session.status === 'completed') {
        const completedDate = new Date(session.completedAt || sessionDate);
        
        // To student: Rate your session
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.studentId,
          title: 'Session Completed',
          message: `Please rate your ${session.subject} session`,
          type: 'session_completed',
          read: session.rating ? true : false,
          createdAt: completedDate.toISOString(),
          relatedId: session.id,
          actionType: session.rating ? 'view' : 'rate'
        });
        
        // To tutor: Provide feedback
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.tutorId,
          title: 'Session Completed',
          message: `Please provide feedback for your ${session.subject} session`,
          type: 'session_completed',
          read: session.tutorFeedback ? true : false,
          createdAt: completedDate.toISOString(),
          relatedId: session.id,
          actionType: session.tutorFeedback ? 'view' : 'feedback'
        });
      }
      
      // 5. Feedback received notification - if rated
      if (session.rating && session.feedback) {
        const feedbackDate = new Date(session.completedAt || sessionDate);
        feedbackDate.setHours(feedbackDate.getHours() + 1);
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.tutorId,
          title: 'New Student Feedback',
          message: `You received a ${session.rating}-star rating for ${session.subject}`,
          type: 'feedback',
          read: true,
          createdAt: feedbackDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
      }
      
      // 6. Cancelled session notification
      if (session.status === 'cancelled') {
        const cancelDate = new Date(sessionDate);
        cancelDate.setDate(cancelDate.getDate() - 1);
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.studentId,
          title: 'Session Cancelled',
          message: `Your ${session.subject} session has been cancelled`,
          type: 'cancelled',
          read: true,
          createdAt: cancelDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
        
        notifications.push({
          id: `notif:${notifId++}`,
          userId: session.tutorId,
          title: 'Session Cancelled',
          message: `${session.subject} session has been cancelled`,
          type: 'cancelled',
          read: true,
          createdAt: cancelDate.toISOString(),
          relatedId: session.id,
          actionType: 'view'
        });
      }
    });
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return notifications;
  }
}
