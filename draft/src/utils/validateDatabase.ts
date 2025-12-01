// Database Validation Utility
// Run this in console to validate that all data is properly linked

export function validateDatabase() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 BK TUTOR DATABASE VALIDATION');
  console.log('='.repeat(70));
  
  try {
    // Get both databases
    const ssoData = JSON.parse(localStorage.getItem('hcmut_sso_data') || '{}');
    const programData = JSON.parse(localStorage.getItem('bk_tutor_data') || '{}');
    
    if (!ssoData.users || !programData.users) {
      console.error('❌ Databases not initialized!');
      console.log('💡 Run: resetAll() to initialize databases');
      return;
    }
    
    console.log('\n📊 DATABASE STATS:');
    console.log(`   SSO Users: ${ssoData.users.length}`);
    console.log(`   Program Users: ${programData.users.length}`);
    console.log(`   Sessions: ${programData.sessions?.length || 0}`);
    console.log(`   Materials: ${programData.materials?.length || 0}`);
    console.log(`   Notifications: ${programData.notifications?.length || 0}`);
    
    // Validate users
    console.log('\n👥 VALIDATING USERS:');
    const students = programData.users.filter((u: any) => u.role === 'student');
    const tutors = programData.users.filter((u: any) => u.role === 'tutor');
    const coords = programData.users.filter((u: any) => u.role === 'coordinator');
    const chairs = programData.users.filter((u: any) => u.role === 'chair');
    const admins = programData.users.filter((u: any) => u.role === 'administrator');
    
    console.log(`   ✅ Students: ${students.length} (expected: 10)`);
    console.log(`   ✅ Tutors: ${tutors.length} (expected: 10)`);
    console.log(`   ✅ Coordinators: ${coords.length} (expected: 5)`);
    console.log(`   ✅ Chairs: ${chairs.length} (expected: 5)`);
    console.log(`   ✅ Admins: ${admins.length} (expected: 5)`);
    
    // Validate student names
    console.log('\n📝 VALIDATING STUDENT NAMES:');
    let studentNamesValid = true;
    students.slice(0, 10).forEach((s: any, i: number) => {
      const expectedLetter = String.fromCharCode(65 + i); // A-J
      const expectedName = `Nguyen Van ${expectedLetter}`;
      if (s.name !== expectedName) {
        console.log(`   ❌ Student ${i + 1}: Expected "${expectedName}", got "${s.name}"`);
        studentNamesValid = false;
      }
    });
    if (studentNamesValid) {
      console.log('   ✅ All student names follow correct pattern (Nguyen Van A-J)');
    }
    
    // Validate tutor names
    console.log('\n📝 VALIDATING TUTOR NAMES:');
    let tutorNamesValid = true;
    tutors.slice(0, 10).forEach((t: any, i: number) => {
      const expectedLetter = String.fromCharCode(65 + i); // A-J
      const expectedName = `Nguyen Minh ${expectedLetter}`;
      if (t.name !== expectedName) {
        console.log(`   ❌ Tutor ${i + 1}: Expected "${expectedName}", got "${t.name}"`);
        tutorNamesValid = false;
      }
    });
    if (tutorNamesValid) {
      console.log('   ✅ All tutor names follow correct pattern (Nguyen Minh A-J)');
    }
    
    // Validate sessions
    console.log('\n📅 VALIDATING SESSIONS:');
    const sessions = programData.sessions || [];
    let allSessionsValid = true;
    
    const validStudentIds = students.map((s: any) => s.id);
    const validTutorIds = tutors.map((t: any) => t.id);
    
    sessions.forEach((session: any, i: number) => {
      const studentValid = validStudentIds.includes(session.studentId);
      const tutorValid = validTutorIds.includes(session.tutorId);
      
      if (!studentValid) {
        console.log(`   ❌ Session ${i + 1}: Invalid student ID: ${session.studentId}`);
        allSessionsValid = false;
      }
      if (!tutorValid) {
        console.log(`   ❌ Session ${i + 1}: Invalid tutor ID: ${session.tutorId}`);
        allSessionsValid = false;
      }
    });
    
    if (allSessionsValid) {
      console.log(`   ✅ All ${sessions.length} sessions reference valid users`);
    }
    
    // Show session distribution
    console.log('\n📊 SESSION DISTRIBUTION:');
    const sessionsByStatus: any = {};
    sessions.forEach((s: any) => {
      sessionsByStatus[s.status] = (sessionsByStatus[s.status] || 0) + 1;
    });
    Object.entries(sessionsByStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Validate materials
    console.log('\n📚 VALIDATING MATERIALS:');
    const materials = programData.materials || [];
    let allMaterialsValid = true;
    
    materials.forEach((material: any, i: number) => {
      const tutorValid = validTutorIds.includes(material.uploadedBy);
      if (!tutorValid) {
        console.log(`   ❌ Material ${i + 1}: Invalid tutor ID: ${material.uploadedBy}`);
        allMaterialsValid = false;
      }
      
      // Check shared with
      if (material.sharedWith) {
        material.sharedWith.forEach((userId: string) => {
          if (!validStudentIds.includes(userId)) {
            console.log(`   ❌ Material ${i + 1}: Invalid student ID in sharedWith: ${userId}`);
            allMaterialsValid = false;
          }
        });
      }
    });
    
    if (allMaterialsValid) {
      console.log(`   ✅ All ${materials.length} materials reference valid users`);
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(70));
    if (allSessionsValid && allMaterialsValid && studentNamesValid && tutorNamesValid) {
      console.log('✅ DATABASE VALIDATION PASSED!');
      console.log('   All data integrity checks passed.');
      console.log('   All references are valid.');
      console.log('   All naming conventions followed.');
    } else {
      console.log('❌ DATABASE VALIDATION FAILED!');
      console.log('   Some issues were found. Please review above.');
      console.log('   💡 Run resetAll() to regenerate databases');
    }
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

// Auto-export to window
if (typeof window !== 'undefined') {
  (window as any).validateDatabase = validateDatabase;
}
