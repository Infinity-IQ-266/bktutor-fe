/**
 * QUICK TEST UTILITIES
 * Fast commands to verify system is working
 */

// Quick check if email is saved
export function checkEmail() {
  const email = localStorage.getItem('currentUserEmail');
  
  if (email) {
    console.log('✅ Email found:', email);
    return email;
  } else {
    console.log('❌ No email saved. Please login again.');
    console.log('💡 After login, you should see: "✅ Login successful - Email saved"');
    return null;
  }
}

// Quick stats check
export async function quickStats() {
  const email = checkEmail();
  if (!email) return;
  
  console.log('\n📊 Loading stats...\n');
  
  const { api } = await import('./api');
  
  try {
    // Get user
    const userResult = await api.getUserByEmail(email);
    if (!userResult.user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User:', userResult.user.name);
    console.log('📧 Email:', userResult.user.email);
    console.log('🎭 Role:', userResult.user.role);
    
    // Get sessions
    const sessionsResult = await api.getSessions({ studentId: userResult.user.id });
    const sessions = sessionsResult.sessions || [];
    
    console.log('\n📅 SESSIONS:');
    console.log('  Total:', sessions.length);
    console.log('  Completed:', sessions.filter((s: any) => s.status === 'completed').length);
    console.log('  Confirmed:', sessions.filter((s: any) => s.status === 'confirmed').length);
    console.log('  Pending:', sessions.filter((s: any) => s.status === 'pending').length);
    
    // Get progress
    const progress = await api.getProgressForStudent(userResult.user.id);
    
    console.log('\n📈 PROGRESS:');
    console.log('  Records:', progress.length);
    
    if (progress.length > 0) {
      console.log('\n  Subjects:');
      progress.forEach((p: any) => {
        console.log(`  • ${p.subject}: ${p.sessionsAttended} sessions, ${p.averageRating}⭐, ${p.improvementScore}%`);
      });
    }
    
    console.log('\n✅ All data loaded successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Quick reset
export function quickReset() {
  console.log('🔄 Resetting system...');
  localStorage.clear();
  console.log('✅ localStorage cleared');
  console.log('🔄 Reloading page...');
  setTimeout(() => location.reload(), 1000);
}

// Quick login test
export function testLogin() {
  console.log('🧪 LOGIN TEST\n');
  console.log('Step 1: Login with:');
  console.log('  Email: student1@hcmut.edu.vn');
  console.log('  Password: 123456789');
  console.log('\nStep 2: After login, check console for:');
  console.log('  ✅ Login successful - Email saved: student1@hcmut.edu.vn');
  console.log('\nStep 3: Run: quickStats()');
  console.log('\nExpected: Sessions: 5, Progress: 1');
}

// Show all commands
export function help() {
  console.log('\n📚 QUICK TEST COMMANDS\n');
  console.log('checkEmail()     - Check if email is saved');
  console.log('quickStats()     - Show user stats (sessions, progress)');
  console.log('quickReset()     - Clear everything and reload');
  console.log('testLogin()      - Show login test instructions');
  console.log('debugDashboard() - Detailed dashboard debug');
  console.log('testDashboardFix() - Run all fix tests');
  console.log('help()           - Show this help\n');
}

// Export to window
if (typeof window !== 'undefined') {
  const w = window as any;
  w.checkEmail = checkEmail;
  w.quickStats = quickStats;
  w.quickReset = quickReset;
  w.testLogin = testLogin;
  w.help = help;
  
  console.log('🚀 Quick Test loaded! Type: help()');
}
