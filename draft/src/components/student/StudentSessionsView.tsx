import { Calendar, Clock, Edit, Eye, MapPin, Star, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { EVENTS, globalEvents } from '../../utils/helpers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface StudentSessionsViewProps {
  userData?: any;
}

export default function StudentSessionsView({ userData }: StudentSessionsViewProps) {
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [rating, setRating] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState('');

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
      
      // Enrich sessions with tutor info and format time
      const enrichedSessions = await Promise.all(
        sessionsData.map(async (session: any) => {
          try {
            const tutorResponse = await api.getUser(session.tutorId);
            const tutor = tutorResponse.user;
            
            return {
              ...session,
              tutorEmail: tutor?.email || '',
              tutorName: tutor?.name || session.tutorName || 'Unknown Tutor',
              time: `${session.startTime || session.time || 'TBD'} - ${session.endTime || 'TBD'}`
            };
          } catch (error) {
            console.error('Error enriching session:', session.id, error);
            return {
              ...session,
              tutorEmail: '',
              tutorName: session.tutorName || 'Unknown Tutor',
              time: session.time || 'TBD'
            };
          }
        })
      );
      
      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
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
      
      // 🔔 Emit event để các components khác auto-refresh
      globalEvents.emit(EVENTS.SESSION_UPDATED, { sessionId: selectedSession.id, action: 'rescheduled' });
      toast.success('Session reschedule request sent!');
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
    if (!selectedSession) return;

    try {
      // Use the new cancel session API
      await api.cancelSession(selectedSession.id, userData.id);

      await loadSessions();
      setShowCancelDialog(false);
      
      // 🔔 Emit event để các components khác auto-refresh
      globalEvents.emit(EVENTS.SESSION_CANCELLED, { sessionId: selectedSession.id });
      toast.success('Session cancelled successfully');
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const handleRate = (session: any) => {
    setSelectedSession(session);
    setRating(0);
    setFeedback('');
    setShowRateDialog(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!selectedSession) return;

    try {
      // Create feedback record
      await api.createFeedback({
        sessionId: selectedSession.id,
        studentId: userData.id,
        studentName: userData.name,
        tutorId: selectedSession.tutorId,
        tutorName: selectedSession.tutorName,
        rating,
        feedback,
        subject: selectedSession.subject,
        date: new Date().toISOString().split('T')[0]
      });

      // Update session to mark as rated
      await api.updateSession(selectedSession.id, {
        rated: true,
        rating
      });

      // Notify tutor
      await api.createNotification({
        userId: selectedSession.tutorId,
        type: 'feedback_received',
        title: 'New Feedback Received',
        message: `${userData.name} rated your ${selectedSession.subject} session ${rating} stars`,
        relatedId: selectedSession.id
      });

      await loadSessions();
      setShowRateDialog(false);
      
      // 🔔 Emit events để Dashboard và Progress auto-refresh
      globalEvents.emit(EVENTS.SESSION_UPDATED, { sessionId: selectedSession.id, rating });
      globalEvents.emit(EVENTS.PROGRESS_UPDATED, { studentId: userData.id });
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleViewDetails = (session: any) => {
    setSelectedSession(session);
    setShowDetailDialog(true);
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
        <p className="text-muted-foreground">View and manage your tutoring sessions</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="mb-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingSessions.length})</TabsTrigger>
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
                  showActions 
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  onViewDetails={handleViewDetails}
                  getStatusColor={getStatusColor}
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
                <p className="text-muted-foreground">No pending sessions</p>
              </div>
            ) : (
              pendingSessions.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  showActions 
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  onViewDetails={handleViewDetails}
                  getStatusColor={getStatusColor}
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
                  showRating={!session.rated}
                  onRate={handleRate}
                  onViewDetails={handleViewDetails}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for your session
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
                  Request Reschedule
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
              Are you sure you want to cancel this session? This action cannot be undone and your tutor will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedSession && (
            <div className="bg-gray-50 rounded-lg p-3 my-4">
              <p className="text-foreground">{selectedSession.subject}</p>
              <p className="text-sm text-muted-foreground">
                {selectedSession.tutorName} • {selectedSession.date} at {selectedSession.time}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason for cancellation..."
              className="min-h-[80px]"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

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

      {/* Rate Session Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Session</DialogTitle>
            <DialogDescription>
              Share your feedback about this tutoring session
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-foreground">{selectedSession.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.tutorName} • {selectedSession.date}
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Overall Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="What did you think about this session?"
                  className="mt-1 min-h-[100px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={submitRating}
                  disabled={rating === 0}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">{selectedSession.subject}</h3>
                <Badge className={getStatusColor(selectedSession.status)}>
                  {selectedSession.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Tutor Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-foreground">{selectedSession.tutorName}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedSession.tutorId}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.tutorEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Session Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-foreground">{selectedSession.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="text-foreground">{selectedSession.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="text-foreground">{selectedSession.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground">{selectedSession.location}</p>
                  </div>
                </div>
              </div>

              {selectedSession.notes && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedSession.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailDialog(false)}
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

function SessionCard({ session, showActions, showRating, onReschedule, onCancel, onRate, onViewDetails, getStatusColor }: any) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-foreground">{session.subject}</h3>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{session.tutorName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(session)}>
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          {showActions && (
            <>
              <Button variant="outline" size="sm" onClick={() => onReschedule(session)}>
                <Edit className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onCancel(session)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
          {showRating && (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => onRate(session)}>
              <Star className="w-4 h-4 mr-1" />
              Rate Session
            </Button>
          )}
        </div>
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
