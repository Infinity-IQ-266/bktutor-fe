import { Award, BookOpen, Calendar, CheckCircle, Clock, Filter, Mail, MapPin, Phone, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import TutorAvailabilityTimetable from '../TutorAvailabilityTimetable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface FindTutorViewProps {
  userData?: any;
}

export default function FindTutorView({ userData }: FindTutorViewProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Booking form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDate, setSessionDate] = useState('');

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [searchQuery, departmentFilter, availabilityFilter, ratingFilter, tutors]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers({ role: 'tutor' });
      const tutorData = response.users || [];
      
      // Enrich tutor data with REAL calculated data from database
      const enrichedTutors = await Promise.all(tutorData.map(async (tutor: any) => {
        // Get real sessions for this tutor to calculate rating and stats
        const sessionsResult = await api.getSessions({ tutorId: tutor.id });
        const sessions = sessionsResult.sessions || [];
        
        const completedSessions = sessions.filter((s: any) => s.status === 'completed');
        const totalSessions = completedSessions.length;
        
        // Calculate real average rating from completed sessions
        const ratings = completedSessions.filter((s: any) => s.rating).map((s: any) => s.rating);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
          : 4.5; // Default if no ratings yet
        
        // Count unique students
        const uniqueStudents = new Set(sessions.map((s: any) => s.studentId));
        const activeStudents = uniqueStudents.size;
        
        // 🔥 Get tutor's LATEST availability from their profile
        // This ensures students see real-time updated availability
        const latestTutorData = await api.getUserByEmail(tutor.email);
        const tutorAvailability = latestTutorData.user?.availability || {};
        
        // Generate available slots from tutor's REAL availability schedule
        const availableSlots = generateTimeSlotsFromSchedule(tutorAvailability);
        
        return {
          ...tutor,
          availability: tutorAvailability, // Store the full schedule object
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          totalSessions: totalSessions,
          activeStudents: activeStudents,
          availableSlots: availableSlots, // Store the formatted slots array
          bio: tutor.bio || `Experienced educator specializing in ${tutor.expertise?.join(', ') || 'various subjects'}. Committed to helping students achieve their academic goals.`,
        };
      }));
      
      setTutors(enrichedTutors);
      setFilteredTutors(enrichedTutors);
      console.log('✅ Loaded tutors with latest availability schedules');
    } catch (error) {
      console.error('Error loading tutors:', error);
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlotsFromSchedule = (schedule: Record<string, string[]>) => {
    const slots: string[] = [];
    const dayAbbr: Record<string, string> = {
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat',
      Sunday: 'Sun'
    };
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // Process each day's slots and group consecutive ones
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    dayOrder.forEach(day => {
      const timeSlots = schedule[day] || [];
      if (timeSlots.length === 0) return;
      
      // Sort slots by start time
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const aStart = parseTime(a.split('-')[0]);
        const bStart = parseTime(b.split('-')[0]);
        return aStart - bStart;
      });
      
      // Group consecutive hourly slots
      let currentGroup: { start: string; end: string } | null = null;
      
      sortedSlots.forEach((slot, index) => {
        const [start, end] = slot.split('-');
        
        if (!currentGroup) {
          currentGroup = { start, end };
        } else {
          // Check if this slot is consecutive to the current group
          if (currentGroup.end === start) {
            // Extend the current group
            currentGroup.end = end;
          } else {
            // Save current group and start new one
            slots.push(`${dayAbbr[day]} ${formatTime(currentGroup.start)}-${formatTime(currentGroup.end)}`);
            currentGroup = { start, end };
          }
        }
        
        // If this is the last slot, save the current group
        if (index === sortedSlots.length - 1 && currentGroup) {
          slots.push(`${dayAbbr[day]} ${formatTime(currentGroup.start)}-${formatTime(currentGroup.end)}`);
        }
      });
    });
    
    return slots;
  };

  const filterTutors = () => {
    let filtered = [...tutors];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutor => 
        tutor.name?.toLowerCase().includes(query) ||
        tutor.department?.toLowerCase().includes(query) ||
        tutor.expertise?.some((exp: string) => exp?.toLowerCase().includes(query))
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.department?.toLowerCase()?.includes(departmentFilter.toLowerCase())
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'thisweek' || availabilityFilter === 'nextweek') {
        // Filter tutors who have at least some availability
        filtered = filtered.filter(tutor => tutor.availableSlots && tutor.availableSlots.length > 0);
      }
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(tutor => tutor.rating >= minRating);
    }

    setFilteredTutors(filtered);
  };

  const handleBookSession = (tutor: any) => {
    setSelectedTutor(tutor);
    setSelectedSubject('');
    setSelectedTimeSlot('');
    setSessionType('');
    setSessionNotes('');
    setSessionDate('');
    setShowBooking(true);
  };

  const handleViewProfile = (tutor: any) => {
    setSelectedTutor(tutor);
    setShowProfile(true);
  };

  const confirmBooking = async () => {
    if (!selectedSubject || !selectedTimeSlot || !sessionType || !sessionDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!userData || !selectedTutor) {
      toast.error('Invalid booking request');
      return;
    }

    try {
      // Create session request
      const sessionData = {
        studentId: userData.id,
        studentName: userData.name,
        tutorId: selectedTutor.id,
        tutorName: selectedTutor.name,
        subject: selectedSubject,
        date: sessionDate,
        time: selectedTimeSlot,
        type: sessionType,
        location: sessionType === 'in-person' ? selectedTutor.office : 'Online (MS Teams)',
        notes: sessionNotes,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      await api.createSession(sessionData);

      // Create notification for tutor
      await api.createNotification({
        userId: selectedTutor.id,
        type: 'session_request',
        title: 'New Session Request',
        message: `${userData.name} has requested a ${selectedSubject} session on ${sessionDate} at ${selectedTimeSlot}`,
        relatedId: sessionData.studentId + '-' + Date.now(),
        actionRequired: true,
        actionType: 'accept_decline'
      });

      setShowBooking(false);
      setSelectedTutor(null);
      toast.success('Session request sent successfully! The tutor will be notified.');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to send session request');
    }
  };

  useEffect(() => {
    console.log(selectedTutor)
    console.log('tutorrrrrrrrrr selectttttttt')
  })

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Find a Tutor</h1>
        <p className="text-muted-foreground">Search and connect with expert tutors for your academic needs</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by subject, expertise, or tutor name (e.g., Nguyen Minh A)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science & Engineering</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                  <SelectItem value="Electrical">Electrical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Availability</Label>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="thisweek">This week</SelectItem>
                  <SelectItem value="nextweek">Next week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rating</Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Info */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading tutors...' : `Found ${filteredTutors.length} tutor${filteredTutors.length !== 1 ? 's' : ''}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Tutors List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading tutors...</p>
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tutors found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredTutors.map((tutor) => (
            <div key={tutor.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-foreground">{tutor.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{tutor.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({tutor.totalSessions} sessions)</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">{tutor.position || 'Tutor'} • {tutor.department}</p>
                  <p className="text-sm text-muted-foreground mb-1">ID: {tutor.tutorId || tutor.id}</p>
                  
                  <p className="text-sm text-foreground mb-3">{tutor.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tutor.expertise?.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{tutor.availableSlots.length > 0 ? 'Available this week' : 'Limited availability'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{tutor.availableSlots.length} slots available</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleBookSession(tutor)}
                  >
                    Book Session
                  </Button>
                  <Button variant="outline" onClick={() => handleViewProfile(tutor)}>
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
            <DialogDescription>
              Request a tutoring session with {selectedTutor?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Tutor</p>
                <p className="text-foreground">{selectedTutor.name}</p>
                <p className="text-sm text-muted-foreground">{selectedTutor.department}</p>
              </div>
              
              <div>
                <Label>Select Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTutor.expertise?.map((subject: string, idx: number) => (
                      <SelectItem key={idx} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Session Date *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label>Select Time Slot *</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTutor.availableSlots.map((slot: string, idx: number) => (
                      <SelectItem key={idx} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Session Type *</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="online">Online (MS Teams)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="request-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="request-notes"
                  placeholder="Describe what you'd like to learn or any specific topics..."
                  className="mt-1 min-h-[80px]"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBooking(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={confirmBooking}
                >
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tutor Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor Profile</DialogTitle>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="text-foreground mb-1">{selectedTutor.name}</h2>
                  <p className="text-muted-foreground mb-2">{selectedTutor.position || 'Tutor'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-foreground">{selectedTutor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{selectedTutor.totalSessions} sessions</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{selectedTutor.activeStudents} active students</span>
                  </div>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    setShowProfile(false);
                    handleBookSession(selectedTutor);
                  }}
                >
                  Book Session
                </Button>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-foreground mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground text-sm">{selectedTutor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground text-sm">{selectedTutor.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Office</p>
                      <p className="text-foreground text-sm">{selectedTutor.office || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-foreground text-sm">{selectedTutor.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-foreground mb-3">About</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-foreground">{selectedTutor.bio}</p>
                </div>
              </div>

              {/* Education */}
              {selectedTutor.education && (
                <div>
                  <h3 className="text-foreground mb-3">Education</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Award className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-foreground">{selectedTutor.education}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expertise */}
              <div>
                <h3 className="text-foreground mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTutor.expertise?.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability - VISUAL TIMETABLE */}
              <div>
                <h3 className="text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Weekly Availability Schedule
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-foreground font-medium">
                      {selectedTutor.availableSlots.length > 0 ? 'Available this week' : 'Limited availability'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTutor.availableSlots.length} time slots available for booking
                  </p>
                </div>
                
                {/* Interactive Timetable showing tutor's REAL availability */}
                {selectedTutor.availability && typeof selectedTutor.availability === 'object' && Object.keys(selectedTutor.availability).length > 0 && (
                  <TutorAvailabilityTimetable 
                    schedule={selectedTutor.availability}
                    compact={true}
                  />
                )}
                
                {/* Quick slots list */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Available slots this week:</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {selectedTutor.availableSlots.slice(0, 20).map((slot: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {slot}
                      </Badge>
                    ))}
                    {selectedTutor.availableSlots.length > 20 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedTutor.availableSlots.length - 20} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowProfile(false)}
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
