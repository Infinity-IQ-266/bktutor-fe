/**
 * SESSION DATABASE VERIFICATION TOOL
 * Verifies that all pre-registered students (student1-10) have at least 5 sessions
 * and that session data is properly synced across the system
 */

import { RealBackend } from './realBackend';

export function verifySessionDatabase(): {
  valid: boolean;
  details: string;
  studentSessions: { [key: string]: any };
} {
  console.log('\n========================================');
  console.log('🔍 SESSION DATABASE VERIFICATION');
  console.log('========================================\n');
  
  const allSessions = RealBackend.getAllSessions();
  const allUsers = RealBackend.getAllUsers();
  const students = allUsers.filter(u => u.role === 'student');
  
  // Filter sessions for student1-10 only
  const student1to10Sessions = allSessions.filter(s => {
    const studentMatch = s.studentId.match(/user:student:(\d+)/);
    if (studentMatch) {
      const studentNum = parseInt(studentMatch[1]);
      return studentNum >= 1 && studentNum <= 10;
    }
    return false;
  });
  
  console.log(`📊 Total Sessions in Database: ${allSessions.length}`);
  console.log(`📊 Sessions for Student1-10: ${student1to10Sessions.length} (Expected: 50)`);
  console.log(`👥 Total Students in Database: ${students.length}`);
  console.log(`📚 Pre-registered Students (student1-10): 10\n`);
  
  const studentSessions: { [key: string]: any } = {};
  let allValid = true;
  let detailsLog = '';
  
  // Check each pre-registered student (student1-10)
  for (let i = 1; i <= 10; i++) {
    const studentId = `user:student:${i}`;
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      console.log(`❌ Student ${i} NOT FOUND in database!`);
      detailsLog += `❌ Student ${i} NOT FOUND\n`;
      allValid = false;
      continue;
    }
    
    const sessions = allSessions.filter(s => s.studentId === studentId);
    const completed = sessions.filter(s => s.status === 'completed');
    const confirmed = sessions.filter(s => s.status === 'confirmed');
    const pending = sessions.filter(s => s.status === 'pending');
    const cancelled = sessions.filter(s => s.status === 'cancelled');
    
    const sessionBreakdown = {
      studentId: studentId,
      studentName: student.name,
      total: sessions.length,
      completed: completed.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      valid: sessions.length >= 5,
      sessions: sessions.map(s => ({
        id: s.id,
        subject: s.subject,
        topic: s.topic,
        date: s.date,
        status: s.status,
        tutor: s.tutorId,
        rating: s.rating,
        hasProgress: completed.some(cs => cs.id === s.id)
      }))
    };
    
    studentSessions[studentId] = sessionBreakdown;
    
    const status = sessions.length >= 5 ? '✅' : '❌';
    const validText = sessions.length >= 5 ? 'VALID' : 'INVALID - NEEDS MORE SESSIONS';
    
    console.log(`${status} ${student.name} (${studentId}):`);
    console.log(`   Total Sessions: ${sessions.length} - ${validText}`);
    console.log(`   ├─ Completed: ${completed.length}`);
    console.log(`   ├─ Confirmed (Upcoming): ${confirmed.length}`);
    console.log(`   ├─ Pending: ${pending.length}`);
    console.log(`   └─ Cancelled: ${cancelled.length}`);
    
    // List all sessions
    sessions.forEach(s => {
      const statusEmoji = {
        'completed': '✓',
        'confirmed': '→',
        'pending': '⏳',
        'cancelled': '✗'
      }[s.status] || '?';
      
      console.log(`      ${statusEmoji} ${s.date} | ${s.subject} - ${s.topic} | ${s.status.toUpperCase()}`);
    });
    
    console.log('');
    
    detailsLog += `${status} ${student.name}: ${sessions.length} sessions (${completed.length} completed)\n`;
    
    if (sessions.length < 5) {
      allValid = false;
    }
  }
  
  // Summary
  console.log('========================================');
  console.log('📊 SUMMARY TABLE');
  console.log('========================================');
  console.log('Student              | Total | ✓ | → | ⏳ | Status');
  console.log('---------------------|-------|---|---|---|--------');
  
  for (let i = 1; i <= 10; i++) {
    const studentId = `user:student:${i}`;
    const data = studentSessions[studentId];
    if (data) {
      const status = data.valid ? '✅ PASS' : '❌ FAIL';
      const name = data.studentName.padEnd(20);
      console.log(`${name} | ${String(data.total).padStart(5)} | ${String(data.completed).padStart(1)} | ${String(data.confirmed).padStart(1)} | ${String(data.pending).padStart(1)} | ${status}`);
    }
  }
  
  console.log('========================================');
  if (allValid) {
    console.log('✅ ALL PRE-REGISTERED STUDENTS HAVE AT LEAST 5 SESSIONS');
  } else {
    console.log('❌ SOME STUDENTS DO NOT HAVE ENOUGH SESSIONS');
  }
  console.log('========================================\n');
  
  // Check progress records
  const progressRecords = RealBackend.getAllProgress();
  console.log(`📈 Total Progress Records: ${progressRecords.length}`);
  
  // Verify progress matches completed sessions
  for (let i = 1; i <= 10; i++) {
    const studentId = `user:student:${i}`;
    const student = students.find(s => s.id === studentId);
    if (!student) continue;
    
    const studentProgress = progressRecords.filter(p => p.studentId === studentId);
    const completedSessions = allSessions.filter(s => 
      s.studentId === studentId && s.status === 'completed'
    );
    
    console.log(`   ${student.name}: ${studentProgress.length} progress records for ${completedSessions.length} completed sessions`);
  }
  
  console.log('\n========================================');
  console.log('DATABASE VERIFICATION COMPLETE');
  console.log('========================================\n');
  
  return {
    valid: allValid,
    details: detailsLog,
    studentSessions: studentSessions
  };
}

// Auto-run verification on import in development
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure database is initialized
  setTimeout(() => {
    verifySessionDatabase();
  }, 1000);
}
