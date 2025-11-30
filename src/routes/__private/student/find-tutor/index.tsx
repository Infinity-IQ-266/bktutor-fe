import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookingService } from '@/services/booking';
import { TutorService } from '@/services/tutor';
import type { Tutor } from '@/types';
import { parseAvailability } from '@/utils';
import { createFileRoute } from '@tanstack/react-router';
import { Filter, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { TutorProfileModal } from './-components';

export const Route = createFileRoute('/__private/student/find-tutor/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState<Tutor>();
    const [showBooking, setShowBooking] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');

    // Booking form state
    const [availableSlotsOfSelectedTutor, setAvailableSlotsOfSelectedTutor] =
        useState<string[]>();
    const [availabilityOfSelectedTutor, setAvailabilityOfSelectedTutor] =
        useState<Record<string, string[]>>();
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [sessionType, setSessionType] = useState('');
    const [sessionNotes, setSessionNotes] = useState('');
    // const [sessionDate, setSessionDate] = useState('');

    useEffect(() => {
        loadTutors();
    }, []);

    // Debounced search effect with filters
    useEffect(() => {
        const timerId = setTimeout(() => {
            searchTutors();
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchQuery, departmentFilter]);

    const loadTutors = async () => {
        try {
            setLoading(true);
            const response = await TutorService.getTutors({
                direction: 'DESC',
            });
            const tutorData = response || [];

            setTutors(tutorData);
        } catch (error) {
            console.error('Error loading tutors:', error);
            toast.error('Failed to load tutors');
        } finally {
            setLoading(false);
        }
    };

    const searchTutors = async () => {
        try {
            setLoading(true);
            const params: {
                direction: 'DESC' | 'ASC';
                name?: string;
                department?: string;
            } = {
                direction: 'DESC',
            };

            // Add name filter if search query exists
            if (searchQuery.trim()) {
                params.name = searchQuery.trim();
            }

            // Add department filter if not 'all'
            if (departmentFilter !== 'all') {
                params.department = departmentFilter;
            }

            const response = await TutorService.getTutors(params);
            const tutorData = response || [];

            setTutors(tutorData);
        } catch (error) {
            console.error('Error searching tutors:', error);
            toast.error('Failed to search tutors');
        } finally {
            setLoading(false);
        }
    };

    const handleBookSession = async (tutor: Tutor) => {
        const response = await TutorService.getTutorAvailabilityByTutorId(
            tutor.id,
        );
        if (response) {
            const { availability, availableSlots } =
                parseAvailability(response);
            setAvailableSlotsOfSelectedTutor(availableSlots);
            setAvailabilityOfSelectedTutor(availability);
            setSelectedTutor(tutor);
            setSelectedSubject('');
            setSelectedTimeSlot('');
            setSessionType('');
            setSessionNotes('');
            //setSessionDate('');
            setShowBooking(true);
        }
    };

    const handleViewProfile = async (tutor: Tutor) => {
        const response = await TutorService.getTutorAvailabilityByTutorId(
            tutor.id,
        );
        if (response) {
            const { availability, availableSlots } =
                parseAvailability(response);
            setAvailableSlotsOfSelectedTutor(availableSlots);
            setAvailabilityOfSelectedTutor(availability);
            setSelectedTutor(tutor);
            setShowProfile(true);
        }
    };

    const confirmBooking = async () => {
        try {
            if (
                !selectedTutor ||
                !selectedSubject ||
                !selectedTimeSlot ||
                !sessionType
            ) {
                toast.error('Please fill in all required fields.');
                return;
            }

            // Match the selected time slot to an actual slot ID
            // Example: "Mon 2:00 PM-4:00 PM"
            const response = await TutorService.getTutorAvailabilityByTutorId(
                selectedTutor.id,
            );
            if (!response) {
                toast.error('Failed to fetch slot information.');
                return;
            }

            // Find the slot that matches selectedTimeSlot
            const matchingSlot = response.find((slot) => {
                const start = new Date(slot.startTime);
                const end = new Date(slot.endTime);

                const day = start
                    .toLocaleDateString('en-US', { weekday: 'short' })
                    .slice(0, 3);
                const formattedSlot = `${day} ${start.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                })}-${end.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                })}`;
                return formattedSlot === selectedTimeSlot;
            });

            if (!matchingSlot) {
                toast.error('Selected slot is no longer available.');
                return;
            }

            const createBookingPayload = {
                slotId: matchingSlot.id,
                subject: selectedSubject,
                type: sessionType === 'online' ? 'ONLINE' : 'IN_PERSON',
                locationOrLink:
                    sessionType === 'online'
                        ? 'Microsoft Teams'
                        : selectedTutor.officeLocation || 'On-campus',
                studentNotes: sessionNotes || undefined,
            };

            const bookingResponse =
                await BookingService.createBookingSession(createBookingPayload);

            if (bookingResponse) {
                toast.success(
                    `Booking request sent successfully to ${selectedTutor.fullName}.`,
                );
                setShowBooking(false);
                setSelectedSubject('');
                setSelectedTimeSlot('');
                setSessionType('');
                setSessionNotes('');
            } else {
                toast.error('Failed to create booking session.');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            toast.error(
                'An unexpected error occurred while confirming booking.',
            );
        }
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-medium text-foreground">
                    Find a Tutor
                </h1>
                <p className="text-muted-foreground">
                    Search and connect with expert tutors for your academic
                    needs
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 rounded-xl border border-border bg-white p-4">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                        <div>
                            <Label>Department</Label>
                            <Select
                                value={departmentFilter}
                                onValueChange={setDepartmentFilter}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All departments
                                    </SelectItem>
                                    <SelectItem value="Computer Science">
                                        Computer Science & Engineering
                                    </SelectItem>
                                    <SelectItem value="Mathematics">
                                        Mathematics
                                    </SelectItem>
                                    <SelectItem value="Physics">
                                        Physics
                                    </SelectItem>
                                    <SelectItem value="Mechanical">
                                        Mechanical Engineering
                                    </SelectItem>
                                    <SelectItem value="Electrical">
                                        Electrical Engineering
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Availability</Label>
                            <Select
                                value={availabilityFilter}
                                onValueChange={setAvailabilityFilter}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Any time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Any time
                                    </SelectItem>
                                    <SelectItem value="thisweek">
                                        This week
                                    </SelectItem>
                                    <SelectItem value="nextweek">
                                        Next week
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Rating</Label>
                            <Select
                                value={ratingFilter}
                                onValueChange={setRatingFilter}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All ratings" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All ratings
                                    </SelectItem>
                                    <SelectItem value="4.5">
                                        4.5+ stars
                                    </SelectItem>
                                    <SelectItem value="4.0">
                                        4.0+ stars
                                    </SelectItem>
                                    <SelectItem value="3.5">
                                        3.5+ stars
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results Info */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    {loading
                        ? 'Loading tutors...'
                        : `Found ${tutors.length} tutor${tutors.length !== 1 ? 's' : ''}`}
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>
            </div>

            {/* Tutors List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                            Loading tutors...
                        </p>
                    </div>
                ) : tutors.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                            No tutors found. Try adjusting your search or
                            filters.
                        </p>
                    </div>
                ) : (
                    tutors.map((tutor) => (
                        <div
                            key={tutor.id}
                            className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        <h3 className="text-foreground">
                                            {tutor.fullName}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            <span className="text-sm">
                                                {tutor.averageRating.toFixed(1)}
                                            </span>
                                            {/* <span className="text-sm text-muted-foreground">
                                                ({tutor.totalSessions} sessions)
                                            </span> */}
                                        </div>
                                    </div>

                                    <p className="mb-1 text-sm text-muted-foreground">
                                        {tutor.position || 'Tutor'} •{' '}
                                        {tutor.departmentName}
                                    </p>
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        ID: {tutor.staffId || tutor.id}
                                    </p>

                                    <p className="mb-3 text-sm text-foreground">
                                        {tutor.bio}
                                    </p>

                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {tutor.expertise
                                            ?.split(',')
                                            .map(
                                                (
                                                    skill: string,
                                                    idx: number,
                                                ) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                    >
                                                        {skill}
                                                    </Badge>
                                                ),
                                            )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        {/* TODO: Need this in the tutor's response
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>
                                                {tutor.availableSlots.length > 0
                                                    ? 'Available this week'
                                                    : 'Limited availability'}
                                            </span>
                                        </div> */}
                                        {/* <div className="flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {tutor.availableSlots.length}{' '}
                                                slots available
                                            </span>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        className="bg-primary text-white hover:bg-primary/90"
                                        onClick={() => handleBookSession(tutor)}
                                    >
                                        Book Session
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleViewProfile(tutor)}
                                    >
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
                            Request a tutoring session with{' '}
                            {selectedTutor?.fullName}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTutor && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-sm text-muted-foreground">
                                    Tutor
                                </p>
                                <p className="text-foreground">
                                    {selectedTutor.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedTutor.departmentName}
                                </p>
                            </div>

                            <div>
                                <Label>Select Subject *</Label>
                                <Select
                                    value={selectedSubject}
                                    onValueChange={setSelectedSubject}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedTutor.expertise
                                            ?.split(',')
                                            .map(
                                                (
                                                    subject: string,
                                                    idx: number,
                                                ) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={subject}
                                                    >
                                                        {subject}
                                                    </SelectItem>
                                                ),
                                            )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* //TODO: This component will be correct later
                            <div>
                                <Label>Session Date *</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={sessionDate}
                                    onChange={(e) =>
                                        setSessionDate(e.target.value)
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div> */}

                            <div>
                                <Label>Select Time Slot *</Label>
                                <Select
                                    value={selectedTimeSlot}
                                    onValueChange={setSelectedTimeSlot}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choose a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlotsOfSelectedTutor &&
                                            availableSlotsOfSelectedTutor.map(
                                                (slot: string, idx: number) => (
                                                    <SelectItem
                                                        key={idx}
                                                        value={slot}
                                                    >
                                                        {slot}
                                                    </SelectItem>
                                                ),
                                            )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Session Type *</Label>
                                <Select
                                    value={sessionType}
                                    onValueChange={setSessionType}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select session type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in-person">
                                            In-person
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Online (MS Teams)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="request-notes">
                                    Additional Notes (Optional)
                                </Label>
                                <Textarea
                                    id="request-notes"
                                    placeholder="Describe what you'd like to learn or any specific topics..."
                                    className="mt-1 min-h-[80px]"
                                    value={sessionNotes}
                                    onChange={(e) =>
                                        setSessionNotes(e.target.value)
                                    }
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
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
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
            {selectedTutor && (
                <TutorProfileModal
                    handleBookSession={handleBookSession}
                    isShowingProfile={showProfile}
                    setShowProfile={setShowProfile}
                    selectedTutor={selectedTutor}
                    availableSlots={availableSlotsOfSelectedTutor}
                    availability={availabilityOfSelectedTutor}
                />
            )}
        </div>
    );
}
