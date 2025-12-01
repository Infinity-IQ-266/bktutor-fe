// Mock Backend for BK TUTOR System
// This simulates a real backend with 50+ rows per table and calculated fields

// ============= DATA GENERATORS =============

function generateUsers() {
  const departments = [
    "Computer Science & Engineering",
    "Electrical Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Materials Engineering"
  ];

  const firstNames = [
    "Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ngo",
    "Duong", "Ly", "Truong", "Vo", "Trinh", "Dinh", "Ha", "Cao", "Lam", "Phan"
  ];

  const middleNames = ["Van", "Thi", "Minh", "Hong", "Quang", "Duc", "Mai", "Thu", "Anh", "Khanh"];
  
  const lastNames = [
    "An", "Binh", "Cuong", "Dung", "Em", "Giang", "Hai", "Khanh", "Linh", "Mai",
    "Nam", "Oanh", "Phong", "Quan", "Son", "Tuan", "Uyen", "Vy", "Xuan", "Yen",
    "Anh", "Bao", "Chi", "Dao", "Hoa", "Huong", "Kim", "Lan", "My", "Nga",
    "Nhi", "Phuong", "Quynh", "Sang", "Tam", "Thao", "Truc", "Uyen", "Vinh", "Yen"
  ];

  const users: any[] = [];
  let userIdCounter = 1;

  // Generate 60 Students
  for (let i = 0; i < 60; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${middleName} ${lastName}`;
    const email = `student${i + 1}@hcmut.edu.vn`;
    const studentId = `20${10 + Math.floor(i / 15)}${String(1001 + i).padStart(4, '0')}`;
    const department = departments[Math.floor(Math.random() * departments.length)];
    const year = Math.floor(Math.random() * 4) + 1;
    const gpa = (2.5 + Math.random() * 1.5).toFixed(2);
    const joinedYear = 2024 - (year - 1);

    users.push({
      id: `user:${userIdCounter++}`,
      email,
      password: "123456789",
      name,
      role: "student",
      studentId,
      department,
      year,
      gpa: parseFloat(gpa),
      joinedDate: `${joinedYear}-09-01`,
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: `District ${Math.floor(Math.random() * 12) + 1}, Ho Chi Minh City`
    });
  }

  // Generate 25 Tutors
  const tutorExpertise: Record<string, string[][]> = {
    "Computer Science & Engineering": [
      ["Data Structures", "Algorithms", "Programming"],
      ["Database Systems", "Web Development", "Software Engineering"],
      ["Operating Systems", "Computer Networks", "Distributed Systems"],
      ["Artificial Intelligence", "Machine Learning", "Deep Learning"],
      ["Computer Vision", "Natural Language Processing", "Robotics"]
    ],
    "Electrical Engineering": [
      ["Circuit Analysis", "Digital Systems", "Control Systems"],
      ["Power Systems", "Electronics", "Signal Processing"],
      ["Electromagnetics", "Communication Systems", "Microprocessors"]
    ],
    "Mechanical Engineering": [
      ["Thermodynamics", "Fluid Mechanics", "Heat Transfer"],
      ["Solid Mechanics", "Dynamics", "Machine Design"],
      ["Manufacturing", "CAD/CAM", "Robotics"]
    ],
    "Civil Engineering": [
      ["Structural Analysis", "Geotechnical Engineering", "Construction Management"],
      ["Transportation Engineering", "Hydraulics", "Building Materials"]
    ],
    "Chemical Engineering": [
      ["Process Engineering", "Chemical Thermodynamics", "Reactor Design"],
      ["Separation Processes", "Process Control", "Chemical Analysis"]
    ]
  };

  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const prefix = Math.random() > 0.5 ? "Dr." : "Ms.";
    const name = `${prefix} ${firstName} ${middleName} ${lastName}`;
    const email = `tutor${i + 1}@hcmut.edu.vn`;
    const tutorId = `T${String(1001 + i).padStart(4, '0')}`;
    const department = departments[Math.floor(Math.random() * 5)];
    const expertiseList = tutorExpertise[department] || tutorExpertise["Computer Science & Engineering"];
    const expertise = expertiseList[Math.floor(Math.random() * expertiseList.length)];
    const yearsOfExperience = Math.floor(Math.random() * 15) + 3;

    users.push({
      id: `user:${userIdCounter++}`,
      email,
      password: "123456789",
      name,
      role: "tutor",
      tutorId,
      department,
      expertise,
      yearsOfExperience,
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      officeHours: "Mon-Fri 9:00-17:00",
      officeLocation: `Room ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 5) + 1}0${Math.floor(Math.random() * 9) + 1}`
    });
  }

  // Generate 8 Coordinators
  for (let i = 0; i < 8; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${middleName} ${lastName}`;
    const email = `coordinator${i + 1}@hcmut.edu.vn`;
    const coordinatorId = `C${String(1001 + i).padStart(4, '0')}`;
    const department = departments[i];

    users.push({
      id: `user:${userIdCounter++}`,
      email,
      password: "123456789",
      name,
      role: "coordinator",
      coordinatorId,
      department,
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
    });
  }

  // Generate 5 Department Chairs
  for (let i = 0; i < 5; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `Prof. ${firstName} ${lastName}`;
    const email = `chair${i + 1}@hcmut.edu.vn`;
    const chairId = `CH${String(1001 + i).padStart(4, '0')}`;
    const department = departments[i];

    users.push({
      id: `user:${userIdCounter++}`,
      email,
      password: "123456789",
      name,
      role: "chair",
      chairId,
      department,
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
    });
  }

  // Generate 2 Administrators
  for (let i = 0; i < 2; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `admin${i + 1}@hcmut.edu.vn`;
    const adminId = `A${String(1001 + i).padStart(4, '0')}`;

    users.push({
      id: `user:${userIdCounter++}`,
      email,
      password: "123456789",
      name,
      role: "administrator",
      adminId,
      permissions: ["all"],
      phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
    });
  }

  return users;
}

