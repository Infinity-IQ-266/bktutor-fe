import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  generateSSOUsers,
  generateProgramUsers,
  generateSessions,
  generateMaterials,
  generateProgress,
  generateAvailability,
  generateFeedback,
  generateAnnouncements,
  generateNotifications
} from "./database-seed.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to calculate tutor statistics
async function calculateTutorStats(tutorId: string) {
  const allSessions = await kv.getByPrefix("session:");
  const tutorSessions = allSessions.filter((s: any) => s.tutorId === tutorId);
  const completed = tutorSessions.filter((s: any) => s.status === "completed");
  
  const ratings = completed.filter((s: any) => s.rating).map((s: any) => s.rating);
  const averageRating = ratings.length > 0 
    ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
    : 0;
  
  const totalSessions = completed.length;
  const totalHours = completed.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60;
  const uniqueStudents = new Set(tutorSessions.map((s: any) => s.studentId)).size;
  
  return {
    averageRating,
    totalSessions,
    totalHours: parseFloat(totalHours.toFixed(1)),
    activeStudents: uniqueStudents,
  };
}

// Helper function to calculate student statistics
async function calculateStudentStats(studentId: string) {
  const allSessions = await kv.getByPrefix("session:");
  const studentSessions = allSessions.filter((s: any) => s.studentId === studentId);
  const completed = studentSessions.filter((s: any) => s.status === "completed");
  const upcoming = studentSessions.filter((s: any) => s.status === "confirmed");
  
  const ratings = completed.filter((s: any) => s.rating).map((s: any) => s.rating);
  const averageRating = ratings.length > 0
    ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
    : 0;
  
  const totalHours = completed.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60;
  
  return {
    totalSessions: completed.length,
    upcomingSessions: upcoming.length,
    totalHours: parseFloat(totalHours.toFixed(1)),
    averageRating,
  };
}

