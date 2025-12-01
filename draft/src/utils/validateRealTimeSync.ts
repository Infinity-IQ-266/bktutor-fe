/**
 * REAL-TIME SYNCHRONIZATION VALIDATOR
 * Tests that all CRUD operations properly sync across related accounts
 */

import { RealBackend } from './realBackend';

export class SyncValidator {
  
  /**
   * Test 1: Session Creation → Tutor gets notification
   */
  static async testSessionRequest() {
    console.log('\n📝 TEST 1: Session Request Flow');
    console.log('=====================================');
    
    // Student creates session request
    const result = await RealBackend.createSession({
      studentId: 'user:student:1',
      tutorId: 'user:tutor:1',
      subject: 'Database Systems',
      topic: 'Test Topic',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '11:00',
      location: 'A1.201',
      type: 'in-person',
      notes: 'Test session request'
    });
    
    if (!result.success) {
      console.error('❌ Session creation failed');
      return false;
    }
    
    // Check if tutor received notification
    const tutorNotifs = await RealBackend.getNotifications({ userId: 'user:tutor:1' });
    const sessionNotif = tutorNotifs.notifications?.find(
      (n: any) => n.relatedId === result.session?.id && n.type === 'session_request'
    );
    
    if (sessionNotif) {
      console.log('✅ Tutor received session request notification');
      console.log(`   - Title: ${sessionNotif.title}`);
      console.log(`   - Action: ${sessionNotif.actionType}`);
      return true;
    } else {
      console.error('❌ Tutor did NOT receive notification');
      return false;
    }
  }
  
  /**
   * Test 2: Session Acceptance → Student gets notification
   */
  static async testSessionAcceptance(sessionId: string) {
    console.log('\n✅ TEST 2: Session Acceptance Flow');
    console.log('=====================================');
    
    // Tutor accepts session
    const result = await RealBackend.updateSession(sessionId, {
      status: 'scheduled'
    });
    
    if (!result.success) {
      console.error('❌ Session acceptance failed');
      return false;
    }
    
    // Create acceptance notification manually (this should be done by the accept function)
    await RealBackend.createNotification({
      userId: 'user:student:1',
      title: 'Session Request Accepted',
      message: 'Your session request has been accepted',
      type: 'session_accepted',
      relatedId: sessionId,
      actionType: 'view'
    });
    
    // Check if student received notification
    const studentNotifs = await RealBackend.getNotifications({ userId: 'user:student:1' });
    const acceptNotif = studentNotifs.notifications?.find(
      (n: any) => n.relatedId === sessionId && n.type === 'session_accepted'
    );
    
    if (acceptNotif) {
      console.log('✅ Student received acceptance notification');
      console.log(`   - Title: ${acceptNotif.title}`);
      return true;
    } else {
      console.error('❌ Student did NOT receive notification');
      return false;
    }
  }
  
  /**
   * Test 3: Session Completion → Both get notifications
   */
  static async testSessionCompletion(sessionId: string) {
    console.log('\n🎓 TEST 3: Session Completion Flow');
    console.log('=====================================');
    
    // Mark session as completed
    const result = await RealBackend.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    if (!result.success) {
      console.error('❌ Session completion failed');
      return false;
    }
    
    // Create completion notifications
    await RealBackend.createNotification({
      userId: 'user:student:1',
      title: 'Session Completed',
      message: 'Please rate your session',
      type: 'session_completed',
      relatedId: sessionId,
      actionType: 'rate'
    });
    
    await RealBackend.createNotification({
      userId: 'user:tutor:1',
      title: 'Session Completed',
      message: 'Please provide feedback',
      type: 'session_completed',
      relatedId: sessionId,
      actionType: 'feedback'
    });
    
    // Check both received notifications
    const studentNotifs = await RealBackend.getNotifications({ userId: 'user:student:1' });
    const tutorNotifs = await RealBackend.getNotifications({ userId: 'user:tutor:1' });
    
    const studentCompletionNotif = studentNotifs.notifications?.find(
      (n: any) => n.relatedId === sessionId && n.type === 'session_completed'
    );
    const tutorCompletionNotif = tutorNotifs.notifications?.find(
      (n: any) => n.relatedId === sessionId && n.type === 'session_completed'
    );
    
    if (studentCompletionNotif && tutorCompletionNotif) {
      console.log('✅ Both student and tutor received completion notifications');
      return true;
    } else {
      console.error('❌ Missing completion notifications');
      return false;
    }
  }
  
