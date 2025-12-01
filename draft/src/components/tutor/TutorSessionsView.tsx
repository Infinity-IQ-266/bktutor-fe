import { Calendar, Clock, MapPin, Video, CheckCircle, X, Edit, Eye, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface TutorSessionsViewProps {
  userData?: any;
}

export default function TutorSessionsView({ userData }: TutorSessionsViewProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [progressNote, setProgressNote] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [homework, setHomework] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [acceptMessage, setAcceptMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    loadSessions();
    
    // Poll for new sessions every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, [userData]);

  const loadSessions = async () => {
    if (!userData?.id) return;
    
    try {
      const response = await api.getSessionsForUser(userData.id);
      const sessionsData = response.sessions || [];
      
      // Enrich sessions with student info
      const enrichedSessions = await Promise.all(
        sessionsData.map(async (session: any) => {
          const studentResponse = await api.getUser(session.studentId);
          const student = studentResponse.user;
          
          return {
            ...session,
            studentEmail: student?.email,
            studentName: student?.name || session.studentName,
            studentFaculty: student?.department,
            studentYear: student?.year
          };
        })
      );
      
      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = (session: any) => {
    setSelectedSession(session);
    setProgressNote('');
    setSessionNotes('');
    setHomework('');
    setShowCompleteDialog(true);
  };

  const saveSessionNotes = async () => {
    if (!progressNote || !selectedSession) {
      toast.error('Please add a progress note');
      return;
    }

    try {
      await api.updateSession(selectedSession.id, {
        status: 'completed',
        progressNote,
        notes: sessionNotes,
        homework,
        completedAt: new Date().toISOString()
      });

      // Notify student
      await api.createNotification({
        userId: selectedSession.studentId,
        type: 'session_completed',
        title: 'Session Completed',
        message: `Your ${selectedSession.subject} session with ${userData.name} has been completed. Progress notes are available.`,
        relatedId: selectedSession.id
      });

      await loadSessions();
      setShowCompleteDialog(false);
      toast.success('Session marked as completed');
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  const handleReschedule = (session: any) => {
    setSelectedSession(session);
    setRescheduleTime('');
    setRescheduleReason('');
    setShowRescheduleDialog(true);
  };

  const confirmReschedule = async () => {
    if (!selectedDate || !rescheduleTime || !selectedSession) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      const newDate = selectedDate.toISOString().split('T')[0];
      const [startTime, endTime] = rescheduleTime.includes('-') 
        ? rescheduleTime.split('-').map(t => t.trim())
        : [rescheduleTime, rescheduleTime];
      
      // Use the new reschedule request API
      await api.requestReschedule(
        selectedSession.id,
        userData.id,
        newDate,
        startTime,
        endTime,
        rescheduleReason
      );

      await loadSessions();
      setShowRescheduleDialog(false);
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error('Failed to reschedule session');
    }
  };

  const handleCancel = (session: any) => {
    setSelectedSession(session);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!selectedSession) {
      return;
    }

    try {
      // Use the new cancel session API
      await api.cancelSession(selectedSession.id, userData.id);

      await loadSessions();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const handleAccept = (session: any) => {
    setSelectedSession(session);
    setAcceptMessage('');
    setShowAcceptDialog(true);
  };

  const confirmAccept = async () => {
    if (!selectedSession) return;

    try {
      await api.updateSession(selectedSession.id, {
        status: 'confirmed'
      });

      // Notify student
      await api.createNotification({
        userId: selectedSession.studentId,
        type: 'session_accepted',
        title: 'Session Request Accepted',
        message: `${userData.name} has accepted your ${selectedSession.subject} session request for ${selectedSession.date} at ${selectedSession.time}. ${acceptMessage}`,
        relatedId: selectedSession.id
      });

      await loadSessions();
      setShowAcceptDialog(false);
      toast.success('Session request accepted');
    } catch (error) {
      console.error('Error accepting session:', error);
      toast.error('Failed to accept session');
    }
  };

  const handleDecline = (session: any) => {
    setSelectedSession(session);
    setDeclineReason('');
    setShowDeclineDialog(true);
  };

  const confirmDecline = async () => {
    if (!declineReason || !selectedSession) {
      toast.error('Please provide a reason for declining');
      return;
    }

    try {
      await api.updateSession(selectedSession.id, {
        status: 'declined'
      });

      // Notify student
      await api.createNotification({
        userId: selectedSession.studentId,
        type: 'session_declined',
        title: 'Session Request Declined',
        message: `${userData.name} has declined your ${selectedSession.subject} session request. Reason: ${declineReason}`,
        relatedId: selectedSession.id
      });

      await loadSessions();
      setShowDeclineDialog(false);
      toast.success('Session request declined');
    } catch (error) {
      console.error('Error declining session:', error);
      toast.error('Failed to decline session');
    }
  };

  const handleViewNotes = (session: any) => {
    setSelectedSession(session);
    setShowNotesDialog(true);
  };

  const handleViewStudent = async (session: any) => {
    try {
      const response = await api.getUser(session.studentId);
      setSelectedSession({
        ...session,
        studentDetails: response.user
      });
      setShowStudentDialog(true);
    } catch (error) {
      console.error('Error loading student details:', error);
      toast.error('Failed to load student details');
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === 'confirmed');
  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">My Sessions</h1>
        <p className="text-muted-foreground">Manage your tutoring sessions and requests</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests ({pendingSessions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            ) : (
              upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onViewStudent={handleViewStudent}
                  getStatusColor={getStatusColor}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => handleCompleteSession(session)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReschedule(session)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleCancel(session)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : pendingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              pendingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onViewStudent={handleViewStudent}
                  getStatusColor={getStatusColor}
                  showRequest
                  actions={
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleAccept(session)}>
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDecline(session)}>
                        Decline
                      </Button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : completedSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed sessions</p>
              </div>
            ) : (
              completedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onViewStudent={handleViewStudent}
                  getStatusColor={getStatusColor}
                  actions={
                    <Button size="sm" variant="outline" onClick={() => handleViewNotes(session)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Notes
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Complete Session Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Session & Add Progress Note</DialogTitle>
            <DialogDescription>
              Record student progress and session outcomes
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Student</p>
                <p className="text-foreground mb-3">{selectedSession.studentName}</p>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="text-foreground">{selectedSession.subject}</p>
              </div>
              
              <div>
                <Label htmlFor="progress-note">Progress Note *</Label>
                <Textarea
                  id="progress-note"
                  placeholder="Record the student's progress, topics covered, areas for improvement..."
                  className="mt-1 min-h-[120px]"
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="session-notes">Session Notes (Optional)</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Any additional notes about the session..."
                  className="mt-1 min-h-[80px]"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="homework">Homework/Next Steps (Optional)</Label>
                <Textarea
                  id="homework"
                  placeholder="Recommended practice problems or topics to study..."
                  className="mt-1"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCompleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={saveSessionNotes}
                >
                  Save & Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Propose a new date and time
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Current session</p>
                <p className="text-foreground">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground">{selectedSession.date} at {selectedSession.time}</p>
              </div>

              <div>
                <Label>New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="new-time">New Time</Label>
                <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</SelectItem>
                    <SelectItem value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</SelectItem>
                    <SelectItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</SelectItem>
                    <SelectItem value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
                <Textarea
                  id="reschedule-reason"
                  placeholder="Why do you need to reschedule?"
                  className="mt-1"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRescheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={confirmReschedule}
                >
                  Propose Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? The student will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-foreground">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.studentName} • {selectedSession.date} at {selectedSession.time}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Please provide a reason for cancellation..."
                  className="min-h-[80px]"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Session</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmCancel}
            >
              Cancel Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Request Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Session Request</DialogTitle>
            <DialogDescription>
              Confirm the session details before accepting
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Student</p>
                <p className="text-foreground mb-3">{selectedSession.studentName}</p>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="text-foreground mb-3">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground mb-1">Requested Time</p>
                <p className="text-foreground mb-3">{selectedSession.date} at {selectedSession.time}</p>
                {selectedSession.notes && (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">Student Notes</p>
                    <p className="text-foreground">{selectedSession.notes}</p>
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="accept-notes">Message to Student (Optional)</Label>
                <Textarea
                  id="accept-notes"
                  placeholder="Add any notes or preparation instructions..."
                  className="mt-1"
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAcceptDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={confirmAccept}
                >
                  Accept Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Request Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Session Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this request
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-foreground">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.studentName} • {selectedSession.date}
                </p>
              </div>

              <div>
                <Label htmlFor="decline-reason">Reason *</Label>
                <Textarea
                  id="decline-reason"
                  placeholder="Why are you declining this request? (This will be sent to the student)"
                  className="mt-1 min-h-[100px]"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeclineDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={confirmDecline}
                >
                  Decline Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Student</p>
                <p className="text-foreground mb-3">{selectedSession.studentName}</p>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="text-foreground mb-3">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-foreground">{selectedSession.date} at {selectedSession.time}</p>
              </div>

              {selectedSession.progressNote && (
                <div>
                  <h4 className="text-foreground mb-2">Progress Note</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedSession.progressNote}</p>
                  </div>
                </div>
              )}

              {selectedSession.notes && (
                <div>
                  <h4 className="text-foreground mb-2">Session Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedSession.notes}</p>
                  </div>
                </div>
              )}

              {selectedSession.homework && (
                <div>
                  <h4 className="text-foreground mb-2">Homework/Next Steps</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedSession.homework}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNotesDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Student Profile Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          
          {selectedSession && selectedSession.studentDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="text-foreground">{selectedSession.studentDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                    <p className="text-foreground">{selectedSession.studentDetails.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{selectedSession.studentDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year</p>
                    <p className="text-foreground">Year {selectedSession.studentDetails.year}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-foreground mb-3">Academic Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="text-foreground">{selectedSession.studentDetails.department}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStudentDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionCard({ session, actions, onViewStudent, showRequest, getStatusColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => onViewStudent(session)}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <h3 className="text-foreground">{session.studentName}</h3>
              <User className="w-4 h-4" />
            </button>
            <Badge variant="secondary">ID: {session.studentId}</Badge>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{session.subject}</p>
          {showRequest && session.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-muted-foreground mb-1">Student's request:</p>
              <p className="text-sm text-foreground">{session.notes}</p>
            </div>
          )}
        </div>
        {actions}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{session.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{session.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {session.type === 'online' || session.type === 'Online (MS Teams)' ? (
            <Video className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span>{session.location}</span>
        </div>
      </div>
    </div>
  );
}