// Initialize database with TWO SEPARATE DATABASES
async function initializeDatabase() {
  try {
    // Check if data already exists
    const existingSSOUsers = await kv.getByPrefix("sso:");
    const existingProgramUsers = await kv.getByPrefix("user:");
    
    if (existingSSOUsers && existingSSOUsers.length >= 67 && existingProgramUsers && existingProgramUsers.length >= 35) {
      console.log("Database already initialized:");
      console.log("- SSO users:", existingSSOUsers.length);
      console.log("- Program users:", existingProgramUsers.length);
      return;
    }

    console.log("Initializing TWO SEPARATE DATABASES...");

    // ===== 1. SSO DATABASE (ALL HCMUT users) =====
    const ssoUsers = generateSSOUsers(); // 67 users (26 students + 26 tutors + 5 chairs + 5 coordinators + 5 admins)
    console.log(`✅ Generated ${ssoUsers.length} SSO users`);
    
    // ===== 2. BK TUTOR PROGRAM DATABASE (Only registered users) =====
    const programUsers = generateProgramUsers(); // 35 users (10 students + 10 tutors + 5 chairs + 5 coordinators + 5 admins)
    console.log(`✅ Generated ${programUsers.length} BK TUTOR program users`);
    
    const sessions = generateSessions(programUsers); // Sessions for program users
    console.log(`✅ Generated ${sessions.length} sessions`);
    
    const materials = generateMaterials(programUsers); // Materials from program users
    console.log(`✅ Generated ${materials.length} materials`);
    
    const progressRecords = generateProgress(programUsers, sessions); // Progress for program users
    console.log(`✅ Generated ${progressRecords.length} progress records`);
    
    const availability = generateAvailability(programUsers); // Availability for program tutors
    console.log(`✅ Generated ${availability.length} availability slots`);
    
    const feedbacks = generateFeedback(sessions); // Feedback for sessions
    console.log(`✅ Generated ${feedbacks.length} feedback entries`);
    
    const announcements = generateAnnouncements(programUsers); // Announcements from coordinators/admins
    console.log(`✅ Generated ${announcements.length} announcements`);
    
    const notifications = generateNotifications(programUsers, sessions, announcements); // Notifications for program users
    console.log(`✅ Generated ${notifications.length} notifications`);

    // Store SSO users
    for (const ssoUser of ssoUsers) {
      await kv.set(ssoUser.id, ssoUser);
    }
    
    // Store program users
    for (const user of programUsers) {
      await kv.set(user.id, user);
    }
    
    // Store all other data
    for (const session of sessions) {
      await kv.set(session.id, session);
    }
    for (const material of materials) {
      await kv.set(material.id, material);
    }
    for (const progress of progressRecords) {
      await kv.set(progress.id, progress);
    }
    for (const avail of availability) {
      await kv.set(avail.id, avail);
    }
    for (const feedback of feedbacks) {
      await kv.set(feedback.id, feedback);
    }
    for (const announcement of announcements) {
      await kv.set(announcement.id, announcement);
    }
    for (const notification of notifications) {
      await kv.set(notification.id, notification);
    }

    // Store metadata
    await kv.set("meta:initialized", { 
      initialized: true, 
      date: new Date().toISOString(),
      ssoUsers: ssoUsers.length,
      programUsers: programUsers.length,
      totalSessions: sessions.length,
      totalMaterials: materials.length,
      totalProgress: progressRecords.length,
      totalAvailability: availability.length,
      totalFeedback: feedbacks.length,
      totalAnnouncements: announcements.length,
      totalNotifications: notifications.length,
    });

    console.log("\n🎉 DATABASE INITIALIZED SUCCESSFULLY!");
    console.log("📊 SSO Database:", ssoUsers.length, "users (ALL HCMUT users)");
    console.log("📊 BK TUTOR Database:", programUsers.length, "users (Registered for program)");
    console.log("📊 Total records:", ssoUsers.length + programUsers.length + sessions.length + materials.length + progressRecords.length + availability.length + feedbacks.length + announcements.length + notifications.length);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

// Track if database has been checked for initialization
let initializationChecked = false;

// Lazy initialization - only run on first request
async function ensureInitialized() {
  if (!initializationChecked) {
    initializationChecked = true;
    await initializeDatabase();
  }
}

// ============= AUTHENTICATION ENDPOINTS =============

app.post("/make-server-722c809d/auth/login", async (c) => {
  try {
    await ensureInitialized(); // Ensure DB is initialized on first request
    const { email, password } = await c.req.json();
    
    // Step 1: Check SSO Database for authentication
    const allSSOUsers = await kv.getByPrefix("sso:");
    const ssoUser = allSSOUsers.find((u: any) => u.email === email && u.password === password);
    
    if (!ssoUser) {
      // SSO authentication failed
      return c.json({ 
        success: false,
        error: "Invalid HCMUT SSO credentials" 
      }, 401);
    }
    
    // Step 2: SSO authentication succeeded - check if user is registered in BK TUTOR program
    const allProgramUsers = await kv.getByPrefix("user:");
    const programUser = allProgramUsers.find((u: any) => u.email === email);
    
    if (programUser) {
      // User is registered in BK TUTOR program
      // Calculate dynamic stats based on role
      let stats = {};
      if (programUser.role === "tutor") {
        stats = await calculateTutorStats(programUser.id);
      } else if (programUser.role === "student") {
        stats = await calculateStudentStats(programUser.id);
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = programUser;
      
      return c.json({ 
        success: true,
        programUser: { ...userWithoutPassword, ...stats },
        token: `token_${programUser.id}_${Date.now()}`
      });
    } else {
      // User authenticated via SSO but NOT registered in BK TUTOR program
      // Return SSO user data so they can complete signup
      const { password: _, ...ssoUserWithoutPassword } = ssoUser;
      
      return c.json({ 
        success: true,
        ssoUser: ssoUserWithoutPassword,
        requiresSignup: true,
        token: `token_sso_${ssoUser.id}_${Date.now()}`
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ 
      success: false,
      error: "Login failed" 
    }, 500);
  }
});

// ============= USER ENDPOINTS =============

app.get("/make-server-722c809d/users", async (c) => {
  try {
    await ensureInitialized(); // Ensure DB is initialized on first request
    const role = c.req.query("role");
    const department = c.req.query("department");
    
    let users = await kv.getByPrefix("user:");
    
    if (role) {
      users = users.filter((u: any) => u.role === role);
    }
    if (department) {
      users = users.filter((u: any) => u.department === department);
    }
    
    // Remove passwords and add calculated stats
    const usersWithStats = await Promise.all(users.map(async (u: any) => {
      const { password, ...userWithoutPassword } = u;
      
      // Calculate stats based on role
      let stats = {};
      if (u.role === "tutor") {
        stats = await calculateTutorStats(u.id);
      } else if (u.role === "student") {
        stats = await calculateStudentStats(u.id);
      }
      
      return { ...userWithoutPassword, ...stats };
    }));
    
    return c.json({ users: usersWithStats });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

app.get("/make-server-722c809d/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const userId = id.startsWith("user:") ? id : `user:${id}`;
    const user = await kv.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Calculate stats
    let stats = {};
    if (user.role === "tutor") {
      stats = await calculateTutorStats(userId);
    } else if (user.role === "student") {
      stats = await calculateStudentStats(userId);
    }
    
    const { password, ...userWithoutPassword } = user;
    return c.json({ user: { ...userWithoutPassword, ...stats } });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// ============= SESSION ENDPOINTS =============

app.get("/make-server-722c809d/sessions", async (c) => {
  try {
    const studentId = c.req.query("studentId");
    const tutorId = c.req.query("tutorId");
    const status = c.req.query("status");
    
    let sessions = await kv.getByPrefix("session:");
    
    if (studentId) {
      sessions = sessions.filter((s: any) => s.studentId === studentId);
    }
    if (tutorId) {
      sessions = sessions.filter((s: any) => s.tutorId === tutorId);
    }
    if (status) {
      sessions = sessions.filter((s: any) => s.status === status);
    }
    
    // Enrich sessions with user data
    const enrichedSessions = await Promise.all(sessions.map(async (session: any) => {
      const student = await kv.get(session.studentId);
      const tutor = await kv.get(session.tutorId);
      
      return {
        ...session,
        studentName: student?.name,
        tutorName: tutor?.name,
        studentEmail: student?.email,
        tutorEmail: tutor?.email,
      };
    }));
    
    return c.json({ sessions: enrichedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return c.json({ error: "Failed to fetch sessions" }, 500);
  }
});

app.post("/make-server-722c809d/sessions", async (c) => {
  try {
    const sessionData = await c.req.json();
    const sessionId = `session:${Date.now()}`;
    
    const newSession = {
      id: sessionId,
      ...sessionData,
      status: sessionData.status || "pending",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(sessionId, newSession);
    
    return c.json({ success: true, session: newSession });
  } catch (error) {
    console.error("Error creating session:", error);
    return c.json({ error: "Failed to create session" }, 500);
  }
});

app.put("/make-server-722c809d/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const session = await kv.get(id);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const oldStatus = session.status;
    const updatedSession = { 
      ...session, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await kv.set(id, updatedSession);
    
    // CRITICAL: When session status changes to "completed", update progress
    if (oldStatus !== "completed" && updatedSession.status === "completed") {
      const allProgress = await kv.getByPrefix("progress:");
      const existingProgress = allProgress.find((p: any) => 
        p.studentId === updatedSession.studentId && 
        p.subject === updatedSession.subject
      );
      
      // Get all completed sessions for this student-subject combination
      const allSessions = await kv.getByPrefix("session:");
      const completedSessionsForSubject = allSessions.filter((s: any) => 
        s.studentId === updatedSession.studentId && 
        s.subject === updatedSession.subject && 
        s.status === "completed"
      );
      
      const sessionsAttended = completedSessionsForSubject.length;
      const ratings = completedSessionsForSubject.filter((s: any) => s.rating).map((s: any) => s.rating);
      const averageRating = ratings.length > 0 
        ? parseFloat((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1))
        : 0;
      const improvementScore = Math.min(100, Math.floor(
        (sessionsAttended * 10) + (averageRating * 15) + 20
      ));
      
      if (existingProgress) {
        // Update existing progress
        existingProgress.sessionsAttended = sessionsAttended;
        existingProgress.averageRating = averageRating;
        existingProgress.improvementScore = improvementScore;
        existingProgress.lastSessionDate = updatedSession.date;
        await kv.set(existingProgress.id, existingProgress);
      } else {
        // Create new progress record
        const newProgress = {
          id: `progress:${Date.now()}`,
          studentId: updatedSession.studentId,
          subject: updatedSession.subject,
          sessionsAttended,
          averageRating,
          improvementScore,
          lastSessionDate: updatedSession.date,
          strengths: ["Engagement", "Participation"],
          weaknesses: ["Practice needed"],
        };
        await kv.set(newProgress.id, newProgress);
      }
      
      // Create notification for student about progress update
      const notification = {
        id: `notification:${Date.now()}`,
        userId: updatedSession.studentId,
        type: "progress_update",
        title: "Progress Updated",
        message: `Your progress in ${updatedSession.subject} has been updated after completing a session.`,
        relatedId: existingProgress?.id || `progress:${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(notification.id, notification);
    }
    
    // When session status changes to "confirmed", create notification
    if (oldStatus !== "confirmed" && updatedSession.status === "confirmed") {
      // Notification for student
      const studentNotification = {
        id: `notification:student-${Date.now()}`,
        userId: updatedSession.studentId,
        type: "session_reminder",
        title: "Upcoming Session",
        message: `You have a tutoring session on ${updatedSession.date} at ${updatedSession.time}`,
        relatedId: updatedSession.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(studentNotification.id, studentNotification);
      
      // Notification for tutor
      const tutorNotification = {
        id: `notification:tutor-${Date.now()}`,
        userId: updatedSession.tutorId,
        type: "session_reminder",
        title: "Upcoming Session",
        message: `You have a tutoring session on ${updatedSession.date} at ${updatedSession.time}`,
        relatedId: updatedSession.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(tutorNotification.id, tutorNotification);
    }
    
    return c.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error("Error updating session:", error);
    return c.json({ error: "Failed to update session" }, 500);
  }
});

app.delete("/make-server-722c809d/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return c.json({ error: "Failed to delete session" }, 500);
  }
});

// ============= MATERIALS ENDPOINTS =============

app.get("/make-server-722c809d/materials", async (c) => {
  try {
    const subject = c.req.query("subject");
    const type = c.req.query("type");
    
    let materials = await kv.getByPrefix("material:");
    
    if (subject) {
      materials = materials.filter((m: any) => m.subject === subject);
    }
    if (type) {
      materials = materials.filter((m: any) => m.type === type);
    }
    
    // Enrich with uploader info
    const enrichedMaterials = await Promise.all(materials.map(async (material: any) => {
      const uploader = await kv.get(material.uploadedBy);
      
      return {
        ...material,
        uploaderName: uploader?.name,
      };
    }));
    
    return c.json({ materials: enrichedMaterials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return c.json({ error: "Failed to fetch materials" }, 500);
  }
});

app.post("/make-server-722c809d/materials", async (c) => {
  try {
    const materialData = await c.req.json();
    const materialId = `material:${Date.now()}`;
    
    const newMaterial = {
      id: materialId,
      ...materialData,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
    };
    
    await kv.set(materialId, newMaterial);
    
    return c.json({ success: true, material: newMaterial });
  } catch (error) {
    console.error("Error creating material:", error);
    return c.json({ error: "Failed to create material" }, 500);
  }
});

// ============= PROGRESS ENDPOINTS =============

app.get("/make-server-722c809d/progress/:studentId", async (c) => {
  try {
    const studentId = c.req.param("studentId");
    const fullStudentId = studentId.startsWith("user:") ? studentId : `user:${studentId}`;
    
    const allProgress = await kv.getByPrefix("progress:");
    const studentProgress = allProgress.filter((p: any) => p.studentId === fullStudentId);
    
    return c.json({ progress: studentProgress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return c.json({ error: "Failed to fetch progress" }, 500);
  }
});

// ============= AVAILABILITY ENDPOINTS =============

app.get("/make-server-722c809d/availability/:tutorId", async (c) => {
  try {
    const tutorId = c.req.param("tutorId");
    const fullTutorId = tutorId.startsWith("user:") ? tutorId : `user:${tutorId}`;
    
    const allAvailability = await kv.getByPrefix("availability:");
    const tutorAvailability = allAvailability.filter((a: any) => a.tutorId === fullTutorId);
    
    return c.json({ availability: tutorAvailability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return c.json({ error: "Failed to fetch availability" }, 500);
  }
});

app.post("/make-server-722c809d/availability", async (c) => {
  try {
    const availabilityData = await c.req.json();
    const availabilityId = `availability:${Date.now()}`;
    
    const newAvailability = {
      id: availabilityId,
      ...availabilityData,
    };
    
    await kv.set(availabilityId, newAvailability);
    
    return c.json({ success: true, availability: newAvailability });
  } catch (error) {
    console.error("Error creating availability:", error);
    return c.json({ error: "Failed to create availability" }, 500);
  }
});

app.put("/make-server-722c809d/availability/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: "Availability slot not found" }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
    };
    
    await kv.set(id, updated);
    
    return c.json({ success: true, availability: updated });
  } catch (error) {
    console.error("Error updating availability:", error);
    return c.json({ error: "Failed to update availability" }, 500);
  }
});

app.delete("/make-server-722c809d/availability/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return c.json({ error: "Failed to delete availability" }, 500);
  }
});

// ============= FEEDBACK ENDPOINTS =============

app.post("/make-server-722c809d/feedback", async (c) => {
  try {
    const feedbackData = await c.req.json();
    const feedbackId = `feedback:${Date.now()}`;
    
    const newFeedback = {
      id: feedbackId,
      ...feedbackData,
      submittedDate: new Date().toISOString().split('T')[0],
    };
    
    await kv.set(feedbackId, newFeedback);
    
    // Update session with rating
    if (feedbackData.sessionId) {
      const session = await kv.get(feedbackData.sessionId);
      if (session) {
        session.rating = feedbackData.rating;
        session.feedback = feedbackData.comment;
        await kv.set(feedbackData.sessionId, session);
      }
    }
    
    return c.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// ============= ANNOUNCEMENTS ENDPOINTS =============

app.get("/make-server-722c809d/announcements", async (c) => {
  try {
    const targetAudience = c.req.query("targetAudience");
    
    let announcements = await kv.getByPrefix("announcement:");
    
    if (targetAudience && targetAudience !== "all") {
      announcements = announcements.filter((a: any) => 
        a.targetAudience === targetAudience || a.targetAudience === "all"
      );
    }
    
    // Sort by date descending
    announcements.sort((a: any, b: any) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    
    // Enrich with poster info
    const enrichedAnnouncements = await Promise.all(announcements.map(async (announcement: any) => {
      const poster = await kv.get(announcement.postedBy);
      
      return {
        ...announcement,
        posterName: poster?.name,
      };
    }));
    
    return c.json({ announcements: enrichedAnnouncements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return c.json({ error: "Failed to fetch announcements" }, 500);
  }
});

app.post("/make-server-722c809d/announcements", async (c) => {
  try {
    const announcementData = await c.req.json();
    const announcementId = `announcement:${Date.now()}`;
    
    const newAnnouncement = {
      id: announcementId,
      ...announcementData,
      postedDate: new Date().toISOString().split('T')[0],
    };
    
    await kv.set(announcementId, newAnnouncement);
    
    return c.json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return c.json({ error: "Failed to create announcement" }, 500);
  }
});

// ============= NOTIFICATIONS ENDPOINTS =============

app.get("/make-server-722c809d/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const fullUserId = userId.startsWith("user:") ? userId : `user:${userId}`;
    
    const allNotifications = await kv.getByPrefix("notification:");
    const userNotifications = allNotifications.filter((n: any) => n.userId === fullUserId);
    
    // Sort by date descending
    userNotifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ notifications: userNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

app.put("/make-server-722c809d/notifications/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    const notification = await kv.get(id);
    
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }
    
    notification.isRead = true;
    await kv.set(id, notification);
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    return c.json({ error: "Failed to update notification" }, 500);
  }
});

// ============= STATISTICS ENDPOINTS =============

app.get("/make-server-722c809d/stats/dashboard", async (c) => {
  try {
    const role = c.req.query("role");
    const userId = c.req.query("userId");
    
    const sessions = await kv.getByPrefix("session:");
    const users = await kv.getByPrefix("user:");
    const materials = await kv.getByPrefix("material:");
    
    let stats: any = {};
    
    if (role === "student" && userId) {
      stats = await calculateStudentStats(userId);
    } else if (role === "tutor" && userId) {
      stats = await calculateTutorStats(userId);
    } else if (role === "coordinator" || role === "chair" || role === "administrator") {
      const students = users.filter((u: any) => u.role === "student");
      const tutors = users.filter((u: any) => u.role === "tutor");
      const completed = sessions.filter((s: any) => s.status === "completed");
      const scheduled = sessions.filter((s: any) => s.status === "confirmed");
      
      stats = {
        totalStudents: students.length,
        totalTutors: tutors.length,
        totalSessions: completed.length,
        scheduledSessions: scheduled.length,
        totalMaterials: materials.length,
        activeMatches: new Set(sessions.filter((s: any) => s.status === "confirmed").map((s: any) => `${s.studentId}-${s.tutorId}`)).size,
        completionRate: sessions.length > 0 
          ? parseFloat(((completed.length / sessions.length) * 100).toFixed(1))
          : 0,
      };
    }
    
    return c.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Health check endpoint
app.get("/make-server-722c809d/health", async (c) => {
  await ensureInitialized(); // Ensure DB is initialized on health check
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