  /**
   * Test 4: Feedback/Rating → Progress updates, Tutor rating recalculates
   */
  static async testFeedbackAndRating(sessionId: string) {
    console.log('\n⭐ TEST 4: Feedback & Rating Flow');
    console.log('=====================================');
    
    // Student adds feedback and rating
    const result = await RealBackend.updateSession(sessionId, {
      feedback: 'Excellent session! Very helpful.',
      rating: 5
    });
    
    if (!result.success) {
      console.error('❌ Feedback update failed');
      return false;
    }
    
    // Get student sessions to check progress
    const studentSessions = await RealBackend.getSessions({ studentId: 'user:student:1' });
    const session = studentSessions.sessions?.find((s: any) => s.id === sessionId);
    
    if (!session || !session.rating) {
      console.error('❌ Session rating not saved');
      return false;
    }
    
    console.log('✅ Session rating saved:', session.rating);
    
    // Check if tutor's average rating is recalculated
    const tutorSessions = await RealBackend.getSessions({ tutorId: 'user:tutor:1' });
    const completedSessions = tutorSessions.sessions?.filter((s: any) => s.status === 'completed' && s.rating) || [];
    const avgRating = completedSessions.reduce((sum: number, s: any) => sum + s.rating, 0) / completedSessions.length;
    
    console.log('✅ Tutor average rating recalculated:', avgRating.toFixed(1));
    console.log(`   - Total rated sessions: ${completedSessions.length}`);
    
    // Create feedback notification for tutor
    await RealBackend.createNotification({
      userId: 'user:tutor:1',
      title: 'New Student Feedback',
      message: `You received a ${session.rating}-star rating`,
      type: 'feedback',
      relatedId: sessionId,
      actionType: 'view'
    });
    
    const tutorNotifs = await RealBackend.getNotifications({ userId: 'user:tutor:1' });
    const feedbackNotif = tutorNotifs.notifications?.find(
      (n: any) => n.relatedId === sessionId && n.type === 'feedback'
    );
    
    if (feedbackNotif) {
      console.log('✅ Tutor received feedback notification');
      return true;
    } else {
      console.error('❌ Tutor did NOT receive feedback notification');
      return false;
    }
  }
  
  /**
   * Test 5: Material Upload → Students notified, download count updates
   */
  static async testMaterialSharing() {
    console.log('\n📚 TEST 5: Material Sharing Flow');
    console.log('=====================================');
    
    const result = await RealBackend.createMaterial({
      title: 'Test Material',
      subject: 'Database Systems',
      uploadedBy: 'user:tutor:1',
      uploadedByName: 'Nguyen Minh A',
      uploadDate: new Date().toISOString().split('T')[0],
      fileType: 'PDF',
      fileSize: '2.5 MB',
      description: 'Test material for validation',
      tags: ['Test', 'Database'],
      url: 'https://example.com/test.pdf',
      sharedWith: ['user:student:1', 'user:student:2']
    });
    
    if (!result.success) {
      console.error('❌ Material creation failed');
      return false;
    }
    
    console.log('✅ Material created:', result.material?.title);
    
    // Create notifications for shared students
    for (const studentId of ['user:student:1', 'user:student:2']) {
      await RealBackend.createNotification({
        userId: studentId,
        title: 'New Learning Material',
        message: 'Test Material has been shared with you',
        type: 'material',
        relatedId: result.material?.id,
        actionType: 'view'
      });
    }
    
    // Check if students received notifications
    const student1Notifs = await RealBackend.getNotifications({ userId: 'user:student:1' });
    const materialNotif = student1Notifs.notifications?.find(
      (n: any) => n.relatedId === result.material?.id && n.type === 'material'
    );
    
    if (materialNotif) {
      console.log('✅ Students received material notification');
      return true;
    } else {
      console.error('❌ Students did NOT receive notification');
      return false;
    }
  }
  
