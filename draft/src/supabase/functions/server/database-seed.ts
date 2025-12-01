// Database seed data generator for BK TUTOR system
// Creates TWO SEPARATE DATABASES:
// 1. SSO Database: ALL HCMUT users (for authentication only)
// 2. BK TUTOR User Database: Only users registered for the program

// ============= SSO DATABASE =============
// Contains ALL HCMUT users for authentication

export const generateSSOUsers = () => {
  const ssoUsers = [];

  // 26 Students in SSO (student1-26@hcmut.edu.vn)
  for (let i = 1; i <= 26; i++) {
    ssoUsers.push({
      id: `sso:student:${i}`,
      email: `student${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Student ${i}`,
      role: "student",
    });
  }

  // 26 Tutors in SSO (tutor1-26@hcmut.edu.vn)
  for (let i = 1; i <= 26; i++) {
    ssoUsers.push({
      id: `sso:tutor:${i}`,
      email: `tutor${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Tutor ${i}`,
      role: "tutor",
    });
  }

  // 5 Department Chairs in SSO (chair1-5@hcmut.edu.vn)
  for (let i = 1; i <= 5; i++) {
    ssoUsers.push({
      id: `sso:chair:${i}`,
      email: `chair${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Department Chair ${i}`,
      role: "chair",
    });
  }

  // 5 Coordinators in SSO (coord1-5@hcmut.edu.vn)
  for (let i = 1; i <= 5; i++) {
    ssoUsers.push({
      id: `sso:coordinator:${i}`,
      email: `coord${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Coordinator ${i}`,
      role: "coordinator",
    });
  }

  // 5 Admins in SSO (admin1-5@hcmut.edu.vn)
  for (let i = 1; i <= 5; i++) {
    ssoUsers.push({
      id: `sso:admin:${i}`,
      email: `admin${i}@hcmut.edu.vn`,
      password: "admin123",
      name: `Administrator ${i}`,
      role: "administrator",
    });
  }

  console.log(`Generated ${ssoUsers.length} SSO users (26 students + 26 tutors + 5 chairs + 5 coordinators + 5 admins = 67 total)`);
  return ssoUsers;
};

// ============= BK TUTOR USER DATABASE =============
// Contains ONLY users registered for the program

export const generateProgramUsers = () => {
  const departments = [
    "Computer Science & Engineering",
    "Electrical Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering"
  ];

  const programUsers = [];
  let userIdCounter = 1;

  // ===== 10 PRE-REG STUDENTS (student1-10) =====
  for (let i = 1; i <= 10; i++) {
    const department = departments[(i - 1) % departments.length];
    const year = ((i - 1) % 4) + 1;
    const gpa = (2.5 + Math.random() * 1.5).toFixed(2);
    const joinedYear = 2024 - (year - 1);

    programUsers.push({
      id: `user:${userIdCounter++}`,
      email: `student${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Nguyen Van ${String.fromCharCode(64 + i)}`, // Nguyen Van A, B, C, etc.
      role: "student",
      studentId: `2021${String(1000 + i).slice(-3)}`,
      department,
      year,
      gpa: parseFloat(gpa),
      joinedDate: `${joinedYear}-09-01`,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      address: `District ${((i - 1) % 12) + 1}, Ho Chi Minh City`
    });
  }

  // ===== 10 PRE-REG TUTORS (tutor1-10) =====
  const tutorExpertise = [
    ["Data Structures", "Algorithms", "Programming"],
    ["Database Systems", "Web Development", "Software Engineering"],
    ["Operating Systems", "Computer Networks", "Distributed Systems"],
    ["Circuit Analysis", "Digital Systems", "Control Systems"],
    ["Thermodynamics", "Fluid Mechanics", "Heat Transfer"],
    ["Structural Analysis", "Geotechnical Engineering", "Construction Management"],
    ["Process Engineering", "Chemical Thermodynamics", "Reactor Design"],
    ["Machine Learning", "Artificial Intelligence", "Deep Learning"],
    ["Power Systems", "Electronics", "Signal Processing"],
    ["Solid Mechanics", "Dynamics", "Machine Design"]
  ];

  for (let i = 1; i <= 10; i++) {
    const department = departments[(i - 1) % departments.length];
    const expertise = tutorExpertise[(i - 1) % tutorExpertise.length];
    const yearsOfExperience = Math.floor(Math.random() * 10) + 3;

    programUsers.push({
      id: `user:${userIdCounter++}`,
      email: `tutor${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Nguyen Minh ${String.fromCharCode(64 + i)}`, // Nguyen Minh A, B, C, etc.
      role: "tutor",
      tutorId: `T${String(1000 + i).slice(-3)}`,
      department,
      expertise,
      yearsOfExperience,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      officeHours: "Mon-Fri 9:00-17:00",
      officeLocation: `Room ${String.fromCharCode(65 + ((i - 1) % 6))}${((i - 1) % 5) + 1}0${((i - 1) % 9) + 1}`
    });
  }

  // ===== 5 DEPARTMENT CHAIRS (chair1-5) =====
  for (let i = 1; i <= 5; i++) {
    programUsers.push({
      id: `user:${userIdCounter++}`,
      email: `chair${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Prof. Dr. Tran Van ${String.fromCharCode(64 + i)}`,
      role: "chair",
      chairId: `CHAIR${String(100 + i).slice(-3)}`,
      department: departments[i - 1],
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      officeLocation: `Dean Office ${i}`,
      yearsInPosition: Math.floor(Math.random() * 8) + 2
    });
  }

  // ===== 5 COORDINATORS (coord1-5) =====
  for (let i = 1; i <= 5; i++) {
    programUsers.push({
      id: `user:${userIdCounter++}`,
      email: `coord${i}@hcmut.edu.vn`,
      password: "123456789",
      name: `Le Thi ${String.fromCharCode(64 + i)}`,
      role: "coordinator",
      coordinatorId: `COORD${String(100 + i).slice(-3)}`,
      department: departments[i - 1],
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      officeLocation: `Coordination Office ${i}`,
      yearsExperience: Math.floor(Math.random() * 6) + 2
    });
  }

  // ===== 5 ADMINISTRATORS (admin1-5) =====
  for (let i = 1; i <= 5; i++) {
    programUsers.push({
      id: `user:${userIdCounter++}`,
      email: `admin${i}@hcmut.edu.vn`,
      password: "admin123",
      name: `Pham Minh ${String.fromCharCode(64 + i)}`,
      role: "administrator",
      adminId: `ADMIN${String(100 + i).slice(-3)}`,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      officeLocation: `Administration Office ${i}`,
      accessLevel: i === 1 ? "super" : "standard"
    });
  }

  console.log(`Generated ${programUsers.length} BK TUTOR program users (10 students + 10 tutors + 5 chairs + 5 coordinators + 5 admins = 35 total)`);
  return programUsers;
};

