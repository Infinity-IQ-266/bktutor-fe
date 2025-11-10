import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Tutor } from '@/types';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    Star,
} from 'lucide-react';

import { TutorAvailabilityTimetable } from './tutor-availability-time-table';

type TutorProfileModalProps = {
    selectedTutor: Tutor;
    isShowingProfile: boolean;
    setShowProfile: (isShowingProfile: boolean) => void;
    handleBookSession: (tutor: Tutor) => void;
    availableSlots?: string[];
    availability?: Record<string, string[]>;
};

export const TutorProfileModal = ({
    selectedTutor,
    isShowingProfile,
    setShowProfile,
    handleBookSession,
    availableSlots,
    availability,
}: TutorProfileModalProps) => {
    return (
        <Dialog open={isShowingProfile} onOpenChange={setShowProfile}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tutor Profile</DialogTitle>
                </DialogHeader>

                {selectedTutor && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-border pb-4">
                            <div>
                                <h2 className="mb-1 text-foreground">
                                    {selectedTutor.fullName}
                                </h2>
                                <p className="mb-2 text-muted-foreground">
                                    {selectedTutor.position || 'Tutor'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                        <span className="text-foreground">
                                            {selectedTutor.averageRating.toFixed(
                                                1,
                                            )}
                                        </span>
                                    </div>
                                    {/* <span className="text-muted-foreground">
                                            •
                                        </span>
                                        <span className="text-muted-foreground">
                                            {selectedTutor.totalSessions}{' '}
                                            sessions
                                        </span>
                                        <span className="text-muted-foreground">
                                            •
                                        </span>
                                        <span className="text-muted-foreground">
                                            {selectedTutor.activeStudents}{' '}
                                            active students
                                        </span> */}
                                </div>
                            </div>
                            <Button
                                className="bg-primary text-white hover:bg-primary/90"
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
                            <h3 className="mb-3 text-foreground">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {selectedTutor.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Phone
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {selectedTutor.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Office
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {selectedTutor.officeLocation ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Department
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {selectedTutor.departmentName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div>
                            <h3 className="mb-3 text-foreground">About</h3>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-foreground">
                                    {selectedTutor.bio}
                                </p>
                            </div>
                        </div>

                        {/* Education */}
                        {selectedTutor.degree && (
                            <div>
                                <h3 className="mb-3 text-foreground">
                                    Education
                                </h3>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-start gap-2">
                                        <Award className="mt-0.5 h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-foreground">
                                                {selectedTutor.degree}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Expertise */}
                        <div>
                            <h3 className="mb-3 text-foreground">
                                Areas of Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedTutor.expertise
                                    ?.split(',')
                                    .map((skill: string, idx: number) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-sm"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                            </div>
                        </div>

                        {/* Availability - VISUAL TIMETABLE */}
                        <div>
                            <h3 className="mb-3 flex items-center gap-2 text-foreground">
                                <Clock className="h-5 w-5 text-primary" />
                                Weekly Availability Schedule
                            </h3>
                            {availableSlots && (
                                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-foreground">
                                            {availableSlots.length > 0
                                                ? 'Available this week'
                                                : 'Limited availability'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {availableSlots.length} time slots
                                        available for booking
                                    </p>
                                </div>
                            )}

                            {/* Interactive Timetable showing tutor's REAL availability */}
                            {availability &&
                                typeof availability === 'object' &&
                                Object.keys(availability).length > 0 && (
                                    <TutorAvailabilityTimetable
                                        schedule={availability}
                                        compact={true}
                                    />
                                )}

                            {/* Quick slots list */}
                            <div className="mt-4">
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Available slots this week:
                                </p>
                                {availableSlots && (
                                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                                        {availableSlots
                                            .slice(0, 20)
                                            .map(
                                                (slot: string, idx: number) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        <Calendar className="mr-1 h-3 w-3" />
                                                        {slot}
                                                    </Badge>
                                                ),
                                            )}
                                        {availableSlots.length > 20 && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                +{availableSlots.length - 20}{' '}
                                                more
                                            </Badge>
                                        )}
                                    </div>
                                )}
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
    );
};
