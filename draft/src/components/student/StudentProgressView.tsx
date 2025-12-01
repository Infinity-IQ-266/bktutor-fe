import { TrendingUp, Star, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { globalEvents, EVENTS } from '../../utils/helpers';

interface ProgressData {
  subject: string;
  tutor: string;
  tutorId: string;
  totalSessions: number;
  completedSessions: number;
  attendance: string;
  lastSession: string;
  improvementScore: number;
  averageRating: number;
  progress: Array<{
    date: string;
    note: string;
    rating?: number;
  }>;
}

export default function StudentProgressView() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 FIX: Get email from localStorage
  const currentUserEmail = localStorage.getItem('currentUserEmail');

  useEffect(() => {
    loadProgressData();

    // 🔔 Auto-refresh when sessions or progress updated
    const handleUpdate = () => {
      console.log('🔄 Progress view auto-refreshing...');
      loadProgressData();
    };

    globalEvents.on(EVENTS.SESSION_COMPLETED, handleUpdate);
    globalEvents.on(EVENTS.SESSION_UPDATED, handleUpdate);
    globalEvents.on(EVENTS.PROGRESS_UPDATED, handleUpdate);

    return () => {
      globalEvents.off(EVENTS.SESSION_COMPLETED, handleUpdate);
      globalEvents.off(EVENTS.SESSION_UPDATED, handleUpdate);
      globalEvents.off(EVENTS.PROGRESS_UPDATED, handleUpdate);
    };
  }, []);

  const loadProgressData = async () => {
    try {
      console.log('📈 [Progress] Loading progress data...');
      
      if (!currentUserEmail) {
        console.error('❌ [Progress] No user email found! Please re-login');
        setLoading(false);
        return;
      }
      
      console.log('📧 [Progress] Email:', currentUserEmail);
      
      // Get current user
      const userResult = await api.getUserByEmail(currentUserEmail);
      if (!userResult.user) {
        console.error('❌ [Progress] User not found for email:', currentUserEmail);
        setLoading(false);
        return;
      }
      
      console.log('👤 [Progress] User:', userResult.user.name);

      // Get progress records from backend (automatically generated from completed sessions)
      const progressRecords = await api.getProgressForStudent(userResult.user.id);
      console.log('📈 [Progress] Records:', progressRecords.length);
      
      // Get all sessions for additional details
      const sessionsResult = await api.getSessions({ studentId: userResult.user.id });
      const sessions = sessionsResult.sessions || [];
      console.log('📅 [Progress] Sessions:', sessions.length);

      // Build progress data from progress records
      const progressMap = new Map<string, ProgressData>();

      for (const record of progressRecords) {
        // Get tutor from sessions for this subject
        const subjectSessions = sessions.filter((s: any) => 
          s.subject === record.subject && s.status === 'completed'
        );
        
        if (subjectSessions.length === 0) continue;
        
        const tutorId = subjectSessions[0].tutorId;
        const key = `${record.subject}-${tutorId}`;
        
        if (!progressMap.has(key)) {
          // Get tutor info
          const tutorResult = await api.getUser(tutorId);
          const tutor = tutorResult.user;

          // Count total sessions (including scheduled)
          const allSubjectSessions = sessions.filter((s: any) => 
            s.subject === record.subject && s.tutorId === tutorId
          );

          progressMap.set(key, {
            subject: record.subject,
            tutor: tutor?.name || 'Unknown Tutor',
            tutorId: tutorId,
            totalSessions: allSubjectSessions.length,
            completedSessions: record.sessionsAttended,
            attendance: '0%',
            lastSession: '',
            improvementScore: record.improvementScore || 0,
            averageRating: record.averageRating || 0,
            progress: []
          });
        }

        const progress = progressMap.get(key)!;

        // Add progress notes from completed sessions
        subjectSessions
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .forEach((session: any) => {
            progress.progress.push({
              date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              note: session.feedback || session.tutorFeedback || `Session on ${session.topic || session.subject}`,
              rating: session.rating
            });
          });

        // Update last session from progress record
        if (record.lastSessionDate) {
          progress.lastSession = new Date(record.lastSessionDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
        }

        // Calculate attendance
        const attendanceRate = progress.totalSessions > 0 
          ? Math.round((progress.completedSessions / progress.totalSessions) * 100)
          : 0;
        progress.attendance = `${attendanceRate}%`;
      }

      setProgressData(Array.from(progressMap.values()));
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall stats
  const totalSessions = progressData.reduce((sum, p) => sum + p.completedSessions, 0);
  const totalScheduled = progressData.reduce((sum, p) => sum + p.totalSessions, 0);
  const overallAttendance = totalScheduled > 0 
    ? Math.round((totalSessions / totalScheduled) * 100) 
    : 0;
  const activeSubjects = progressData.length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Learning Progress</h1>
          <p className="text-muted-foreground">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  if (progressData.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Learning Progress</h1>
          <p className="text-muted-foreground">Track your academic progress and tutor feedback</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Progress Data Yet</h3>
          <p className="text-muted-foreground">
            Complete tutoring sessions to see your learning progress here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Learning Progress</h1>
        <p className="text-muted-foreground">Track your academic progress and tutor feedback</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{totalSessions}</p>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{overallAttendance}%</p>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl text-foreground">{activeSubjects}</p>
              <p className="text-sm text-muted-foreground">Active Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress by Subject */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Subjects</TabsTrigger>
          {progressData.map((item, idx) => (
            <TabsTrigger key={idx} value={`subject-${idx}`}>
              {item.subject}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            {progressData.map((item, idx) => (
              <SubjectProgressCard key={idx} data={item} />
            ))}
          </div>
        </TabsContent>

        {progressData.map((item, idx) => (
          <TabsContent key={idx} value={`subject-${idx}`} className="mt-6">
            <SubjectProgressCard data={item} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SubjectProgressCard({ data }: { data: ProgressData }) {
  const attendanceValue = parseInt(data.attendance);
  const improvementValue = Math.min(data.improvementScore, 100);
  
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-foreground mb-1">{data.subject}</h3>
          <p className="text-sm text-muted-foreground">{data.tutor}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Sessions</p>
          <p className="text-2xl text-foreground">{data.completedSessions}/{data.totalSessions}</p>
        </div>
      </div>

      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Attendance Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <p className="text-sm text-foreground">{data.attendance}</p>
          </div>
          <Progress value={attendanceValue} className="h-2" />
        </div>

        {/* Improvement Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-sm text-foreground">{improvementValue}%</p>
          </div>
          <Progress value={improvementValue} className="h-2" />
        </div>

        {/* Average Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <p className="text-sm text-foreground">{data.averageRating.toFixed(1)}/5.0</p>
            </div>
          </div>
          <Progress value={(data.averageRating / 5) * 100} className="h-2" />
        </div>
      </div>

      {data.progress.length > 0 ? (
        <div>
          <h4 className="text-foreground mb-3">Progress Notes</h4>
          <div className="space-y-3">
            {data.progress.map((note, idx) => (
              <div key={idx} className="flex gap-4 pb-3 border-b border-border last:border-b-0 last:pb-0">
                <div className="text-sm text-muted-foreground min-w-[80px]">{note.date}</div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">"{note.note}"</p>
                  {note.rating && (
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < note.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No completed sessions yet</p>
        </div>
      )}
    </div>
  );
}