// ============= SESSIONS GENERATION =============
// CRITICAL: Each pre-reg student (user:1-10) gets EXACTLY 5 sessions with pre-reg tutors (user:11-20)

export const generateSessions = (users: any[]) => {
  const students = users.filter(u => u.role === "student");
  const tutors = users.filter(u => u.role === "tutor");
  const sessions = [];
  let sessionIdCounter = 1;

  const subjects = [
    "Data Structures",
    "Algorithms", 
    "Database Systems",
    "Web Development",
    "Operating Systems",
    "Machine Learning"
  ];

  const topics: { [key: string]: string[] } = {
    "Data Structures": ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables", "Heaps"],
    "Algorithms": ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms", "Graph Algorithms"],
    "Database Systems": ["SQL Queries", "Normalization", "Indexing", "Transactions", "NoSQL"],
    "Web Development": ["HTML/CSS", "JavaScript", "React", "Node.js", "APIs"],
    "Operating Systems": ["Process Scheduling", "Memory Management", "File Systems", "Concurrency"],
    "Machine Learning": ["Linear Regression", "Classification", "Neural Networks", "Deep Learning"],
  };

  const locations = [
    "Library Room 201",
    "Study Room A3",
    "Computer Lab B2",
    "Tutorial Room 105",
    "Meeting Room C4"
  ];

  // ===== CRITICAL: Each PRE-REG STUDENT (user:1 to user:10) gets EXACTLY 5 sessions =====
  // Sessions are ONLY with PRE-REG TUTORS (user:11 to user:20)
  
  const preRegStudents = students.slice(0, 10); // user:1 to user:10
  const preRegTutors = tutors.slice(0, 10);     // user:11 to user:20
  
  preRegStudents.forEach((student, studentIndex) => {
    // Each student gets EXACTLY 5 sessions
    for (let sessionNum = 0; sessionNum < 5; sessionNum++) {
      // Assign tutor (rotate through tutors to ensure all tutors get sessions)
      const tutorIndex = (studentIndex * 5 + sessionNum) % preRegTutors.length;
      const tutor = preRegTutors[tutorIndex];
      
      const subject = subjects[sessionNum % subjects.length];
      const topicList = topics[subject] || ["General"];
      const topic = topicList[Math.floor(Math.random() * topicList.length)];
      
      // Session distribution for each student:
      // Session 0: completed (past)
      // Session 1: completed (past)
      // Session 2: confirmed (upcoming within 7 days)
      // Session 3: confirmed (upcoming within 7 days)
      // Session 4: pending (future)
      
      let status;
      let daysOffset;
      
      if (sessionNum < 2) {
        // Sessions 0-1: completed (past)
        daysOffset = -30 + (sessionNum * 5);
        status = "completed";
      } else if (sessionNum < 4) {
        // Sessions 2-3: confirmed (upcoming within 7 days)
        daysOffset = 1 + ((sessionNum - 2) * 3);
        status = "confirmed";
      } else {
        // Session 4: pending (future)
        daysOffset = 10 + Math.floor(Math.random() * 10);
        status = "pending";
      }
      
      const baseDate = new Date("2024-11-04");
      const sessionDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);

      const duration = [60, 90, 120][sessionNum % 3];
      const hour = 9 + (sessionNum * 2) % 8; // 9, 11, 13, 15, 17
      const time = `${String(hour).padStart(2, '0')}:00`;
      const location = locations[sessionNum % locations.length];
      
      // Validate all required fields exist
      if (!student || !student.id || !tutor || !tutor.id || !subject || !status) {
        console.error('Session validation failed:', { student: student?.id, tutor: tutor?.id, subject, status });
        continue; // Skip this session
      }

      const session: any = {
        id: `session:${sessionIdCounter++}`,
        studentId: student.id,
        tutorId: tutor.id,
        subject: subject || 'General',
        topic: topic || 'General',
        status: status || 'pending',
        date: sessionDate.toISOString().split('T')[0],
        time: time || '09:00',
        duration: duration || 60,
        location: status === "pending" ? "TBD" : (location || "TBD"),
        createdAt: new Date(sessionDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Add rating and feedback for completed sessions
      if (status === "completed") {
        const rating = 4 + (sessionNum % 2); // Alternates between 4 and 5
        session.rating = rating;
        session.feedback = [
          "Very helpful session! Explained everything clearly.",
          "Great explanation, now I understand the topic much better.",
          "Excellent tutor, very patient and knowledgeable.",
          "Good session, helped me with difficult concepts.",
          "Perfect! Now I feel confident about the topic.",
        ][sessionNum % 5];
        session.notes = `Covered ${topic}. Student showed good understanding.`;
      }

      sessions.push(session);
    }
  });

  console.log(`Generated ${sessions.length} sessions (10 students × 5 sessions = 50 total)`);
  console.log(`Session distribution: 20 completed, 20 confirmed, 10 pending`);
  return sessions;
};

// ============= MATERIALS GENERATION =============

export const generateMaterials = (users: any[]) => {
  const tutors = users.filter(u => u.role === "tutor");
  const admins = users.filter(u => u.role === "administrator");
  const uploaders = [...tutors, ...admins];
  
  const materials = [];
  let materialIdCounter = 1;

  const subjects = [
    "Data Structures",
    "Algorithms",
    "Database Systems",
    "Web Development",
    "Operating Systems",
    "Machine Learning"
  ];

  const titles = [
    "Introduction to",
    "Advanced",
    "Practical Guide to",
    "Complete Tutorial on",
    "Best Practices in",
    "Understanding"
  ];

  const types = ["pdf", "video", "document", "slides"];

  for (let i = 0; i < 30; i++) {
    if (uploaders.length === 0) break;
    const uploader = uploaders[i % uploaders.length];
    const subject = subjects[i % subjects.length];
    const titlePrefix = titles[i % titles.length];
    const type = types[i % types.length];
    const daysAgo = Math.floor(Math.random() * 120);
    const uploadDate = new Date(new Date("2024-11-04").getTime() - daysAgo * 24 * 60 * 60 * 1000);

    materials.push({
      id: `material:${materialIdCounter++}`,
      title: `${titlePrefix} ${subject}`,
      subject,
      type,
      uploadedBy: uploader.id,
      uploadDate: uploadDate.toISOString().split('T')[0],
      fileSize: `${Math.floor(Math.random() * 50) + 1} MB`,
      downloads: Math.floor(Math.random() * 200),
    });
  }

  console.log(`Generated ${materials.length} materials`);
  return materials;
};

// ============= PROGRESS GENERATION =============
// CRITICAL: Progress records are ONLY created for subjects with COMPLETED sessions

export const generateProgress = (users: any[], sessions: any[]) => {
  const students = users.filter(u => u.role === "student");
  const progressRecords = [];
  let progressIdCounter = 1;

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

  students.forEach(student => {
    // Get ONLY completed sessions for this student
    const completedSessions = sessions.filter(s => 
      s.studentId === student.id && s.status === "completed"
    );
    
    // Group completed sessions by subject
    const sessionsBySubject: { [key: string]: any[] } = {};
    completedSessions.forEach(session => {
      if (!sessionsBySubject[session.subject]) {
        sessionsBySubject[session.subject] = [];
      }
      sessionsBySubject[session.subject].push(session);
    });

    // Create progress record ONLY for subjects with completed sessions
    Object.entries(sessionsBySubject).forEach(([subject, subjectSessions]) => {
      const sessionsAttended = subjectSessions.length;
      const ratings = subjectSessions.filter(s => s.rating).map(s => s.rating);
      const averageRating = ratings.length > 0 
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;
      
      const improvementScore = Math.min(100, Math.floor(
        (sessionsAttended * 15) + (averageRating * 12) + (Math.random() * 10)
      ));
      
      const lastSession = subjectSessions.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      );

      progressRecords.push({
        id: `progress:${progressIdCounter++}`,
        studentId: student.id,
        subject,
        sessionsAttended,
        averageRating,
        improvementScore,
        lastSessionDate: lastSession.date,
        strengths: strengths[Math.floor(Math.random() * strengths.length)],
        weaknesses: weaknesses[Math.floor(Math.random() * weaknesses.length)],
      });
    });
  });

  console.log(`Generated ${progressRecords.length} progress records (synced with completed sessions)`);
  return progressRecords;
};

