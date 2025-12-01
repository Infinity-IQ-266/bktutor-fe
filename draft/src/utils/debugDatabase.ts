// Debug utility to inspect and reset databases
// Use in browser console: import('/utils/debugDatabase.ts').then(m => m.debugDatabase())

export function debugDatabase() {
  console.log('='.repeat(60));
  console.log('BK TUTOR DATABASE DIAGNOSTIC');
  console.log('='.repeat(60));
  
  // Check SSO Database
  const ssoData = localStorage.getItem('hcmut_sso_data');
  if (ssoData) {
    try {
      const sso = JSON.parse(ssoData);
      console.log('\n✅ SSO DATABASE FOUND');
      console.log(`   Total users: ${sso.users?.length || 0}`);
      console.log(`   Last update: ${sso.lastUpdate}`);
      
      // Count by type
      const ssoTypes = sso.users.reduce((acc: any, u: any) => {
        acc[u.type] = (acc[u.type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Users by type:', ssoTypes);
      
      // Check for chair accounts
      const chairs = sso.users.filter((u: any) => u.email.startsWith('chair'));
      console.log(`\n   Department Chairs in SSO: ${chairs.length}`);
      chairs.forEach((c: any) => {
        console.log(`      ${c.email} - ${c.name}`);
      });
    } catch (error) {
      console.error('❌ Error parsing SSO data:', error);
    }
  } else {
    console.log('\n❌ SSO DATABASE NOT FOUND');
  }
  
  // Check Program Database
  const programData = localStorage.getItem('bk_tutor_data');
  if (programData) {
    try {
      const program = JSON.parse(programData);
      console.log('\n✅ PROGRAM DATABASE FOUND');
      console.log(`   Total users: ${program.users?.length || 0}`);
      console.log(`   Version: ${program.version}`);
      console.log(`   Last update: ${program.lastUpdate}`);
      
      // Count by role
      const roles = program.users.reduce((acc: any, u: any) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});
      console.log('   Users by role:', roles);
      
      // Check for chair accounts
      const chairs = program.users.filter((u: any) => u.role === 'chair');
      console.log(`\n   Department Chairs in Program: ${chairs.length}`);
      chairs.forEach((c: any) => {
        console.log(`      ${c.email} - ${c.name} - ID: ${c.id}`);
      });
      
      // Check for admin accounts
      const admins = program.users.filter((u: any) => u.role === 'administrator');
      console.log(`\n   Administrators in Program: ${admins.length}`);
      admins.forEach((a: any) => {
        console.log(`      ${a.email} - ${a.name} - ID: ${a.id}`);
      });
      
      console.log('\n   Sessions:', program.sessions?.length || 0);
      console.log('   Notifications:', program.notifications?.length || 0);
      console.log('   Materials:', program.materials?.length || 0);
    } catch (error) {
      console.error('❌ Error parsing Program data:', error);
    }
  } else {
    console.log('\n❌ PROGRAM DATABASE NOT FOUND');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('AVAILABLE COMMANDS:');
  console.log('='.repeat(60));
  console.log('resetAll()    - Clear both databases and reload');
  console.log('resetSSO()    - Clear only SSO database and reload');
  console.log('resetProgram() - Clear only Program database and reload');
  console.log('listChairs()  - List all chair accounts');
  console.log('testLogin(email, password) - Test login credentials');
  console.log('='.repeat(60));
}

export function resetAll() {
  console.log('🔄 Clearing all databases...');
  localStorage.removeItem('hcmut_sso_data');
  localStorage.removeItem('bk_tutor_data');
  console.log('✅ Databases cleared.');
  console.log('🔄 Reloading page to reinitialize...');
  setTimeout(() => location.reload(), 500);
}

export function resetSSO() {
  console.log('🔄 Clearing SSO database...');
  localStorage.removeItem('hcmut_sso_data');
  console.log('✅ SSO database cleared. Reloading page...');
  location.reload();
}

export function resetProgram() {
  console.log('🔄 Clearing Program database...');
  localStorage.removeItem('bk_tutor_data');
  console.log('✅ Program database cleared. Reloading page...');
  location.reload();
}

export function listChairs() {
  console.log('\n' + '='.repeat(60));
  console.log('DEPARTMENT CHAIR ACCOUNTS');
  console.log('='.repeat(60));
  
  const ssoData = localStorage.getItem('hcmut_sso_data');
  const programData = localStorage.getItem('bk_tutor_data');
  
  if (ssoData) {
    const sso = JSON.parse(ssoData);
    const chairs = sso.users.filter((u: any) => u.email.startsWith('chair'));
    console.log(`\n📋 SSO Database (${chairs.length} chairs):`);
    chairs.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. Email: ${c.email}`);
      console.log(`      Password: ${c.password}`);
      console.log(`      Name: ${c.name}`);
      console.log(`      Department: ${c.department}`);
      console.log('');
    });
  }
  
  if (programData) {
    const program = JSON.parse(programData);
    const chairs = program.users.filter((u: any) => u.role === 'chair');
    console.log(`\n📋 Program Database (${chairs.length} registered chairs):`);
    chairs.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. Email: ${c.email}`);
      console.log(`      Name: ${c.name}`);
      console.log(`      ID: ${c.id}`);
      console.log(`      Department: ${c.department}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(60));
}

export function testLogin(email: string, password: string) {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING LOGIN');
  console.log('='.repeat(60));
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');
  
  // Check SSO
  const ssoData = localStorage.getItem('hcmut_sso_data');
  if (ssoData) {
    const sso = JSON.parse(ssoData);
    const ssoUser = sso.users.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (ssoUser) {
      console.log('✅ SSO Authentication: SUCCESS');
      console.log(`   User: ${ssoUser.name}`);
      console.log(`   Type: ${ssoUser.type}`);
      console.log(`   Department: ${ssoUser.department}`);
    } else {
      console.log('❌ SSO Authentication: FAILED');
      console.log('   Invalid email or password');
      return;
    }
  } else {
    console.log('❌ SSO Database not found');
    return;
  }
  
  // Check Program
  const programData = localStorage.getItem('bk_tutor_data');
  if (programData) {
    const program = JSON.parse(programData);
    const programUser = program.users.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (programUser) {
      console.log('\n✅ Program Registration: FOUND');
      console.log(`   Name: ${programUser.name}`);
      console.log(`   Role: ${programUser.role}`);
      console.log(`   ID: ${programUser.id}`);
      console.log(`   Department: ${programUser.department}`);
      console.log('\n➡️  Expected: Direct login to dashboard');
    } else {
      console.log('\n⚠️  Program Registration: NOT FOUND');
      console.log('   User needs to complete signup form');
      console.log('\n➡️  Expected: Show signup page');
    }
  } else {
    console.log('\n❌ Program Database not found');
  }
  
  console.log('='.repeat(60));
}

// Show test accounts helper
export function showTestAccounts() {
  console.log('\n' + '='.repeat(60));
  console.log('🎓 BK TUTOR - TEST ACCOUNTS');
  console.log('='.repeat(60));
  
  console.log('\n👔 ADMINISTRATORS (5 accounts)');
  console.log('   Email: admin1@hcmut.edu.vn');
  console.log('   Password: admin123');
  console.log('   (Also: admin2-5@hcmut.edu.vn)');
  
  console.log('\n📊 COORDINATORS (5 accounts)');
  console.log('   Email: coord1@hcmut.edu.vn');
  console.log('   Password: 123456789');
  console.log('   (Also: coord2-5@hcmut.edu.vn)');
  
  console.log('\n🏛️  DEPARTMENT CHAIRS (5 accounts)');
  console.log('   Email: chair1@hcmut.edu.vn');
  console.log('   Password: 123456789');
  console.log('   (Also: chair2-5@hcmut.edu.vn)');
  
  console.log('\n👨‍🏫 TUTORS (10 pre-registered, 16 others can sign up)');
  console.log('   Email: tutor1@hcmut.edu.vn (Nguyen Minh A)');
  console.log('   Password: 123456789');
  console.log('   (Also: tutor2-10 = Nguyen Minh B-J)');
  console.log('   (tutor11-26 can sign up after SSO login)');
  
  console.log('\n👨‍🎓 STUDENTS (10 pre-registered, 16 others can sign up)');
  console.log('   Email: student1@hcmut.edu.vn (Nguyen Van A)');
  console.log('   Password: 123456789');
  console.log('   (Also: student2-10 = Nguyen Van B-J)');
  console.log('   (student11-26 can sign up after SSO login)');
  
  console.log('\n' + '='.repeat(60));
  console.log('📝 QUICK COMMANDS:');
  console.log('   debugDatabase()  - Show database status');
  console.log('   testLogin(email, password) - Test login');
  console.log('   resetAll()       - Fresh start');
  console.log('='.repeat(60) + '\n');
}

// Auto-run on import
if (typeof window !== 'undefined') {
  // Make functions globally available
  (window as any).debugDatabase = debugDatabase;
  (window as any).resetAll = resetAll;
  (window as any).resetSSO = resetSSO;
  (window as any).resetProgram = resetProgram;
  (window as any).listChairs = listChairs;
  (window as any).testLogin = testLogin;
  (window as any).showTestAccounts = showTestAccounts;
  
  // Show helpful info on startup
  setTimeout(() => {
    console.log('\n💡 Type showTestAccounts() to see all test account credentials');
    console.log('💡 Type debugDatabase() to check database status');
    console.log('💡 Type validateDatabase() to run full validation checks\n');
  }, 1000);
}
