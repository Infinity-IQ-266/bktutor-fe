/**
 * SESSION DATA VALIDATOR
 * Validates that all sessions have required fields to prevent null errors
 */

export class SessionDataValidator {
  
  static validateAllSessions() {
    console.log('🔍 Validating Session Data...');
    console.log('='.repeat(50));
    
    const data = JSON.parse(localStorage.getItem('bk_tutor_data') || '{}');
    const sessions = data.sessions || [];
    
    if (sessions.length === 0) {
      console.error('❌ No sessions found in database');
      return false;
    }
    
    console.log(`📊 Total sessions: ${sessions.length}`);
    
    const errors: any[] = [];
    const warnings: any[] = [];
    
    sessions.forEach((session: any, idx: number) => {
      // Check required fields
      if (!session.id) {
        errors.push({ sessionIndex: idx, field: 'id', issue: 'Missing ID' });
      }
      
      if (!session.studentId) {
        errors.push({ sessionIndex: idx, sessionId: session.id, field: 'studentId', issue: 'Missing student ID' });
      }
      
      if (!session.tutorId) {
        errors.push({ sessionIndex: idx, sessionId: session.id, field: 'tutorId', issue: 'Missing tutor ID' });
      }
      
      if (!session.subject) {
        errors.push({ sessionIndex: idx, sessionId: session.id, field: 'subject', issue: 'Missing subject' });
      }
      
      if (!session.date) {
        errors.push({ sessionIndex: idx, sessionId: session.id, field: 'date', issue: 'Missing date' });
      }
      
      if (!session.status) {
        errors.push({ sessionIndex: idx, sessionId: session.id, field: 'status', issue: 'Missing status' });
      }
      
      // Check optional but recommended fields
      if (!session.topic && session.status !== 'cancelled') {
        warnings.push({ sessionId: session.id, field: 'topic', issue: 'Missing topic' });
      }
      
      // For completed sessions, check feedback
      if (session.status === 'completed') {
        if (!session.rating) {
          warnings.push({ sessionId: session.id, field: 'rating', issue: 'Completed session without rating' });
        }
        if (!session.feedback && !session.tutorFeedback) {
          warnings.push({ sessionId: session.id, field: 'feedback', issue: 'Completed session without any feedback' });
        }
      }
      
      // Validate references exist
      if (session.studentId) {
        const student = data.users?.find((u: any) => u.id === session.studentId);
        if (!student) {
          errors.push({ sessionId: session.id, field: 'studentId', issue: `Student ${session.studentId} not found` });
        }
      }
      
      if (session.tutorId) {
        const tutor = data.users?.find((u: any) => u.id === session.tutorId);
        if (!tutor) {
          errors.push({ sessionId: session.id, field: 'tutorId', issue: `Tutor ${session.tutorId} not found` });
        }
      }
    });
    
    // Report results
    console.log('\n📋 VALIDATION RESULTS');
    console.log('='.repeat(50));
    
    if (errors.length === 0) {
      console.log('✅ No critical errors found!');
    } else {
      console.error(`❌ Found ${errors.length} critical errors:`);
      errors.forEach(err => {
        console.error(`   - Session ${err.sessionId || err.sessionIndex}: ${err.field} - ${err.issue}`);
      });
    }
    
    if (warnings.length === 0) {
      console.log('✅ No warnings!');
    } else {
      console.warn(`⚠️  Found ${warnings.length} warnings:`);
      warnings.slice(0, 10).forEach(warn => {
        console.warn(`   - Session ${warn.sessionId}: ${warn.field} - ${warn.issue}`);
      });
      if (warnings.length > 10) {
        console.warn(`   ... and ${warnings.length - 10} more warnings`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (errors.length > 0) {
      console.error('❌ VALIDATION FAILED - Please reset database');
      console.log('💡 Run: resetAll()');
      return false;
    } else {
      console.log('✅ VALIDATION PASSED');
      return true;
    }
  }
  
  static fixMissingFields() {
    console.log('🔧 Attempting to fix missing fields...');
    
    const dataStr = localStorage.getItem('bk_tutor_data');
    if (!dataStr) {
      console.error('❌ No database found');
      return false;
    }
    
    const data = JSON.parse(dataStr);
    const sessions = data.sessions || [];
    let fixCount = 0;
    
    sessions.forEach((session: any) => {
      let fixed = false;
      
      // Add missing topic
      if (!session.topic && session.subject) {
        session.topic = `${session.subject} Session`;
        fixed = true;
      }
      
      // Add missing type
      if (!session.type) {
        session.type = 'in-person';
        fixed = true;
      }
      
      if (fixed) {
        fixCount++;
      }
    });
    
    if (fixCount > 0) {
      data.sessions = sessions;
      localStorage.setItem('bk_tutor_data', JSON.stringify(data));
      console.log(`✅ Fixed ${fixCount} sessions`);
      return true;
    } else {
      console.log('ℹ️  No fixes needed');
      return false;
    }
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).validateSessions = () => SessionDataValidator.validateAllSessions();
  (window as any).fixSessionData = () => SessionDataValidator.fixMissingFields();
}