// ============= AVAILABILITY GENERATION =============

export const generateAvailability = (users: any[]) => {
  const tutors = users.filter(u => u.role === "tutor");
  const availability = [];
  let availabilityIdCounter = 1;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    { start: "09:00", end: "11:00" },
    { start: "11:00", end: "13:00" },
    { start: "13:00", end: "15:00" },
    { start: "15:00", end: "17:00" },
  ];

  tutors.forEach((tutor, tutorIndex) => {
    // Each tutor has 6-10 availability slots
    const numSlots = 6 + Math.floor(Math.random() * 5);
    const selectedSlots = new Set();

    for (let i = 0; i < numSlots; i++) {
      const day = days[Math.floor(Math.random() * days.length)];
      const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const slotKey = `${day}-${slot.start}`;

      if (!selectedSlots.has(slotKey)) {
        selectedSlots.add(slotKey);
        availability.push({
          id: `availability:${availabilityIdCounter++}`,
          tutorId: tutor.id,
          dayOfWeek: day,
          startTime: slot.start,
          endTime: slot.end,
          isAvailable: true, // Always available initially
        });
      }
    }
  });

  console.log(`Generated ${availability.length} availability slots`);
  return availability;
};

// ============= FEEDBACK GENERATION =============

export const generateFeedback = (sessions: any[]) => {
  const completedSessions = sessions.filter(s => s.status === "completed" && s.rating);
  const feedbacks = [];
  let feedbackIdCounter = 1;

  completedSessions.forEach(session => {
    const rating = session.rating;
    const clarity = Math.max(1, Math.min(5, rating));
    const helpfulness = Math.max(1, Math.min(5, rating));
    const punctuality = 5; // Assume all tutors are punctual
    
    const daysAfterSession = Math.floor(Math.random() * 3);
    const submittedDate = new Date(new Date(session.date).getTime() + daysAfterSession * 24 * 60 * 60 * 1000);

    feedbacks.push({
      id: `feedback:${feedbackIdCounter++}`,
      sessionId: session.id,
      rating,
      clarity,
      helpfulness,
      punctuality,
      comment: session.feedback || "Good session",
      submittedDate: submittedDate.toISOString().split('T')[0],
    });
  });

  console.log(`Generated ${feedbacks.length} feedback entries (synced with completed sessions)`);
  return feedbacks;
};