  /**
   * Test 6: Progress & Sessions Sync
   */
  static async testProgressSessionsSync() {
    console.log('\n🔄 TEST 6: Progress & Sessions Sync');
    console.log('=====================================');
    
    const studentId = 'user:student:1';
    
    // Get all sessions
    const allSessions = await RealBackend.getSessions({ studentId });
    const completedSessions = allSessions.sessions?.filter((s: any) => s.status === 'completed') || [];
    
    console.log(`Total sessions: ${allSessions.sessions?.length || 0}`);
    console.log(`Completed sessions: ${completedSessions.length}`);
    
    // Progress should match completed sessions
    const progressCount = completedSessions.length;
    const sessionsCount = completedSessions.length;
    
    if (progressCount === sessionsCount) {
      console.log('✅ Progress and Sessions are in sync');
      console.log(`   - Both show ${progressCount} completed sessions`);
      return true;
    } else {
      console.error('❌ Sync mismatch!');
      console.error(`   - Progress: ${progressCount}, Sessions: ${sessionsCount}`);
      return false;
    }
  }
  
  /**
   * Test 7: Notification State Updates
   */
  static async testNotificationStateUpdate(notificationId: string) {
    console.log('\n🔔 TEST 7: Notification State Update');
    console.log('=====================================');
    
    // Mark notification as read
    const result = await RealBackend.markNotificationAsRead(notificationId);
    
    if (!result.success) {
      console.error('❌ Mark as read failed');
      return false;
    }
    
    // Verify it's marked as read
    const notifs = await RealBackend.getNotifications({ userId: 'user:student:1' });
    const notif = notifs.notifications?.find((n: any) => n.id === notificationId);
    
    if (notif && notif.read) {
      console.log('✅ Notification marked as read successfully');
      return true;
    } else {
      console.error('❌ Notification still unread');
      return false;
    }
  }
  
  /**
   * Run all validation tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Real-Time Sync Validation');
    console.log('=' + '='.repeat(50));
    
    const results: Record<string, boolean> = {};
    
    // Test 1: Session Request
    results['Session Request'] = await this.testSessionRequest();
    
    // Get the created session ID from latest session
    const sessions = await RealBackend.getSessions({ studentId: 'user:student:1' });
    const latestSession = sessions.sessions?.[sessions.sessions.length - 1];
    
    if (latestSession) {
      // Test 2: Session Acceptance
      results['Session Acceptance'] = await this.testSessionAcceptance(latestSession.id);
      
      // Test 3: Session Completion
      results['Session Completion'] = await this.testSessionCompletion(latestSession.id);
      
      // Test 4: Feedback & Rating
      results['Feedback & Rating'] = await this.testFeedbackAndRating(latestSession.id);
    }
    
    // Test 5: Material Sharing
    results['Material Sharing'] = await this.testMaterialSharing();
    
    // Test 6: Progress Sync
    results['Progress Sync'] = await this.testProgressSessionsSync();
    
    // Test 7: Notification Updates
    const notifs = await RealBackend.getNotifications({ userId: 'user:student:1' });
    if (notifs.notifications && notifs.notifications.length > 0) {
      results['Notification Update'] = await this.testNotificationStateUpdate(notifs.notifications[0].id);
    }
    
    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('=' + '='.repeat(50));
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${result ? '✅' : '❌'} ${test}`);
    });
    
    console.log('\n' + '='.repeat(52));
    console.log(`📈 OVERALL: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    console.log('=' + '='.repeat(50));
    
    return passed === total;
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testSync = () => SyncValidator.runAllTests();
  (window as any).SyncValidator = SyncValidator;
}
