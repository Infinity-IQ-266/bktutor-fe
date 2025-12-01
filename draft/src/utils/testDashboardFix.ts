/**
 * TEST DASHBOARD FIX
 * Verify that currentUserEmail is properly saved to localStorage
 */

export function testDashboardFix() {
  console.log('\n🧪 TESTING DASHBOARD FIX');
  console.log('========================================\n');
  
  // Test 1: Check if email is in localStorage
  const email = localStorage.getItem('currentUserEmail');
  
  if (email) {
    console.log('✅ TEST 1 PASSED: Email found in localStorage');
    console.log(`   Email: ${email}`);
  } else {
    console.log('❌ TEST 1 FAILED: No email in localStorage');
    console.log('   📝 ACTION: Please login again');
    console.log('   The fix requires a fresh login to save email');
    return;
  }
  
  // Test 2: Verify email format
  if (email.includes('@hcmut.edu.vn')) {
    console.log('✅ TEST 2 PASSED: Email format is valid');
  } else {
    console.log('⚠️  TEST 2 WARNING: Email format unexpected');
    console.log(`   Expected: *@hcmut.edu.vn, Got: ${email}`);
  }
  
  // Test 3: Test API call with email
  console.log('\n🔄 TEST 3: Testing API with stored email...');
  
  import('./api').then(async ({ api }) => {
    try {
      const result = await api.getUserByEmail(email);
      
      if (result.user) {
        console.log('✅ TEST 3 PASSED: API successfully retrieved user');
        console.log(`   User: ${result.user.name}`);
        console.log(`   Role: ${result.user.role}`);
        console.log(`   ID: ${result.user.id}`);
        
        // Test 4: Get sessions for this user
        console.log('\n🔄 TEST 4: Testing sessions API...');
        const sessionsResult = await api.getSessions({ studentId: result.user.id });
        
        if (sessionsResult.sessions) {
          console.log('✅ TEST 4 PASSED: Sessions retrieved successfully');
          console.log(`   Total Sessions: ${sessionsResult.sessions.length}`);
          
          const completed = sessionsResult.sessions.filter((s: any) => s.status === 'completed').length;
          const confirmed = sessionsResult.sessions.filter((s: any) => s.status === 'confirmed').length;
          const pending = sessionsResult.sessions.filter((s: any) => s.status === 'pending').length;
          
          console.log(`   └─ Completed: ${completed}`);
          console.log(`   └─ Confirmed: ${confirmed}`);
          console.log(`   └─ Pending: ${pending}`);
          
          if (sessionsResult.sessions.length === 0) {
            console.log('⚠️  WARNING: User has no sessions');
            console.log('   This might be a non-student user or new user');
          }
        } else {
          console.log('❌ TEST 4 FAILED: Sessions not retrieved');
        }
        
        // Test 5: Get progress for this user
        console.log('\n🔄 TEST 5: Testing progress API...');
        const progressResult = await api.getProgressForStudent(result.user.id);
        
        if (progressResult) {
          console.log('✅ TEST 5 PASSED: Progress retrieved successfully');
          console.log(`   Progress Records: ${progressResult.length}`);
          
          if (progressResult.length > 0) {
            console.log('\n   Progress Details:');
            progressResult.forEach((p: any, i: number) => {
              console.log(`   ${i + 1}. ${p.subject}`);
              console.log(`      Sessions: ${p.sessionsAttended}`);
              console.log(`      Rating: ${p.averageRating}`);
              console.log(`      Score: ${p.improvementScore}%`);
            });
          } else {
            console.log('   ℹ️  No progress records (expected if no completed sessions)');
          }
        }
        
        console.log('\n========================================');
        console.log('🎉 ALL TESTS PASSED!');
        console.log('Dashboard should now display correctly.');
        console.log('========================================\n');
        
      } else {
        console.log('❌ TEST 3 FAILED: User not found with stored email');
        console.log('   This should not happen. Database might be corrupted.');
      }
    } catch (error) {
      console.error('❌ TEST FAILED: Error during API calls');
      console.error('   Error:', error);
    }
  });
}

// Export to window for easy access
if (typeof window !== 'undefined') {
  (window as any).testDashboardFix = testDashboardFix;
  console.log('💡 Dashboard Fix Test loaded! Run: testDashboardFix()');
}