// ============= ANNOUNCEMENTS GENERATION =============

export const generateAnnouncements = (users: any[]) => {
  const coordinators = users.filter(u => u.role === "coordinator");
  const admins = users.filter(u => u.role === "administrator");
  const posters = [...coordinators, ...admins];
  
  const announcements = [];
  let announcementIdCounter = 1;

  const announcementData = [
    {
      title: "New Tutoring Hours Available",
      content: "We are pleased to announce extended tutoring hours for the upcoming exam period. Tutors are now available from 8:00 AM to 8:00 PM.",
      priority: "high",
      targetAudience: "all"
    },
    {
      title: "Midterm Exam Support Sessions",
      content: "Special support sessions will be available for midterm exam preparation. Book your sessions early as slots are filling up fast!",
      priority: "high",
      targetAudience: "students"
    },
    {
      title: "Final Exam Preparation Program",
      content: "The final exam preparation program will begin next week. All students are encouraged to schedule sessions with their tutors.",
      priority: "high",
      targetAudience: "students"
    },
    {
      title: "New Learning Materials Added",
      content: "New study materials have been added to the library. Check the Materials section for resources on Data Structures, Algorithms, and more.",
      priority: "medium",
      targetAudience: "all"
    },
    {
      title: "Tutor Recognition Awards",
      content: "Congratulations to our top-rated tutors this semester! Your dedication to helping students is truly appreciated.",
      priority: "medium",
      targetAudience: "tutors"
    },
    {
      title: "System Maintenance Notice",
      content: "The system will undergo maintenance this weekend from 2:00 AM to 6:00 AM. Please plan your sessions accordingly.",
      priority: "high",
      targetAudience: "all"
    },
    {
      title: "New Tutors Joining BK TUTOR",
      content: "We welcome new tutors to our program this semester. They bring expertise in various subjects. Schedule sessions with them today!",
      priority: "medium",
      targetAudience: "students"
    },
    {
      title: "Student Success Stories",
      content: "Read about how our tutoring program helped students improve their grades and understanding. Visit the announcements page for more.",
      priority: "low",
      targetAudience: "all"
    },
    {
      title: "Tutoring Program Updates",
      content: "Important updates to the tutoring program policies. All participants should review the changes in the settings section.",
      priority: "medium",
      targetAudience: "all"
    },
    {
      title: "Holiday Schedule Changes",
      content: "The tutoring center will have modified hours during the upcoming holiday period. Check the schedule for details.",
      priority: "medium",
      targetAudience: "all"
    },
  ];

  announcementData.forEach((data, i) => {
    if (posters.length === 0) return;
    const poster = posters[i % posters.length];
    const daysAgo = 60 - (i * 5);
    const postedDate = new Date(new Date("2024-11-04").getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    announcements.push({
      id: `announcement:${announcementIdCounter++}`,
      title: data.title,
      content: data.content,
      postedBy: poster.id,
      postedDate: postedDate.toISOString().split('T')[0],
      priority: data.priority,
      targetAudience: data.targetAudience,
    });
  });

  console.log(`Generated ${announcements.length} announcements`);
  return announcements;
};

// ============= NOTIFICATIONS GENERATION =============
// CRITICAL: Notifications are ONLY created for CONFIRMED sessions and announcements

export const generateNotifications = (users: any[], sessions: any[], announcements: any[]) => {
  const notifications = [];
  let notificationIdCounter = 1;

  // Generate notifications ONLY for confirmed sessions
  const confirmedSessions = sessions.filter(s => s.status === "confirmed");
  
  confirmedSessions.forEach(session => {
    // Notification to student
    notifications.push({
      id: `notification:${notificationIdCounter++}`,
      userId: session.studentId,
      type: "session_reminder",
      title: "Upcoming Session",
      message: `You have a tutoring session on ${session.date} at ${session.time}`,
      relatedId: session.id,
      isRead: false,
      createdAt: new Date(new Date(session.date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });

    // Notification to tutor
    notifications.push({
      id: `notification:${notificationIdCounter++}`,
      userId: session.tutorId,
      type: "session_reminder",
      title: "Upcoming Session",
      message: `You have a tutoring session on ${session.date} at ${session.time}`,
      relatedId: session.id,
      isRead: false,
      createdAt: new Date(new Date(session.date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  // Generate announcement notifications for recent announcements
  const students = users.filter(u => u.role === "student");
  const tutors = users.filter(u => u.role === "tutor");
  
  announcements.slice(0, 5).forEach(announcement => {
    const targetUsers = announcement.targetAudience === "all" 
      ? users 
      : announcement.targetAudience === "students" 
        ? students 
        : tutors;
    
    // Send to first 10 users in target audience
    const recipients = targetUsers.slice(0, 10);
    
    recipients.forEach(user => {
      notifications.push({
        id: `notification:${notificationIdCounter++}`,
        userId: user.id,
        type: "announcement",
        title: announcement.title,
        message: announcement.content.substring(0, 100) + "...",
        relatedId: announcement.id,
        isRead: Math.random() > 0.5,
        createdAt: announcement.postedDate,
      });
    });
  });

  console.log(`Generated ${notifications.length} notifications (synced with confirmed sessions and announcements)`);
  return notifications;
};
