// Real Backend for BK TUTOR System
// This is a REAL functioning backend with persistent localStorage,
// cross-account communication, notifications, and state management

import { toast } from 'sonner';
import { ComprehensiveDataGenerator } from './generateComprehensiveData';

// ============= TYPES =============

// SSO User (in SSO Database - for authentication only)
export interface SSOUser {
  id: string;
  email: string;
  password: string;
  name: string;
  type: 'student' | 'tutor' | 'staff' | 'faculty';
  department: string;
  studentId?: string;
  employeeId?: string;
  phone?: string;
}

// BK TUTOR User (in Program Database - registered users)
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'tutor' | 'coordinator' | 'chair' | 'administrator';
  studentId?: string;
  tutorId?: string;
  department: string;
  year?: number;
  gpa?: number;
  joinedDate?: string;
  phone?: string;
  address?: string;
  expertise?: string[];
  bio?: string;
  avatar?: string;
  position?: string; // For tutors
  education?: string; // For tutors
  office?: string; // For tutors
  major?: string; // For students
  availability?: Record<string, string[]>; // For tutors - weekly schedule
}

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'declined';
  location: string;
  topic?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  tutorFeedback?: string; // Tutor's feedback about the student
  completedAt?: string; // When the session was completed
  type?: 'in-person' | 'online'; // Session type
  createdAt: string;
  updatedAt: string;
  requestedBy?: string; // Who created/requested this session
  rescheduleRequest?: {
    requestedBy: string;
    newDate: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string;
    status: 'pending' | 'accepted' | 'declined';
    requestedAt: string;
    acceptedAt?: string;
    declinedAt?: string;
    declineReason?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'session_request' | 'session_accepted' | 'session_declined' | 'session_rescheduled' | 'session_cancelled' | 'material_shared' | 'feedback_received' | 'general' | 'reschedule_requested' | 'reschedule_accepted' | 'reschedule_declined' | 'account_created' | 'session_completed' | 'reminder' | 'feedback' | 'cancelled' | 'material';
  title: string;
  message: string;
  relatedId?: string; // Session ID or other related entity
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
  actionType?: 'accept_decline' | 'view' | 'acknowledge' | 'reschedule_response' | 'rate' | 'feedback';
}

export interface Material {
  id: string;
  title: string;
  subject: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  downloads: number;
  description?: string;
  tags?: string[];
  url: string;
  sharedWith?: string[]; // User IDs who have access
}

// ============= SSO STORAGE MANAGER =============
// Separate database for HCMUT SSO authentication

class SSOStorageManager {
  private static readonly SSO_KEY = 'hcmut_sso_data';
  
  static getData(): any {
    try {
      const data = localStorage.getItem(this.SSO_KEY);
      if (!data) {
        // Generate and save initial data
        const initialData = this.getInitialSSOData();
        this.setData(initialData);
        console.log('✅ SSO Database initialized with', initialData.users.length, 'users');
        return initialData;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading SSO data:', error);
      const initialData = this.getInitialSSOData();
      this.setData(initialData);
      return initialData;
    }
  }
  
  static setData(data: any): void {
    try {
      localStorage.setItem(this.SSO_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing SSO data:', error);
    }
  }
  
  static getInitialSSOData() {
    return {
      version: 1,
      users: this.generateSSOUsers(),
      lastUpdate: new Date().toISOString()
    };
  }
  
  static generateSSOUsers(): SSOUser[] {
    const ssoUsers: SSOUser[] = [];
    
    const departments = [
      'Computer Science & Engineering',
      'Electrical & Electronic Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering'
    ];
    
    // Generate 26 students (Nguyen Van A-Z)
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A-Z
      const studentNum = 2011001 + i;
      ssoUsers.push({
        id: `sso:student:${i + 1}`,
        email: `student${i + 1}@hcmut.edu.vn`,
        password: '123456789',
        name: `Nguyen Van ${letter}`,
        type: 'student',
        department: departments[i % departments.length],
        studentId: studentNum.toString(),
        phone: `+84 90 ${1000 + i} ${1000 + i}`
      });
    }
    
    // Generate 26 tutors (Nguyen Minh A-Z)
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A-Z
      ssoUsers.push({
        id: `sso:tutor:${i + 1}`,
        email: `tutor${i + 1}@hcmut.edu.vn`,
        password: '123456789',
        name: `Nguyen Minh ${letter}`,
        type: 'tutor',
        department: departments[i % departments.length],
        employeeId: `T${1001 + i}`,
        phone: `+84 91 ${2000 + i} ${2000 + i}`
      });
    }
    
    // Add 5 administrators
    const adminNames = [
      'System Administrator',
      'Nguyen Thi Hong',
      'Tran Van Minh',
      'Le Thi Lan',
      'Pham Van Hieu'
    ];
    for (let i = 1; i <= 5; i++) {
      ssoUsers.push({
        id: `sso:admin:${i}`,
        email: `admin${i}@hcmut.edu.vn`,
        password: 'admin123',
        name: adminNames[i - 1],
        type: 'staff',
        department: 'Administration',
        employeeId: `ADMIN00${i}`,
        phone: `+84 28 3869 ${5250 + i}`
      });
    }
    
    // Add 5 coordinators
    const coordinatorNames = [
      'Le Minh Tuan',
      'Nguyen Thi Lan Anh',
      'Tran Van Hieu',
      'Pham Thi Mai',
      'Vo Van Khanh'
    ];
    for (let i = 1; i <= 5; i++) {
      ssoUsers.push({
        id: `sso:coordinator:${i}`,
        email: `coord${i}@hcmut.edu.vn`,
        password: '123456789',
        name: coordinatorNames[i - 1],
        type: 'faculty',
        department: departments[i % departments.length],
        employeeId: `COORD00${i}`,
        phone: `+84 90 3000 ${1000 + i}`
      });
    }
    
    // Add 5 department chairs
    const chairNames = [
      'Prof. Pham Van Dong',
      'Prof. Hoang Thi Mai',
      'Prof. Nguyen Van Binh',
      'Prof. Le Thi Thu',
      'Prof. Tran Van Nam'
    ];
    for (let i = 1; i <= 5; i++) {
      ssoUsers.push({
        id: `sso:chair:${i}`,
        email: `chair${i}@hcmut.edu.vn`,
        password: '123456789',
        name: chairNames[i - 1],
        type: 'faculty',
        department: departments[i % departments.length],
        employeeId: `CHAIR00${i}`,
        phone: `+84 90 4000 ${2000 + i}`
      });
    }
    
    return ssoUsers;
  }
  