function generateSessions(users: any[]) {
  const students = users.filter(u => u.role === "student");
  const tutors = users.filter(u => u.role === "tutor");
  const sessions: any[] = [];
  let sessionIdCounter = 1;

  const locations = ["Room A101", "Room A205", "Room B206", "Lab C301", "Lab C302", "Room D102", "Room D103", "Library Study Room 1", "Library Study Room 2", "Online - Zoom"];
  
  const subjects = [
    "Data Structures", "Algorithms", "Database Systems", "Web Development", "Operating Systems",
    "Computer Networks", "Machine Learning", "Artificial Intelligence", "Circuit Analysis",
    "Digital Systems", "Control Systems", "Thermodynamics", "Fluid Mechanics", "Heat Transfer",
    "Structural Analysis", "Process Engineering", "Chemical Thermodynamics"
  ];

  const topics: Record<string, string[]> = {
    "Data Structures": ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables", "Heaps"],
    "Algorithms": ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms", "Graph Algorithms"],
    "Database Systems": ["SQL Queries", "Normalization", "Indexing", "Transactions", "NoSQL"],
    "Web Development": ["HTML/CSS", "JavaScript", "React", "Node.js", "APIs"],
    "Operating Systems": ["Process Scheduling", "Memory Management", "File Systems", "Concurrency"],
    "Machine Learning": ["Linear Regression", "Classification", "Neural Networks", "Deep Learning"],
  };

  // Generate 150 sessions
  for (let i = 0; i < 150; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const tutor = tutors[Math.floor(Math.random() * tutors.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const topicList = topics[subject] || ["General"];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    
    let status;
    let date;
    const daysOffset = Math.floor(Math.random() * 90) - 45;
    const baseDate = new Date("2024-11-04");
    date = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    if (daysOffset < -5) {
      status = Math.random() > 0.1 ? "completed" : "cancelled";
    } else if (daysOffset < 0) {
      status = Math.random() > 0.2 ? "completed" : "cancelled";
    } else if (daysOffset <= 7) {
      status = "scheduled";
    } else {
      status = "pending";
    }

    const duration = [60, 75, 90, 120][Math.floor(Math.random() * 4)];
    const hour = Math.floor(Math.random() * 9) + 9;
    const time = `${String(hour).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const session: any = {
      id: `session:${sessionIdCounter++}`,
      studentId: student.id,
      tutorId: tutor.id,
      studentName: student.name,
      tutorName: tutor.name,
      subject,
      topic,
      status,
      date: date.toISOString().split('T')[0],
      time,
      duration,
      location: status === "pending" ? "TBD" : location,
      createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (status === "completed") {
      const rating = Math.floor(Math.random() * 2) + 4;
      session.rating = rating;
      session.feedback = [
        "Very helpful session!",
        "Great explanation, clear and concise.",
        "Excellent tutor, learned a lot.",
        "Good session but could use more examples.",
        "Perfect! Now I understand the topic.",
        "Clear and patient teaching style.",
        "Very knowledgeable and helpful.",
      ][Math.floor(Math.random() * 7)];
      session.notes = `Covered ${topic}. Student showed good understanding.`;
    } else if (status === "cancelled") {
      session.notes = ["Student had conflict", "Tutor unavailable", "Rescheduled"][Math.floor(Math.random() * 3)];
    }

    sessions.push(session);
  }

  return sessions;
}

function generateMaterials(users: any[]) {
  const tutors = users.filter(u => u.role === "tutor");
  const materials: any[] = [];
  let materialIdCounter = 1;

  const subjects = [
    "Data Structures", "Algorithms", "Database Systems", "Web Development", "Operating Systems",
    "Computer Networks", "Machine Learning", "Artificial Intelligence", "Circuit Analysis",
    "Digital Systems", "Control Systems", "Thermodynamics", "Fluid Mechanics", "Heat Transfer",
    "Structural Analysis", "Process Engineering", "Chemical Thermodynamics", "Mathematics",
    "Physics", "Chemistry", "English", "Programming Fundamentals"
  ];

  const types = ["pdf", "video", "slides", "code", "worksheet"];
  const titles = [
    "Introduction to {subject}",
    "{subject} - Lecture Notes",
    "{subject} Practice Problems",
    "{subject} Tutorial",
    "Advanced {subject} Techniques",
    "{subject} Quick Reference Guide",
    "{subject} Lab Manual",
    "{subject} Case Studies",
    "{subject} Exam Preparation",
    "{subject} Cheat Sheet"
  ];

  for (let i = 0; i < 80; i++) {
    const tutor = tutors[Math.floor(Math.random() * tutors.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const titleTemplate = titles[Math.floor(Math.random() * titles.length)];
    const title = titleTemplate.replace("{subject}", subject);
    
    const sizeKB = type === "video" ? Math.floor(Math.random() * 200000) + 50000 : Math.floor(Math.random() * 5000) + 100;
    const sizeMB = (sizeKB / 1024).toFixed(1);
    const size = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    
    const daysAgo = Math.floor(Math.random() * 180);
    const uploadDate = new Date(new Date("2024-11-04").getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const downloads = Math.floor(Math.random() * 250);

    materials.push({
      id: `material:${materialIdCounter++}`,
      title,
      subject,
      type,
      uploadedBy: tutor.id,
      uploaderName: tutor.name,
      uploadDate: uploadDate.toISOString().split('T')[0],
      size,
      downloads,
      description: `Comprehensive material for ${subject}`,
      fileUrl: `/materials/${materialIdCounter}.${type === 'code' ? 'zip' : type}`,
    });
  }

  return materials;
}

function generateProgress(users: any[], sessions: any[]) {
  const students = users.filter(u => u.role === "student");
  const progressRecords: any[] = [];
  let progressIdCounter = 1;

  const subjects = [
    "Data Structures", "Algorithms", "Database Systems", "Web Development", "Operating Systems",
    "Computer Networks", "Machine Learning", "Circuit Analysis", "Digital Systems",
    "Thermodynamics", "Fluid Mechanics", "Structural Analysis"
  ];

  const strengths = [
    ["Problem Solving", "Critical Thinking"],
    ["Mathematical Reasoning", "Logical Analysis"],
    ["Programming", "Debugging"],
    ["Conceptual Understanding", "Application"],
    ["Theory", "Practice"]
  ];

  const weaknesses = [
    ["Time Complexity Analysis", "Space Complexity"],
    ["Advanced Concepts", "Complex Problems"],
    ["Optimization", "Edge Cases"],
    ["Mathematical Proofs", "Derivations"],
    ["Implementation", "Testing"]
  ];

  for (let i = 0; i < 60; i++) {
    const student = students[i % students.length];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const studentSessions = sessions.filter((s: any) => 
      s.studentId === student.id && 
      s.subject === subject && 
      s.status === "completed"
    );

    if (studentSessions.length > 0) {
      const sessionsAttended = studentSessions.length;
      const ratings = studentSessions.filter((s: any) => s.rating).map((s: any) => s.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      
      const improvementScore = Math.min(100, Math.floor(
        (sessionsAttended * 5) + (averageRating * 10) + (Math.random() * 20)
      ));
      
      const lastSession = studentSessions.reduce((latest: any, current: any) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      );

      progressRecords.push({
        id: `progress:${progressIdCounter++}`,
        studentId: student.id,
        subject,
        sessionsAttended,
        averageRating: parseFloat(averageRating.toFixed(1)),
        improvementScore,
        lastSessionDate: lastSession.date,
        strengths: strengths[Math.floor(Math.random() * strengths.length)],
        weaknesses: weaknesses[Math.floor(Math.random() * weaknesses.length)],
      });
    }
  }

  return progressRecords;
}

function generateAnnouncements(users: any[]) {
  const coordinators = users.filter(u => u.role === "coordinator");
  const admins = users.filter(u => u.role === "administrator");
  const posters = [...coordinators, ...admins];
  
  const announcements: any[] = [];
  let announcementIdCounter = 1;

  const data = [
    { title: "New Tutoring Hours Available", content: "We are pleased to announce extended tutoring hours for the upcoming exam period.", priority: "high", targetAudience: "all" },
    { title: "Midterm Exam Support Sessions", content: "Special support sessions will be available for midterm exam preparation.", priority: "high", targetAudience: "students" },
    { title: "Final Exam Preparation Program", content: "New study materials have been added to the library. Check them out!", priority: "medium", targetAudience: "students" },
    { title: "New Learning Materials Added", content: "Congratulations to our top-rated tutors this semester!", priority: "medium", targetAudience: "all" },
    { title: "Tutor Recognition Awards", content: "The system will undergo maintenance this weekend. Please plan accordingly.", priority: "low", targetAudience: "tutors" },
  ];

  for (let i = 0; i < 50; i++) {
    const poster = posters[Math.floor(Math.random() * posters.length)];
    const daysAgo = Math.floor(Math.random() * 120);
    const postedDate = new Date(new Date("2024-11-04").getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const item = data[i % data.length];
    
    announcements.push({
      id: `announcement:${announcementIdCounter++}`,
      ...item,
      postedBy: poster.id,
      posterName: poster.name,
      postedDate: postedDate.toISOString().split('T')[0],
    });
  }

  return announcements;
}

// ============= IN-MEMORY DATABASE =============

class MockDatabase {
  private users: any[] = [];
  private sessions: any[] = [];
  private materials: any[] = [];
  private progress: any[] = [];
  private announcements: any[] = [];
  private notifications: any[] = [];
  private initialized: boolean = false;

  constructor() {
    // Don't initialize immediately
  }

  private initialize() {
    if (this.initialized) return;
    
    console.log("Initializing mock database...");
    this.users = generateUsers();
    this.sessions = generateSessions(this.users);
    this.materials = generateMaterials(this.users);
    this.progress = generateProgress(this.users, this.sessions);
    this.announcements = generateAnnouncements(this.users);
    this.initialized = true;
    
    console.log(`Mock DB initialized: ${this.users.length} users, ${this.sessions.length} sessions, ${this.materials.length} materials`);
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initialize();
    }
  }

  // Auth
  async login(email: string, password: string) {
    this.ensureInitialized();
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const stats = this.calculateUserStats(user.id, user.role);
    
    return {
      success: true,
      user: { ...userWithoutPassword, ...stats },
      token: `token_${user.id}_${Date.now()}`
    };
  }

  // Users
  async getUsers(filters: any = {}) {
    this.ensureInitialized();
    let filtered = [...this.users];
    
    if (filters.role) filtered = filtered.filter(u => u.role === filters.role);
    if (filters.department) filtered = filtered.filter(u => u.department === filters.department);
    
    return filtered.map(u => {
      const { password, ...userWithoutPassword } = u;
      const stats = this.calculateUserStats(u.id, u.role);
      return { ...userWithoutPassword, ...stats };
    });
  }

  async getUser(id: string) {
    this.ensureInitialized();
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error("User not found");
    
    const { password, ...userWithoutPassword } = user;
    const stats = this.calculateUserStats(user.id, user.role);
    return { ...userWithoutPassword, ...stats };
  }

  // Sessions
  async getSessions(filters: any = {}) {
    this.ensureInitialized();
    let filtered = [...this.sessions];
    
    if (filters.studentId) filtered = filtered.filter(s => s.studentId === filters.studentId);
    if (filters.tutorId) filtered = filtered.filter(s => s.tutorId === filters.tutorId);
    if (filters.status) filtered = filtered.filter(s => s.status === filters.status);
    
    return filtered;
  }

  async createSession(data: any) {
    this.ensureInitialized();
    const newSession = {
      id: `session:${Date.now()}`,
      ...data,
      status: data.status || "pending",
      createdAt: new Date().toISOString(),
    };
    
    // Add student and tutor names
    const student = this.users.find(u => u.id === data.studentId);
    const tutor = this.users.find(u => u.id === data.tutorId);
    newSession.studentName = student?.name;
    newSession.tutorName = tutor?.name;
    
    this.sessions.push(newSession);
    return newSession;
  }

  async updateSession(id: string, updates: any) {
    this.ensureInitialized();
    const index = this.sessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Session not found");
    
    this.sessions[index] = { ...this.sessions[index], ...updates, updatedAt: new Date().toISOString() };
    return this.sessions[index];
  }

  async deleteSession(id: string) {
    this.ensureInitialized();
    this.sessions = this.sessions.filter(s => s.id !== id);
    return { success: true };
  }

  // Materials
  async getMaterials(filters: any = {}) {
    this.ensureInitialized();
    let filtered = [...this.materials];
    
    if (filters.subject) filtered = filtered.filter(m => m.subject === filters.subject);
    if (filters.type) filtered = filtered.filter(m => m.type === filters.type);
    
    return filtered;
  }

  async createMaterial(data: any) {
    this.ensureInitialized();
    const newMaterial = {
      id: `material:${Date.now()}`,
      ...data,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
    };
    
    const uploader = this.users.find(u => u.id === data.uploadedBy);
    newMaterial.uploaderName = uploader?.name;
    
    this.materials.push(newMaterial);
    return newMaterial;
  }

  // Progress
  async getProgress(studentId: string) {
    this.ensureInitialized();
    return this.progress.filter(p => p.studentId === studentId);
  }

  // Announcements
  async getAnnouncements(filters: any = {}) {
    this.ensureInitialized();
    let filtered = [...this.announcements];
    
    if (filters.targetAudience && filters.targetAudience !== "all") {
      filtered = filtered.filter(a => a.targetAudience === filters.targetAudience || a.targetAudience === "all");
    }
    
    return filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  }

  async createAnnouncement(data: any) {
    this.ensureInitialized();
    const newAnnouncement = {
      id: `announcement:${Date.now()}`,
      ...data,
      postedDate: new Date().toISOString().split('T')[0],
    };
    
    const poster = this.users.find(u => u.id === data.postedBy);
    newAnnouncement.posterName = poster?.name;
    
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  // Stats
  async getStats(role: string, userId?: string) {
    this.ensureInitialized();
    if (role === "student" && userId) {
      return this.calculateStudentStats(userId);
    } else if (role === "tutor" && userId) {
      return this.calculateTutorStats(userId);
    } else {
      const students = this.users.filter(u => u.role === "student");
      const tutors = this.users.filter(u => u.role === "tutor");
      const completed = this.sessions.filter(s => s.status === "completed");
      const scheduled = this.sessions.filter(s => s.status === "scheduled");
      
      return {
        totalStudents: students.length,
        totalTutors: tutors.length,
        totalSessions: completed.length,
        scheduledSessions: scheduled.length,
        totalMaterials: this.materials.length,
        activeMatches: new Set(scheduled.map(s => `${s.studentId}-${s.tutorId}`)).size,
        completionRate: this.sessions.length > 0 
          ? parseFloat(((completed.length / this.sessions.length) * 100).toFixed(1))
          : 0,
      };
    }
  }

  private calculateUserStats(userId: string, role: string) {
    this.ensureInitialized();
    if (role === "tutor") {
      return this.calculateTutorStats(userId);
    } else if (role === "student") {
      return this.calculateStudentStats(userId);
    }
    return {};
  }

  private calculateTutorStats(tutorId: string) {
    const tutorSessions = this.sessions.filter(s => s.tutorId === tutorId);
    const completed = tutorSessions.filter(s => s.status === "completed");
    
    const ratings = completed.filter(s => s.rating).map(s => s.rating);
    const averageRating = ratings.length > 0 
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0;
    
    const totalHours = completed.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const uniqueStudents = new Set(tutorSessions.map(s => s.studentId)).size;
    
    return {
      averageRating,
      totalSessions: completed.length,
      totalHours: parseFloat(totalHours.toFixed(1)),
      activeStudents: uniqueStudents,
    };
  }

  private calculateStudentStats(studentId: string) {
    const studentSessions = this.sessions.filter(s => s.studentId === studentId);
    const completed = studentSessions.filter(s => s.status === "completed");
    const upcoming = studentSessions.filter(s => s.status === "scheduled");
    
    const ratings = completed.filter(s => s.rating).map(s => s.rating);
    const averageRating = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : 0;
    
    const totalHours = completed.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    
    return {
      totalSessions: completed.length,
      upcomingSessions: upcoming.length,
      totalHours: parseFloat(totalHours.toFixed(1)),
      averageRating,
    };
  }
}

// Export singleton instance
export const mockDB = new MockDatabase();
