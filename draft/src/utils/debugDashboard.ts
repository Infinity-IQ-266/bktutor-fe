/**
 * DEBUG DASHBOARD DATA
 * Kiểm tra xem Dashboard có lấy đúng data không
 */

import { RealBackend } from './realBackend';

export function debugDashboardData() {
  console.log('\n🔍 DEBUG DASHBOARD DATA');
  console.log('========================================\n');
  
  // Test với student1
  const testEmail = 'student1@hcmut.edu.vn';
  
  // Get user
  const user = RealBackend.getUserByEmail(testEmail);
  console.log('👤 User:', user?.name, '(ID:', user?.id, ')');
  
  if (!user) {
    console.error('❌ User not found!');
    return;
  }
  
  // Get sessions
  const sessionsResult = RealBackend.getSessions({ studentId: user.id });
  const allSessions = sessionsResult.sessions || [];
  
  console.log('\n📅 SESSIONS FOR STUDENT1:');
  console.log('─────────────────────────────────────');
  console.log(`Total Sessions: ${allSessions.length}`);
  
  const completed = allSessions.filter((s: any) => s.status === 'completed');
  const confirmed = allSessions.filter((s: any) => s.status === 'confirmed');
  const pending = allSessions.filter((s: any) => s.status === 'pending');
  const cancelled = allSessions.filter((s: any) => s.status === 'cancelled');
  
  console.log(`├─ Completed: ${completed.length}`);
  console.log(`├─ Confirmed (Upcoming): ${confirmed.length}`);
  console.log(`├─ Pending: ${pending.length}`);
  console.log(`└─ Cancelled: ${cancelled.length}`);
  
  // Show upcoming sessions
  const now = new Date();
  const upcoming = allSessions.filter((s: any) => {
    const sessionDate = new Date(s.date);
    return (s.status === 'confirmed' || s.status === 'pending') && sessionDate >= now;
  });
  
  console.log('\n⏰ UPCOMING SESSIONS:');
  console.log('─────────────────────────────────────');
  console.log(`Count: ${upcoming.length}`);
  upcoming.forEach((s: any, i: number) => {
    console.log(`${i + 1}. ${s.subject} - ${s.topic || 'No topic'}`);
    console.log(`   Date: ${s.date}, Status: ${s.status}`);
  });
  
  // Show completed sessions
  console.log('\n✅ COMPLETED SESSIONS:');
  console.log('─────────────────────────────────────');
  console.log(`Count: ${completed.length}`);
  completed.forEach((s: any, i: number) => {
    console.log(`${i + 1}. ${s.subject} - ${s.topic || 'No topic'}`);
    console.log(`   Date: ${s.date}, Rating: ${s.rating || 'N/A'}`);
    console.log(`   Feedback: ${s.feedback ? 'Yes' : 'No'}`);
  });
  
  // Get progress records
  const progressRecords = RealBackend.getProgressForStudent(user.id);
  
  console.log('\n📈 PROGRESS RECORDS:');
  console.log('─────────────────────────────────────');
  console.log(`Total Progress Records: ${progressRecords.length}`);
  
  progressRecords.forEach((p: any, i: number) => {
    console.log(`\n${i + 1}. ${p.subject}`);
    console.log(`   Sessions Attended: ${p.sessionsAttended}`);
    console.log(`   Average Rating: ${p.averageRating}`);
    console.log(`   Improvement Score: ${p.improvementScore}%`);
    console.log(`   Last Session: ${p.lastSessionDate}`);
  });
  
  // Calculate what Dashboard should show
  const uniqueTutors = new Set(allSessions.map((s: any) => s.tutorId));
  const total = allSessions.filter((s: any) => s.status !== 'cancelled').length;
  const attendance = total > 0 ? Math.round((completed.length / total) * 100) : 100;
  
  console.log('\n📊 DASHBOARD STATS SHOULD BE:');
  console.log('─────────────────────────────────────');
  console.log(`Upcoming Sessions: ${upcoming.length}`);
  console.log(`Completed Sessions: ${completed.length}`);
  console.log(`Current Tutors: ${uniqueTutors.size}`);
  console.log(`Attendance Rate: ${attendance}%`);
  
  console.log('\n========================================');
  console.log('✅ Debug Complete!\n');
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugDashboard = debugDashboardData;
}