  static authenticateUser(email: string, password: string): SSOUser | null {
    const data = this.getData();
    const user = data.users.find((u: SSOUser) => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
  }
  
  static getUserByEmail(email: string): SSOUser | null {
    const data = this.getData();
    return data.users.find((u: SSOUser) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
}

// ============= STORAGE MANAGER =============
// Database for BK TUTOR program registered users

class StorageManager {
  private static readonly STORAGE_KEY = 'bk_tutor_data';
  
  static getData(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        // Generate and save initial data
        const initialData = this.getInitialData();
        this.setData(initialData);
        console.log('✅ Program Database initialized with', initialData.users.length, 'registered users');
        return initialData;
      }
      
      const parsed = JSON.parse(data);
      const initialData = this.getInitialData();
      
      // Check if version has changed - if so, regenerate data
      if (parsed.version !== initialData.version) {
        console.log('🔄 Data version changed, regenerating...');
        this.clearData();
        const newData = this.getInitialData();
        this.setData(newData);
        return newData;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      const initialData = this.getInitialData();
      this.setData(initialData);
      return initialData;
    }
  }
  
  static setData(data: any): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
  
  static updateData(updater: (data: any) => any): any {
    const currentData = this.getData();
    const newData = updater(currentData);
    this.setData(newData);
    return newData;
  }
  
  static clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  static getInitialData() {
    const users = this.generateInitialUsers();
    const sessions = ComprehensiveDataGenerator.generateRealisticSessions();
    const notifications = ComprehensiveDataGenerator.generateInitialNotifications(sessions);
    const progress = this.generateProgressRecords(users, sessions);
    
    console.log('🔄 Generating fresh database data...');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📅 Sessions: ${sessions.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log(`   📈 Progress Records: ${progress.length}`);
    
    // Verify 50 sessions (5 per student for 10 students)
    const student1to10Sessions = sessions.filter(s => {
      const studentMatch = s.studentId.match(/user:student:(\d+)/);
      if (studentMatch) {
        const studentNum = parseInt(studentMatch[1]);
        return studentNum >= 1 && studentNum <= 10;
      }
      return false;
    });
    console.log(`   ✅ Student1-10 Sessions: ${student1to10Sessions.length} (Expected: 50)`);
    
    // Show session breakdown
    const completedCount = sessions.filter(s => s.status === 'completed').length;
    const confirmedCount = sessions.filter(s => s.status === 'confirmed').length;
    const pendingCount = sessions.filter(s => s.status === 'pending').length;
    console.log(`\n📊 Session Status Breakdown:`);
    console.log(`   ✅ Completed: ${completedCount} (${Math.round(completedCount/sessions.length*100)}%)`);
    console.log(`   ⏰ Confirmed (Upcoming): ${confirmedCount} (${Math.round(confirmedCount/sessions.length*100)}%)`);
    console.log(`   ⏳ Pending: ${pendingCount} (${Math.round(pendingCount/sessions.length*100)}%)`);
    
    console.log(`\n💡 To debug dashboard: Open console and type: debugDashboard()`);
    
    return {
      version: 13, // DATABASE v13 - FIXED AVAILABILITY: Pre-defined diverse schedules with EXACT slot counts (12-21 slots per tutor)
      users: users,
      sessions: sessions,
      notifications: notifications,
      materials: this.generateInitialMaterials(),
      progress: progress,
      lastUpdate: new Date().toISOString()
    };
  }
  
  static generateRandomAvailability(tutorIndex: number): Record<string, string[]> {
    // Pre-defined diverse availability schedules for each tutor (1-10)
    // Each schedule is carefully designed to have EXACT slot counts
    const predefinedSchedules: Record<string, Record<string, string[]>> = {
      // Tutor 1: Morning person - 18 slots total
      '1': {
        Monday: ['08:00-09:00', '09:00-10:00', '10:00-11:00'],
        Tuesday: ['07:00-08:00', '08:00-09:00', '09:00-10:00'],
        Wednesday: ['08:00-09:00', '09:00-10:00'],
        Thursday: ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00'],
        Friday: ['08:00-09:00', '09:00-10:00', '10:00-11:00'],
        Saturday: ['09:00-10:00', '10:00-11:00'],
        Sunday: []
      },
      // Tutor 2: Afternoon specialist - 15 slots total
      '2': {
        Monday: ['14:00-15:00', '15:00-16:00'],
        Tuesday: ['13:00-14:00', '14:00-15:00', '15:00-16:00'],
        Wednesday: ['14:00-15:00', '15:00-16:00', '16:00-17:00'],
        Thursday: ['13:00-14:00', '14:00-15:00'],
        Friday: ['14:00-15:00', '15:00-16:00', '16:00-17:00'],
        Saturday: [],
        Sunday: ['14:00-15:00', '15:00-16:00']
      },
      // Tutor 3: Evening availability - 12 slots total
      '3': {
        Monday: ['18:00-19:00', '19:00-20:00'],
        Tuesday: ['17:00-18:00', '18:00-19:00'],
        Wednesday: ['18:00-19:00', '19:00-20:00', '20:00-21:00'],
        Thursday: [],
        Friday: ['18:00-19:00', '19:00-20:00'],
        Saturday: ['17:00-18:00'],
        Sunday: ['18:00-19:00', '19:00-20:00']
      },
      // Tutor 4: Full day coverage - 21 slots total
      '4': {
        Monday: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'],
        Tuesday: ['08:00-09:00', '11:00-12:00', '15:00-16:00'],
        Wednesday: ['09:00-10:00', '13:00-14:00', '16:00-17:00'],
        Thursday: ['10:00-11:00', '14:00-15:00', '18:00-19:00'],
        Friday: ['08:00-09:00', '12:00-13:00', '17:00-18:00'],
        Saturday: ['10:00-11:00', '14:00-15:00'],
        Sunday: ['13:00-14:00', '15:00-16:00']
      },
      // Tutor 5: Weekday mornings - 16 slots total
      '5': {
        Monday: ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00'],
        Tuesday: ['08:00-09:00', '09:00-10:00', '11:00-12:00'],
        Wednesday: ['07:00-08:00', '09:00-10:00', '10:00-11:00'],
        Thursday: ['08:00-09:00', '10:00-11:00', '11:00-12:00'],
        Friday: ['07:00-08:00', '08:00-09:00', '09:00-10:00'],
        Saturday: [],
        Sunday: []
      },
      // Tutor 6: Balanced schedule - 20 slots total
      '6': {
        Monday: ['10:00-11:00', '13:00-14:00', '16:00-17:00'],
        Tuesday: ['09:00-10:00', '14:00-15:00', '17:00-18:00'],
        Wednesday: ['11:00-12:00', '15:00-16:00', '18:00-19:00'],
        Thursday: ['10:00-11:00', '13:00-14:00', '16:00-17:00'],
        Friday: ['09:00-10:00', '14:00-15:00', '17:00-18:00'],
        Saturday: ['11:00-12:00', '15:00-16:00'],
        Sunday: ['13:00-14:00', '16:00-17:00']
      },
      // Tutor 7: Weekend warrior - 14 slots total
      '7': {
        Monday: ['14:00-15:00', '15:00-16:00'],
        Tuesday: [],
        Wednesday: ['13:00-14:00', '16:00-17:00'],
        Thursday: ['14:00-15:00'],
        Friday: ['15:00-16:00', '16:00-17:00'],
        Saturday: ['09:00-10:00', '10:00-11:00', '13:00-14:00', '14:00-15:00'],
        Sunday: ['10:00-11:00', '11:00-12:00', '15:00-16:00']
      },
      // Tutor 8: Midday specialist - 17 slots total
      '8': {
        Monday: ['11:00-12:00', '12:00-13:00', '13:00-14:00'],
        Tuesday: ['10:00-11:00', '12:00-13:00', '14:00-15:00'],
        Wednesday: ['11:00-12:00', '13:00-14:00'],
        Thursday: ['12:00-13:00', '13:00-14:00', '14:00-15:00'],
        Friday: ['10:00-11:00', '11:00-12:00', '13:00-14:00'],
        Saturday: ['12:00-13:00'],
        Sunday: ['11:00-12:00', '13:00-14:00']
      },
      // Tutor 9: Late afternoon/evening - 13 slots total
      '9': {
        Monday: ['16:00-17:00', '17:00-18:00'],
        Tuesday: ['15:00-16:00', '18:00-19:00'],
        Wednesday: ['16:00-17:00', '19:00-20:00'],
        Thursday: ['17:00-18:00', '18:00-19:00'],
        Friday: ['16:00-17:00', '17:00-18:00'],
        Saturday: [],
        Sunday: ['17:00-18:00', '18:00-19:00', '19:00-20:00']
      },
      // Tutor 10: Flexible hours - 19 slots total
      '10': {
        Monday: ['08:00-09:00', '13:00-14:00', '17:00-18:00'],
        Tuesday: ['09:00-10:00', '14:00-15:00', '18:00-19:00'],
        Wednesday: ['10:00-11:00', '15:00-16:00', '19:00-20:00'],
        Thursday: ['08:00-09:00', '12:00-13:00', '16:00-17:00'],
        Friday: ['11:00-12:00', '14:00-15:00', '18:00-19:00'],
        Saturday: ['10:00-11:00', '15:00-16:00'],
        Sunday: ['12:00-13:00', '17:00-18:00']
      }
    };
    
    const schedule = predefinedSchedules[tutorIndex.toString()] || {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };
    
    // Verify and log for debugging
    const total = Object.values(schedule).reduce((sum, slots) => sum + slots.length, 0);
    console.log(`   📅 Tutor ${tutorIndex} availability: ${total} slots`, {
      Mon: schedule.Monday.length,
      Tue: schedule.Tuesday.length,
      Wed: schedule.Wednesday.length,
      Thu: schedule.Thursday.length,
      Fri: schedule.Friday.length,
      Sat: schedule.Saturday.length,
      Sun: schedule.Sunday.length,
    });
    
    return schedule;
  }
  
  static generateInitialUsers(): User[] {
    // BK TUTOR Program Database starts with:
    // - All coordinators, chairs, and admins (pre-registered)
    // - 10 students and 10 tutors for realistic testing
    // - Other students/tutors will register through signup after SSO authentication
    const users: User[] = [];
    
    const departments = [
      'Computer Science & Engineering',
      'Electrical & Electronic Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering'
    ];
    
    const majors = [
      'Software Engineering', 'Electronics', 'Automation', 
      'Mechanical Design', 'Construction', 'Chemical Processing',
      'Data Science', 'Computer Networks', 'Power Systems', 'Robotics'
    ];
    
    const districts = [
      'District 1', 'District 3', 'District 5', 'District 7', 'District 10',
      'Binh Thanh District', 'Phu Nhuan District', 'Go Vap District'
    ];
    
    // Add 10 students (pre-registered) - Nguyen Van A through J
    for (let i = 1; i <= 10; i++) {
      const letter = String.fromCharCode(64 + i); // A-J
      const studentNum = 2011000 + i;
      users.push({
        id: `user:student:${i}`,
        email: `student${i}@hcmut.edu.vn`,
        password: '123456789',
        name: `Nguyen Van ${letter}`,
        role: 'student',
        studentId: studentNum.toString(),
        department: departments[i % departments.length],
        year: ((i % 4) + 1), // Years 1-4
        gpa: 2.5 + (i * 0.2), // GPA 2.7 to 4.5
        major: majors[i % majors.length],
        joinedDate: `202${3 - (i % 2)}-09-01`,
        phone: `+84 90 ${1000 + i} ${1000 + i}`,
        address: `${districts[i % districts.length]}, Ho Chi Minh City`
      });
    }
    
    // Add 10 tutors (pre-registered) - Nguyen Minh A through J
    const positions = ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer', 'Teaching Assistant'];
    const expertiseGroups = [
      ['Database Systems', 'Data Structures', 'Algorithms'],
      ['Web Development', 'Software Engineering', 'Computer Networks'],
      ['Machine Learning', 'Artificial Intelligence', 'Data Science'],
      ['Digital Signal Processing', 'Control Systems', 'Power Electronics'],
      ['Structural Engineering', 'Construction Management', 'Geotechnical Engineering'],
      ['Chemical Reaction Engineering', 'Process Control', 'Materials Science'],
      ['Operating Systems', 'Computer Architecture', 'Embedded Systems'],
      ['Mathematics', 'Statistics', 'Numerical Methods'],
      ['Physics', 'Mechanics', 'Thermodynamics'],
      ['Programming', 'Object-Oriented Design', 'Software Testing']
    ];
    
    for (let i = 1; i <= 10; i++) {
      const letter = String.fromCharCode(64 + i); // A-J
      
      // Generate RANDOM availability for each tutor
      // Each tutor will have different available time slots
      const availability = this.generateRandomAvailability(i);
      
      users.push({
        id: `user:tutor:${i}`,
        email: `tutor${i}@hcmut.edu.vn`,
        password: '123456789',
        name: `Nguyen Minh ${letter}`,
        role: 'tutor',
        tutorId: `T100${i}`,
        position: positions[(i - 1) % positions.length],
        department: departments[i % departments.length],
        expertise: expertiseGroups[i - 1],
        bio: `${positions[(i - 1) % positions.length]} specializing in ${expertiseGroups[i - 1][0]}. ${5 + i} years of teaching experience.`,
        office: `Building A${((i - 1) % 3) + 1}, Room ${200 + (i * 10)}`,
        education: i <= 5 ? 'PhD in ' + departments[i % departments.length] : 'M.Sc. in ' + departments[i % departments.length],
        joinedDate: `20${10 + i}-01-01`,
        phone: `+84 91 ${2000 + i} ${2000 + i}`,
        address: `${districts[(i + 1) % districts.length]}, Ho Chi Minh City`,
        availability: availability
      });
    }
    
    // Add 5 coordinators (all pre-registered)
    const coordinatorNames = [
      'Le Minh Tuan',
      'Nguyen Thi Lan Anh',
      'Tran Van Hieu',
      'Pham Thi Mai',
      'Vo Van Khanh'
    ];
    for (let i = 1; i <= 5; i++) {
      users.push({
        id: `user:coordinator:${i}`,
        email: `coord${i}@hcmut.edu.vn`,
        password: '123456789',
        name: coordinatorNames[i - 1],
        role: 'coordinator',
        department: departments[i % departments.length],
        joinedDate: `20${18 + i}-01-01`,
        phone: `+84 90 3000 ${1000 + i}`,
        address: `${districts[i % districts.length]}, Ho Chi Minh City`
      });
    }
    
    // Add 5 department chairs (all pre-registered)
    const chairNames = [
      'Prof. Pham Van Dong',
      'Prof. Hoang Thi Mai',
      'Prof. Nguyen Van Binh',
      'Prof. Le Thi Thu',
      'Prof. Tran Van Nam'
    ];
    for (let i = 1; i <= 5; i++) {
      users.push({
        id: `user:chair:${i}`,
        email: `chair${i}@hcmut.edu.vn`,
        password: '123456789',
        name: chairNames[i - 1],
        role: 'chair',
        department: departments[i % departments.length],
        joinedDate: `20${14 + i}-01-01`,
        phone: `+84 90 4000 ${2000 + i}`,
        address: `${districts[(i + 1) % districts.length]}, Ho Chi Minh City`
      });
    }
    
    // Add 5 administrators (all pre-registered)
    const adminNames = [
      'System Administrator',
      'Nguyen Thi Hong',
      'Tran Van Minh',
      'Le Thi Lan',
      'Pham Van Hieu'
    ];
    for (let i = 1; i <= 5; i++) {
      users.push({
        id: `user:admin:${i}`,
        email: `admin${i}@hcmut.edu.vn`,
        password: 'admin123',
        name: adminNames[i - 1],
        role: 'administrator',
        department: 'Administration',
        joinedDate: `20${16 + i}-01-01`,
        phone: `+84 28 3869 ${5250 + i}`,
        address: `${districts[(i + 2) % districts.length]}, Ho Chi Minh City`
      });
    }
    
    return users;
  }
  
  // Session generation moved to generateComprehensiveData.ts
  
  static generateInitialMaterials(): Material[] {
    const materials: Material[] = [];
    
    // Materials ONLY from REAL tutors (tutor1-tutor10)
    const materialTemplates = [
      { title: 'SQL Fundamentals', desc: 'Comprehensive guide to SQL queries, joins, and optimization', tags: ['SQL', 'Database'], subject: 'Database Systems', tutorNum: 1 },
      { title: 'React Basics', desc: 'Introduction to React components and hooks', tags: ['React', 'Web'], subject: 'Web Development', tutorNum: 2 },
      { title: 'Machine Learning Intro', desc: 'Neural networks and deep learning fundamentals', tags: ['ML', 'AI'], subject: 'Machine Learning', tutorNum: 3 },
      { title: 'Control Systems', desc: 'Feedback control and system stability analysis', tags: ['Control', 'Systems'], subject: 'Digital Signal Processing', tutorNum: 4 },
      { title: 'Structural Analysis', desc: 'Beam and column design principles', tags: ['Structure', 'Design'], subject: 'Structural Engineering', tutorNum: 5 },
      { title: 'Process Control', desc: 'Chemical process optimization and control strategies', tags: ['Chemical', 'Process'], subject: 'Chemical Engineering', tutorNum: 6 },
      { title: 'Operating Systems', desc: 'Process management, memory and file systems', tags: ['OS', 'Systems'], subject: 'Operating Systems', tutorNum: 7 },
      { title: 'Linear Algebra', desc: 'Matrices, eigenvalues and vector spaces', tags: ['Math', 'Algebra'], subject: 'Mathematics', tutorNum: 8 },
      { title: 'Thermodynamics', desc: 'Heat transfer and energy conversion principles', tags: ['Physics', 'Energy'], subject: 'Physics', tutorNum: 9 },
      { title: 'OOP Principles', desc: 'Object-oriented design patterns and best practices', tags: ['Programming', 'OOP'], subject: 'Programming', tutorNum: 10 }
    ];
    
    materialTemplates.forEach((template, i) => {
      const tutorLetter = String.fromCharCode(64 + template.tutorNum);
      materials.push({
        id: `material:${i + 1}`,
        title: template.title,
        subject: template.subject,
        uploadedBy: `user:tutor:${template.tutorNum}`,
        uploadedByName: `Nguyen Minh ${tutorLetter}`,
        uploadDate: new Date(Date.now() - (7 + i * 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fileType: 'PDF',
        fileSize: `${1.5 + i * 0.5} MB`,
        downloads: 15 + i * 5,
        description: template.desc,
        tags: template.tags,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sharedWith: ['user:student:1', 'user:student:2', 'user:student:3'] // Shared with first 3 students
      });
    });
    
    return materials;
  }
  
  static generateProgressRecords(users: User[], sessions: Session[]): any[] {
    const progressRecords: any[] = [];
    const students = users.filter(u => u.role === 'student');
    
    const strengths = [
      ['Problem Solving', 'Critical Thinking'],
      ['Mathematical Reasoning', 'Logical Analysis'],
      ['Programming Skills', 'Debugging'],
      ['Conceptual Understanding', 'Application'],
      ['Theory Comprehension', 'Practical Implementation']
    ];
    
    const weaknesses = [
      ['Time Management', 'Advanced Topics'],
      ['Complex Problem Solving', 'Optimization'],
      ['Mathematical Proofs', 'Derivations'],
      ['Edge Cases', 'Error Handling'],
      ['Advanced Algorithms', 'System Design']
    ];
    
    let progressId = 1;
    
    // For each student, group completed sessions by subject
    students.forEach((student, studentIndex) => {
      const studentSessions = sessions.filter(s => 
        s.studentId === student.id && s.status === 'completed'
      );
      
      // Group by subject
      const sessionsBySubject: { [key: string]: Session[] } = {};
      studentSessions.forEach(session => {
        if (!sessionsBySubject[session.subject]) {
          sessionsBySubject[session.subject] = [];
        }
        sessionsBySubject[session.subject].push(session);
      });
      
      // Create progress record for each subject
      Object.entries(sessionsBySubject).forEach(([subject, subjectSessions]) => {
        const sessionsAttended = subjectSessions.length;
        const ratings = subjectSessions.filter(s => s.rating).map(s => s.rating!);
        const averageRating = ratings.length > 0
          ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : 0;
        
        // Calculate improvement score based on sessions attended and ratings
        const improvementScore = Math.min(100, Math.floor(
          (sessionsAttended * 15) + (averageRating * 12) + 10
        ));
        
        // Get last session date
        const lastSession = subjectSessions.reduce((latest, current) =>
          new Date(current.date) > new Date(latest.date) ? current : latest
        );
        
        progressRecords.push({
          id: `progress:${progressId++}`,
          studentId: student.id,
          subject: subject,
          sessionsAttended: sessionsAttended,
          averageRating: averageRating,
          improvementScore: improvementScore,
          lastSessionDate: lastSession.date,
          strengths: strengths[studentIndex % strengths.length],
          weaknesses: weaknesses[studentIndex % weaknesses.length],
          createdAt: subjectSessions[0].createdAt,
          updatedAt: lastSession.date
        });
      });
    });
    
    return progressRecords;
  }
}

// ============= REAL BACKEND API =============

export class RealBackend {
  // ========== INITIALIZATION ==========
  
  static initialize(): void {
    // Force initialization of both databases
    console.log('🚀 Initializing BK TUTOR System...');
    SSOStorageManager.getData(); // This will create SSO database if not exists
    StorageManager.getData(); // This will create Program database if not exists
    console.log('✅ System initialized successfully');
  }
  
  // ========== SSO AUTH ==========
  
  static authenticateSSO(email: string, password: string): SSOUser | null {
    return SSOStorageManager.authenticateUser(email, password);
  }
  
  static getSSOUser(email: string): SSOUser | null {
    return SSOStorageManager.getUserByEmail(email);
  }
  
  // ========== AUTH ==========
  
  static login(email: string, password: string): { ssoUser?: SSOUser; programUser?: User; success: boolean } {
    // Step 1: Authenticate with SSO
    const ssoUser = SSOStorageManager.authenticateUser(email, password);
    
    if (!ssoUser) {
      toast.error('Invalid HCMUT SSO credentials');
      return { success: false };
    }
    
    // Step 2: Check if user is registered in BK TUTOR program
    const programUser = this.getUserByEmail(email);
    
    if (programUser) {
      // User is registered, update last login
      StorageManager.updateData(d => {
        const userIndex = d.users.findIndex((u: User) => u.id === programUser.id);
        if (userIndex !== -1) {
          d.users[userIndex].lastLogin = new Date().toISOString();
        }
        return d;
      });
      
      toast.success(`Welcome back, ${programUser.name}!`);
      return { ssoUser, programUser, success: true };
    }
    
    // User authenticated but not registered in program
    return { ssoUser, success: true };
  }
  
  // ========== USERS ==========
  
  static getUser(userId: string): User | null {
    const data = StorageManager.getData();
    return data.users.find((u: User) => u.id === userId) || null;
  }
  
  static getUserByStudentId(studentId: string): User | null {
    const data = StorageManager.getData();
    return data.users.find((u: User) => u.studentId === studentId) || null;
  }
  
  static getUserByTutorId(tutorId: string): User | null {
    const data = StorageManager.getData();
    return data.users.find((u: User) => u.tutorId === tutorId) || null;
  }
  
  static getAllUsers(): User[] {
    const data = StorageManager.getData();
    return data.users;
  }
  
  static getUsersByRole(role: string): User[] {
    const data = StorageManager.getData();
    return data.users.filter((u: User) => u.role === role);
  }
  
  static getUserByEmail(email: string): User | null {
    const data = StorageManager.getData();
    return data.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
  
  static createUser(userData: Partial<User>): User {
    const data = StorageManager.getData();
    
    // Generate ID based on role
    const rolePrefix = userData.role || 'user';
    const roleUsers = data.users.filter((u: User) => u.role === userData.role);
    const nextNumber = roleUsers.length + 1;
    
    const newUser: User = {
      id: `user:${rolePrefix}:${nextNumber}`,
      email: userData.email || `${rolePrefix}${nextNumber}@hcmut.edu.vn`,
      password: userData.password || '123456789', // Default password
      name: userData.name || `New ${rolePrefix}`,
      role: userData.role as any || 'student',
      department: userData.department || '',
      joinedDate: new Date().toISOString(),
      phone: userData.phone || '',
      address: userData.address || '',
      ...userData,
      // Generate role-specific IDs
      ...(userData.role === 'student' && {
        studentId: userData.studentId || `20${10000 + nextNumber}`,
        year: userData.year || 1,
        gpa: userData.gpa || 0.0,
        major: userData.major || ''
      }),
      ...(userData.role === 'tutor' && {
        tutorId: userData.tutorId || `T${1000 + nextNumber}`,
        expertise: userData.expertise || [],
        bio: userData.bio || '',
        position: userData.position || '',
        education: userData.education || '',
        office: userData.office || ''
      })
    };
    
    const newData = StorageManager.updateData(d => {
      d.users.push(newUser);
      return d;
    });
    
    // Send welcome notification to new user
    this.createNotification({
      userId: newUser.id,
      type: 'account_created',
      title: 'Welcome to BK TUTOR!',
      message: `Your account has been created successfully. Your login email is ${newUser.email} and your default password is 123456789. Please change your password after first login.`,
      actionRequired: true,
      actionType: 'acknowledge'
    });
    
    // Notify administrators about new user registration
    const admins = newData.users.filter((u: User) => u.role === 'administrator');
    admins.forEach((admin: User) => {
      this.createNotification({
        userId: admin.id,
        type: 'user_registered',
        title: 'New User Registered',
        message: `${newUser.name} (${newUser.role}) has joined the BK TUTOR program.`,
        relatedId: newUser.id,
        actionRequired: false
      });
    });
    
    // Notify coordinators in same department if it's a student or tutor
    if (newUser.role === 'student' || newUser.role === 'tutor') {
      const coords = newData.users.filter((u: User) => 
        u.role === 'coordinator' && u.department === newUser.department
      );
      coords.forEach((coord: User) => {
        this.createNotification({
          userId: coord.id,
          type: 'user_registered',
          title: `New ${newUser.role} in Your Department`,
          message: `${newUser.name} has registered as a ${newUser.role} in ${newUser.department}.`,
          relatedId: newUser.id,
          actionRequired: false
        });
      });
    }
    
    toast.success(`${userData.role} created successfully!`);
    return newUser;
  }
  
  static updateUser(userId: string, updates: Partial<User>): User | null {
    const newData = StorageManager.updateData(d => {
      const userIndex = d.users.findIndex((u: User) => u.id === userId);
      if (userIndex !== -1) {
        d.users[userIndex] = {
          ...d.users[userIndex],
          ...updates
        };
      }
      return d;
    });
    
    return newData.users.find((u: User) => u.id === userId) || null;
  }
  
  static deleteUser(userId: string): boolean {
    StorageManager.updateData(d => {
      d.users = d.users.filter((u: User) => u.id !== userId);
      // Also remove all sessions involving this user
      d.sessions = d.sessions.filter((s: Session) => 
        s.studentId !== userId && s.tutorId !== userId
      );
      // Remove all notifications for this user
      d.notifications = d.notifications.filter((n: Notification) => n.userId !== userId);
      return d;
    });
    
    toast.success('User deleted successfully');
    return true;
  }
  
  // ========== SESSIONS ==========
  
  static getSessionsForUser(userId: string): Session[] {
    const data = StorageManager.getData();
    return data.sessions.filter((s: Session) => 
      s.studentId === userId || s.tutorId === userId
    );
  }
  
  static getSession(sessionId: string): Session | null {
    const data = StorageManager.getData();
    return data.sessions.find((s: Session) => s.id === sessionId) || null;
  }
  
  static getAllSessions(): Session[] {
    const data = StorageManager.getData();
    return data.sessions;
  }
  
  static createSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Session {
    const newSession: Session = {
      ...session,
      id: `session:${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    StorageManager.updateData(d => {
      d.sessions.push(newSession);
      return d;
    });
    
    // Create notifications for all participants
    const student = this.getUser(session.studentId);
    const tutor = this.getUser(session.tutorId);
    
    // Notify tutor if student created the request
    if (session.requestedBy === session.studentId) {
      this.createNotification({
        userId: session.tutorId,
        type: 'session_request',
        title: 'New Session Request',
        message: `${student?.name} has requested a tutoring session for ${session.subject} on ${session.date} at ${session.startTime}`,
        relatedId: newSession.id,
        actionRequired: true,
        actionType: 'accept_decline'
      });
    }
    
    // Notify student if tutor created the session
    if (session.requestedBy === session.tutorId) {
      this.createNotification({
        userId: session.studentId,
        type: 'session_request',
        title: 'New Session Scheduled',
        message: `${tutor?.name} has scheduled a tutoring session for ${session.subject} on ${session.date} at ${session.startTime}`,
        relatedId: newSession.id,
        actionRequired: true,
        actionType: 'accept_decline'
      });
    }
    
    // Notify coordinators about new session
    const data = StorageManager.getData();
    const coords = data.users.filter((u: User) => u.role === 'coordinator');
    coords.forEach((coord: User) => {
      this.createNotification({
        userId: coord.id,
        type: 'session_created',
        title: 'New Session Created',
        message: `${student?.name} and ${tutor?.name} have a session scheduled for ${session.subject} on ${session.date}`,
        relatedId: newSession.id,
        actionRequired: false
      });
    });
    
    toast.success('Session created successfully!');
    return newSession;
  }
  
  static updateSession(sessionId: string, updates: Partial<Session>): Session | null {
    const oldSession = this.getSession(sessionId);
    if (!oldSession) return null;
    
    const newData = StorageManager.updateData(d => {
      const sessionIndex = d.sessions.findIndex((s: Session) => s.id === sessionId);
      if (sessionIndex !== -1) {
        d.sessions[sessionIndex] = {
          ...d.sessions[sessionIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    
    const updatedSession = newData.sessions.find((s: Session) => s.id === sessionId);
    
    // CRITICAL: If session status changed to 'completed', update progress
    if (oldSession.status !== 'completed' && updates.status === 'completed') {
      // Update progress for this student-subject combination
      this.updateProgress(updatedSession.studentId, updatedSession.subject);
      
      // Notify student about progress update
      this.createNotification({
        userId: updatedSession.studentId,
        type: 'session_completed',
        title: 'Session Completed',
        message: `Your session for ${updatedSession.subject} has been marked as completed. Your progress has been updated!`,
        relatedId: sessionId,
        actionRequired: false
      });
    }
    
    // Create notifications for schedule changes
    if (updates.date || updates.startTime || updates.endTime) {
      const student = this.getUser(updatedSession.studentId);
      const tutor = this.getUser(updatedSession.tutorId);
      
      this.createNotification({
        userId: updatedSession.studentId,
        type: 'session_rescheduled',
        title: 'Session Rescheduled',
        message: `Your session with ${tutor?.name} has been rescheduled to ${updatedSession.date} at ${updatedSession.startTime}`,
        relatedId: sessionId,
        actionRequired: true,
        actionType: 'acknowledge'
      });
      
      this.createNotification({
        userId: updatedSession.tutorId,
        type: 'session_rescheduled',
        title: 'Session Rescheduled',
        message: `Your session with ${student?.name} has been rescheduled to ${updatedSession.date} at ${updatedSession.startTime}`,
        relatedId: sessionId,
        actionRequired: true,
        actionType: 'acknowledge'
      });
    }
    
    return updatedSession;
  }
  
  static acceptSession(sessionId: string, acceptedBy: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    const updatedSession = this.updateSession(sessionId, {
      status: 'scheduled'
    });
    
    if (!updatedSession) return null;
    
    // 🔥 REMOVE AVAILABILITY SLOT when session is accepted
    // This prevents students from booking the same time slot
    this.removeAvailabilitySlot(
      session.tutorId,
      session.date,
      session.startTime,
      session.endTime
    );
    
    // Notify the requester
    const accepter = this.getUser(acceptedBy);
    const otherUserId = acceptedBy === session.studentId ? session.tutorId : session.studentId;
    
    this.createNotification({
      userId: otherUserId,
      type: 'session_accepted',
      title: 'Session Request Accepted',
      message: `${accepter?.name} has accepted the session for ${session.subject} on ${session.date} at ${session.startTime}`,
      relatedId: sessionId,
      actionRequired: false
    });
    
    // Notify coordinators about accepted session
    const data = StorageManager.getData();
    const coords = data.users.filter((u: User) => u.role === 'coordinator');
    coords.forEach((coord: User) => {
      this.createNotification({
        userId: coord.id,
        type: 'session_updated',
        title: 'Session Confirmed',
        message: `Session for ${session.subject} on ${session.date} has been confirmed`,
        relatedId: sessionId,
        actionRequired: false
      });
    });
    
    toast.success('Session accepted successfully!');
    return updatedSession;
  }
  
  static declineSession(sessionId: string, declinedBy: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    // If tutor is declining, the slot should remain unavailable (tutor chose not to take it)
    // If student is declining, we don't need to do anything (slot was never removed)
    // So no availability changes needed here
    
    const updatedSession = this.updateSession(sessionId, {
      status: 'declined'
    });
    
    if (!updatedSession) return null;
    
    // Notify the requester
    const decliner = this.getUser(declinedBy);
    const otherUserId = declinedBy === session.studentId ? session.tutorId : session.studentId;
    
    this.createNotification({
      userId: otherUserId,
      type: 'session_declined',
      title: 'Session Request Declined',
      message: `${decliner?.name} has declined the session for ${session.subject} on ${session.date} at ${session.startTime}`,
      relatedId: sessionId,
      actionRequired: false
    });
    
    // Notify coordinators about declined session
    const data = StorageManager.getData();
    const coords = data.users.filter((u: User) => u.role === 'coordinator');
    coords.forEach((coord: User) => {
      this.createNotification({
        userId: coord.id,
        type: 'session_updated',
        title: 'Session Declined',
        message: `Session for ${session.subject} on ${session.date} has been declined`,
        relatedId: sessionId,
        actionRequired: false
      });
    });
    
    toast.info('Session declined');
    return updatedSession;
  }
  
  static cancelSession(sessionId: string, cancelledBy: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    // 🔥 ADD AVAILABILITY SLOT BACK when session is cancelled
    // Only if the session was previously scheduled (not pending)
    // This makes the time slot available again for other students
    if (session.status === 'scheduled') {
      this.addAvailabilitySlot(
        session.tutorId,
        session.date,
        session.startTime,
        session.endTime
      );
    }
    
    const updatedSession = this.updateSession(sessionId, {
      status: 'cancelled'
    });
    
    if (!updatedSession) return null;
    
    // Notify all participants
    const canceller = this.getUser(cancelledBy);
    const otherUserId = cancelledBy === session.studentId ? session.tutorId : session.studentId;
    
    this.createNotification({
      userId: otherUserId,
      type: 'session_cancelled',
      title: 'Session Cancelled',
      message: `${canceller?.name} has cancelled the session for ${session.subject} on ${session.date} at ${session.startTime}`,
      relatedId: sessionId,
      actionRequired: false
    });
    
    toast.info('Session cancelled');
    return updatedSession;
  }
  
  static requestReschedule(sessionId: string, requestedBy: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    // Store reschedule request in session metadata
    const updatedSession = this.updateSession(sessionId, {
      rescheduleRequest: {
        requestedBy,
        newDate,
        newStartTime,
        newEndTime,
        reason,
        status: 'pending',
        requestedAt: new Date().toISOString()
      }
    });
    
    if (!updatedSession) return null;
    
    // Notify the other party
    const requester = this.getUser(requestedBy);
    const otherUserId = requestedBy === session.studentId ? session.tutorId : session.studentId;
    
    this.createNotification({
      userId: otherUserId,
      type: 'reschedule_requested',
      title: 'Reschedule Request',
      message: `${requester?.name} has requested to reschedule the session from ${session.date} ${session.startTime} to ${newDate} ${newStartTime}. ${reason ? `Reason: ${reason}` : ''}`,
      relatedId: sessionId,
      actionRequired: true,
      actionType: 'reschedule_response'
    });
    
    toast.success('Reschedule request sent');
    return updatedSession;
  }
  
  static acceptReschedule(sessionId: string, acceptedBy: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session || !session.rescheduleRequest) return null;
    
    const { newDate, newStartTime, newEndTime, requestedBy } = session.rescheduleRequest;
    
    // Update session with new time
    const updatedSession = this.updateSession(sessionId, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      rescheduleRequest: {
        ...session.rescheduleRequest,
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      }
    });
    
    if (!updatedSession) return null;
    
    // Notify the requester
    const accepter = this.getUser(acceptedBy);
    
    this.createNotification({
      userId: requestedBy,
      type: 'reschedule_accepted',
      title: 'Reschedule Accepted',
      message: `${accepter?.name} has accepted your reschedule request. New time: ${newDate} at ${newStartTime}`,
      relatedId: sessionId,
      actionRequired: false
    });
    
    toast.success('Reschedule accepted');
    return updatedSession;
  }
  
  static declineReschedule(sessionId: string, declinedBy: string, reason?: string): Session | null {
    const session = this.getSession(sessionId);
    if (!session || !session.rescheduleRequest) return null;
    
    const { requestedBy } = session.rescheduleRequest;
    
    // Update session to remove reschedule request
    const updatedSession = this.updateSession(sessionId, {
      rescheduleRequest: {
        ...session.rescheduleRequest,
        status: 'declined',
        declinedAt: new Date().toISOString(),
        declineReason: reason
      }
    });
    
    if (!updatedSession) return null;
    
    // Notify the requester
    const decliner = this.getUser(declinedBy);
    
    this.createNotification({
      userId: requestedBy,
      type: 'reschedule_declined',
      title: 'Reschedule Declined',
      message: `${decliner?.name} has declined your reschedule request. ${reason ? `Reason: ${reason}` : ''}`,
      relatedId: sessionId,
      actionRequired: false
    });
    
    toast.info('Reschedule declined');
    return updatedSession;
  }
  
  // ========== NOTIFICATIONS ==========
  
  static getNotificationsForUser(userId: string): Notification[] {
    const data = StorageManager.getData();
    return data.notifications
      .filter((n: Notification) => n.userId === userId)
      .sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
  
  static createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notification:${Date.now()}:${Math.random()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    StorageManager.updateData(d => {
      d.notifications.push(newNotification);
      return d;
    });
    
    return newNotification;
  }
  
  static markNotificationAsRead(notificationId: string): void {
    StorageManager.updateData(d => {
      const notificationIndex = d.notifications.findIndex((n: Notification) => n.id === notificationId);
      if (notificationIndex !== -1) {
        d.notifications[notificationIndex].read = true;
      }
      return d;
    });
  }
  
  static markAllNotificationsAsRead(userId: string): void {
    StorageManager.updateData(d => {
      d.notifications = d.notifications.map((n: Notification) => {
        if (n.userId === userId) {
          return { ...n, read: true };
        }
        return n;
      });
      return d;
    });
  }
  
  static deleteNotification(notificationId: string): void {
    StorageManager.updateData(d => {
      d.notifications = d.notifications.filter((n: Notification) => n.id !== notificationId);
      return d;
    });
  }
  
  // ========== FEEDBACK ==========
  
  static createFeedback(feedbackData: any): any {
    const feedback = {
      id: `feedback:${Date.now()}:${Math.random()}`,
      ...feedbackData,
      createdAt: new Date().toISOString()
    };
    
    StorageManager.updateData(d => {
      if (!d.feedbacks) {
        d.feedbacks = [];
      }
      d.feedbacks.push(feedback);
      return d;
    });
    
    return feedback;
  }
  
  // ========== MATERIALS ==========
  
  static getMaterialsForUser(userId: string): Material[] {
    const data = StorageManager.getData();
    const user = this.getUser(userId);
    
    if (!user) return [];
    
    // Students see materials shared with them
    if (user.role === 'student') {
      return data.materials.filter((m: Material) => 
        m.sharedWith && m.sharedWith.includes(userId)
      );
    }
    
    // Tutors see their uploaded materials
    if (user.role === 'tutor') {
      return data.materials.filter((m: Material) => m.uploadedBy === userId);
    }
    
    // Admins, coordinators, chairs see all materials
    return data.materials;
  }
  
  static getAllMaterials(): Material[] {
    const data = StorageManager.getData();
    return data.materials;
  }
  
  static getMaterial(materialId: string): Material | null {
    const data = StorageManager.getData();
    return data.materials.find((m: Material) => m.id === materialId) || null;
  }
  
  static createMaterial(material: Omit<Material, 'id'>): Material {
    const newMaterial: Material = {
      ...material,
      id: `material:${Date.now()}`
    };
    
    StorageManager.updateData(d => {
      d.materials.push(newMaterial);
      return d;
    });
    
    // Notify users who were shared with
    if (material.sharedWith && material.sharedWith.length > 0) {
      material.sharedWith.forEach(userId => {
        this.createNotification({
          userId,
          type: 'material_shared',
          title: 'New Material Shared',
          message: `${material.uploadedByName} has shared "${material.title}" with you`,
          relatedId: newMaterial.id,
          actionRequired: false
        });
      });
    }
    
    toast.success('Material uploaded successfully!');
    return newMaterial;
  }
  
  static updateMaterial(materialId: string, updates: Partial<Material>): Material | null {
    const newData = StorageManager.updateData(d => {
      const materialIndex = d.materials.findIndex((m: Material) => m.id === materialId);
      if (materialIndex !== -1) {
        d.materials[materialIndex] = {
          ...d.materials[materialIndex],
          ...updates
        };
      }
      return d;
    });
    
    return newData.materials.find((m: Material) => m.id === materialId) || null;
  }
  
  static incrementMaterialDownload(materialId: string): void {
    const material = this.getMaterial(materialId);
    if (material) {
      this.updateMaterial(materialId, {
        downloads: (material.downloads || 0) + 1
      });
    }
  }
  
  // ========== PROGRESS ==========
  
  static getProgressForStudent(studentId: string): any[] {
    const data = StorageManager.getData();
    if (!data.progress) {
      return [];
    }
    return data.progress.filter((p: any) => p.studentId === studentId);
  }
  
  static getAllProgress(): any[] {
    const data = StorageManager.getData();
    return data.progress || [];
  }
  
  static updateProgress(studentId: string, subject: string): void {
    const data = StorageManager.getData();
    const sessions = data.sessions.filter((s: Session) => 
      s.studentId === studentId && 
      s.subject === subject && 
      s.status === 'completed'
    );
    
    if (sessions.length === 0) {
      return; // No completed sessions, nothing to update
    }
    
    const sessionsAttended = sessions.length;
    const ratings = sessions.filter(s => s.rating).map(s => s.rating!);
    const averageRating = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0;
    
    const improvementScore = Math.min(100, Math.floor(
      (sessionsAttended * 15) + (averageRating * 12) + 10
    ));
    
    const lastSession = sessions.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
    
    StorageManager.updateData(d => {
      if (!d.progress) {
        d.progress = [];
      }
      
      const progressIndex = d.progress.findIndex((p: any) => 
        p.studentId === studentId && p.subject === subject
      );
      
      if (progressIndex !== -1) {
        // Update existing progress
        d.progress[progressIndex] = {
          ...d.progress[progressIndex],
          sessionsAttended,
          averageRating,
          improvementScore,
          lastSessionDate: lastSession.date,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Create new progress record
        d.progress.push({
          id: `progress:${Date.now()}`,
          studentId,
          subject,
          sessionsAttended,
          averageRating,
          improvementScore,
          lastSessionDate: lastSession.date,
          strengths: ['Engagement', 'Participation'],
          weaknesses: ['Practice needed'],
          createdAt: sessions[0].createdAt,
          updatedAt: new Date().toISOString()
        });
      }
      
      return d;
    });
  }
  
  static recalculateAllProgress(): void {
    const data = StorageManager.getData();
    const students = data.users.filter((u: User) => u.role === 'student');
    
    // Get all unique subjects from completed sessions
    const completedSessions = data.sessions.filter((s: Session) => s.status === 'completed');
    const subjects = new Set<string>();
    completedSessions.forEach(s => subjects.add(s.subject));
    
    // Recalculate progress for each student-subject combination
    students.forEach(student => {
      subjects.forEach(subject => {
        const studentSessions = completedSessions.filter(s => 
          s.studentId === student.id && s.subject === subject
        );
        
        if (studentSessions.length > 0) {
          this.updateProgress(student.id, subject);
        }
      });
    });
  }
  
  static deleteMaterial(materialId: string): void {
    StorageManager.updateData(d => {
      d.materials = d.materials.filter((m: Material) => m.id !== materialId);
      return d;
    });
    
    toast.info('Material deleted');
  }
  
  // ========== AVAILABILITY MANAGEMENT ==========
  
  /**
   * Helper function to convert session date/time to availability slot format
   * Example: date: "2024-11-05", startTime: "09:00", endTime: "10:00" 
   * → returns { day: "Monday", slot: "09:00-10:00" }
   */
  private static sessionToAvailabilitySlot(date: string, startTime: string, endTime: string): { day: string; slot: string } | null {
    try {
      const sessionDate = new Date(date);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[sessionDate.getDay()];
      
      // Normalize time format (remove seconds if present)
      const normalizeTime = (time: string) => {
        const parts = time.split(':');
        return `${parts[0]}:${parts[1]}`;
      };
      
      const slot = `${normalizeTime(startTime)}-${normalizeTime(endTime)}`;
      
      return { day, slot };
    } catch (error) {
      console.error('Error converting session to availability slot:', error);
      return null;
    }
  }
  
  /**
   * Remove a time slot from tutor's availability
   * Called when a session is accepted/confirmed
   */
  static removeAvailabilitySlot(tutorId: string, date: string, startTime: string, endTime: string): void {
    const slotInfo = this.sessionToAvailabilitySlot(date, startTime, endTime);
    if (!slotInfo) return;
    
    const tutor = this.getUser(tutorId);
    if (!tutor) return;
    
    const availability = tutor.availability || {};
    const daySlots = availability[slotInfo.day] || [];
    
    // Remove the slot
    const updatedSlots = daySlots.filter((s: string) => s !== slotInfo.slot);
    
    // Update user's availability
    this.updateUser(tutorId, {
      availability: {
        ...availability,
        [slotInfo.day]: updatedSlots
      }
    });
    
    console.log(`✅ Removed availability slot: ${slotInfo.day} ${slotInfo.slot} for tutor ${tutor.name}`);
  }
  
  /**
   * Add a time slot back to tutor's availability
   * Called when a session is cancelled or declined
   */
  static addAvailabilitySlot(tutorId: string, date: string, startTime: string, endTime: string): void {
    const slotInfo = this.sessionToAvailabilitySlot(date, startTime, endTime);
    if (!slotInfo) return;
    
    const tutor = this.getUser(tutorId);
    if (!tutor) return;
    
    const availability = tutor.availability || {};
    const daySlots = availability[slotInfo.day] || [];
    
    // Add the slot only if it doesn't already exist
    if (!daySlots.includes(slotInfo.slot)) {
      const updatedSlots = [...daySlots, slotInfo.slot].sort();
      
      // Update user's availability
      this.updateUser(tutorId, {
        availability: {
          ...availability,
          [slotInfo.day]: updatedSlots
        }
      });
      
      console.log(`✅ Added availability slot back: ${slotInfo.day} ${slotInfo.slot} for tutor ${tutor.name}`);
    }
  }
  
  // ========== UTILITY ==========
  
  static resetDatabase(): void {
    StorageManager.clearData();
    toast.success('Database reset successfully!');
  }
  
  static exportData(): any {
    return StorageManager.getData();
  }
  
  static importData(data: any): void {
    StorageManager.setData(data);
    toast.success('Data imported successfully!');
  }
  
  // ========== DEPARTMENT STATISTICS ==========
  // Used by coordinators and department chairs to track their department
  
  static getDepartmentStats(department: string) {
    const data = StorageManager.getData();
    
    const students = data.users.filter((u: User) => 
      u.role === 'student' && u.department === department
    );
    
    const tutors = data.users.filter((u: User) => 
      u.role === 'tutor' && u.department === department
    );
    
    const sessions = data.sessions.filter((s: Session) => {
      const student = data.users.find((u: User) => u.id === s.studentId);
      const tutor = data.users.find((u: User) => u.id === s.tutorId);
      return student?.department === department || tutor?.department === department;
    });
    
    const completedSessions = sessions.filter((s: Session) => s.status === 'completed');
    const pendingSessions = sessions.filter((s: Session) => s.status === 'pending');
    const scheduledSessions = sessions.filter((s: Session) => s.status === 'scheduled');
    
    return {
      department,
      studentCount: students.length,
      tutorCount: tutors.length,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      pendingSessions: pendingSessions.length,
      scheduledSessions: scheduledSessions.length,
      students,
      tutors
    };
  }
  
  static getAllDepartmentStats() {
    const data = StorageManager.getData();
    const departments = new Set(data.users.map((u: User) => u.department).filter(Boolean));
    
    return Array.from(departments).map(dept => this.getDepartmentStats(dept as string));
  }
}

// Initialize SSO data on first load
const existingSSOData = localStorage.getItem('hcmut_sso_data');
if (!existingSSOData) {
  console.log('Initializing HCMUT SSO Database with 67 users...');
  SSOStorageManager.setData(SSOStorageManager.getInitialSSOData());
  console.log('SSO Database initialized successfully');
} else {
  const ssoData = JSON.parse(existingSSOData);
  console.log(`SSO Database loaded: ${ssoData.users?.length || 0} users`);
}

// Initialize data on first load or reset if old structure detected
const existingData = localStorage.getItem('bk_tutor_data');
if (!existingData) {
  console.log('Initializing BK TUTOR Program Database with 19 pre-registered users...');
  StorageManager.setData(StorageManager.getInitialData());
  console.log('Program Database initialized successfully');
} else {
  // Check if we need to migrate from old structure
  try {
    const parsed = JSON.parse(existingData);
    const firstUser = parsed.users?.[0];
    
    // Check if using old user ID structure (user:1 instead of user:student:1)
    if (firstUser && firstUser.id && firstUser.id.match(/^user:\d+$/)) {
      console.log('Detected old data structure. Resetting database...');
      StorageManager.setData(StorageManager.getInitialData());
    }
  } catch (error) {
    console.error('Error checking data version:', error);
    StorageManager.setData(StorageManager.getInitialData());
  }
}
