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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TutorService } from '@/services/tutor';
import { createFileRoute } from '@tanstack/react-router';
import { Calendar, FileText, Search, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { PastStudent, Student } from './-types';

interface StudentApiResponse {
    id: number;
    fullName?: string;
    studentId?: string;
    email?: string;
    phone?: string;
    departmentName?: string;
    faculty?: string;
    academicYear?: number;
    subjects?: string[];
    totalSessions?: number;
    lastSession?: string;
    progress?: string;
    status?: string;
    notes?: Array<{ date: string; note: string }>;
}

export const Route = createFileRoute('/__private/tutor/my-students/')({
    component: RouteComponent,
});

// Mock data - Replace with actual API calls
const mockActiveStudents: Student[] = [
    {
        id: 1,
        name: 'Tran Minh B',
        studentId: '2011234',
        email: 'tran.minhb@hcmut.edu.vn',
        phone: '+84 901 234 567',
        faculty: 'Computer Science & Engineering',
        year: 'Year 3',
        subjects: ['Data Structures', 'Algorithms'],
        totalSessions: 8,
        attendanceRate: '100%',
        lastSession: 'Oct 30, 2025',
        progress:
            'Good understanding of data structures. Ready for advanced topics.',
        status: 'Active',
        notes: [
            {
                date: 'Oct 30, 2025',
                note: 'Covered binary search trees. Excellent progress.',
            },
            {
                date: 'Oct 25, 2025',
                note: 'Started AVL trees and rotations.',
            },
        ],
    },
    {
        id: 2,
        name: 'Nguyen Van C',
        studentId: '2011567',
        email: 'nguyen.vanc@hcmut.edu.vn',
        phone: '+84 902 345 678',
        faculty: 'Computer Science & Engineering',
        year: 'Year 3',
        subjects: ['Algorithms'],
        totalSessions: 5,
        attendanceRate: '100%',
        lastSession: 'Oct 28, 2025',
        progress: 'Making steady progress in sorting and searching algorithms.',
        status: 'Active',
        notes: [
            {
                date: 'Oct 28, 2025',
                note: 'Working on quicksort and merge sort.',
            },
        ],
    },
    {
        id: 3,
        name: 'Le Thi D',
        studentId: '2012345',
        email: 'le.thid@hcmut.edu.vn',
        phone: '+84 903 456 789',
        faculty: 'Computer Science & Engineering',
        year: 'Year 2',
        subjects: ['Database Systems'],
        totalSessions: 3,
        attendanceRate: '100%',
        lastSession: 'Oct 25, 2025',
        progress: 'Needs more practice with SQL queries and normalization.',
        status: 'Active',
        notes: [
            {
                date: 'Oct 25, 2025',
                note: 'Covered ER diagrams and basic normalization.',
            },
        ],
    },
];

const mockPastStudents: PastStudent[] = [
    {
        id: 4,
        name: 'Pham Van E',
        studentId: '2010123',
        email: 'pham.vane@hcmut.edu.vn',
        phone: '+84 904 567 890',
        faculty: 'Computer Science & Engineering',
        year: 'Year 4',
        subjects: ['Data Structures'],
        totalSessions: 12,
        completedDate: 'Sep 15, 2025',
        finalNote: 'Successfully completed course. Excellent progress.',
    },
];

function RouteComponent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStudents, setActiveStudents] = useState<Student[]>([]);
    const [pastStudents] = useState<PastStudent[]>(mockPastStudents);
    const [loading, setLoading] = useState(true);
    const [page] = useState(0);
    const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showStudentDetailDialog, setShowStudentDetailDialog] =
        useState(false);
    const [selectedStudent, setSelectedStudent] = useState<
        Student | PastStudent | null
    >(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(),
    );

    const loadStudents = useCallback(async () => {
        try {
            setLoading(true);
            const response = await TutorService.getMyStudents({
                page,
                size: 50,
            });

            if (response?.data) {
                // Map API response to Student type
                const students: Student[] = response.data.map(
                    (student: StudentApiResponse) => ({
                        id: student.id,
                        name: student.fullName || 'Unknown',
                        studentId:
                            student.studentId || student.id?.toString() || '',
                        email: student.email || '',
                        phone: student.phone || '',
                        faculty:
                            student.departmentName || student.faculty || '',
                        year: student.academicYear?.toString() || '',
                        subjects: student.subjects || [],
                        totalSessions: student.totalSessions || 0,
                        attendanceRate: '100%', // TODO: Add to API if available
                        lastSession: student.lastSession || 'N/A',
                        progress: student.progress || '',
                        status: student.status || 'Active',
                        notes: student.notes || [],
                    }),
                );
                setActiveStudents(students);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            // Fallback to mock data on error
            setActiveStudents(mockActiveStudents);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const filteredActiveStudents = activeStudents.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentId.includes(searchQuery) ||
            student.subjects.some((subject) =>
                subject.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
    );

    const handleAddNote = (student: Student) => {
        setSelectedStudent(student);
        setShowAddNoteDialog(true);
    };

    const handleSchedule = (student: Student | PastStudent) => {
        setSelectedStudent(student);
        setShowScheduleDialog(true);
    };

    const handleViewStudent = (student: Student | PastStudent) => {
        setSelectedStudent(student);
        setShowStudentDetailDialog(true);
    };

    const StudentCard = ({
        student,
        isPast = false,
    }: {
        student: Student | PastStudent;
        isPast?: boolean;
    }) => (
        <div className="rounded-xl border border-border bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                        <button
                            onClick={() => handleViewStudent(student)}
                            className="flex items-center gap-2 transition-colors hover:text-primary"
                        >
                            <h3 className="text-foreground">{student.name}</h3>
                            <User className="h-4 w-4" />
                        </button>
                        <Badge variant="secondary">
                            ID: {student.studentId}
                        </Badge>
                        {!isPast && 'status' in student ? (
                            <Badge className="bg-green-100 text-green-700">
                                {student.status}
                            </Badge>
                        ) : (
                            <Badge className="bg-gray-100 text-gray-700">
                                Completed
                            </Badge>
                        )}
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                        {student.faculty}
                    </p>

                    <div className="mb-3 flex flex-wrap gap-2">
                        {student.subjects.map(
                            (subject: string, idx: number) => (
                                <Badge key={idx} variant="outline">
                                    {subject}
                                </Badge>
                            ),
                        )}
                    </div>
                </div>

                {!isPast && 'notes' in student && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddNote(student)}
                        >
                            <FileText className="mr-1 h-4 w-4" />
                            Add Note
                        </Button>
                        <Button
                            size="sm"
                            className="bg-primary text-white hover:bg-primary/90"
                            onClick={() => handleSchedule(student)}
                        >
                            <Calendar className="mr-1 h-4 w-4" />
                            Schedule
                        </Button>
                    </div>
                )}
            </div>

            <div
                className={`mb-4 grid gap-6 border-b border-border pb-4 ${isPast ? `grid-cols-2` : `grid-cols-3`}`}
            >
                <div>
                    <p className="mb-1 text-sm text-muted-foreground">
                        Total Sessions
                    </p>
                    <p className="text-xl text-foreground">
                        {student.totalSessions}
                    </p>
                </div>
                {!isPast && 'attendanceRate' in student ? (
                    <>
                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Attendance Rate
                            </p>
                            <p className="text-xl text-foreground">
                                {student.attendanceRate}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Last Session
                            </p>
                            <p className="text-xl text-foreground">
                                {student.lastSession}
                            </p>
                        </div>
                    </>
                ) : (
                    'completedDate' in student && (
                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Completed
                            </p>
                            <p className="text-xl text-foreground">
                                {student.completedDate}
                            </p>
                        </div>
                    )
                )}
            </div>

            <div>
                {!isPast && 'progress' in student ? (
                    <>
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <p className="text-sm text-foreground">
                                Latest Progress Note
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            "{student.progress}"
                        </p>
                    </>
                ) : (
                    'finalNote' in student && (
                        <>
                            <p className="mb-2 text-sm text-foreground">
                                Final Note
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                                "{student.finalNote}"
                            </p>
                        </>
                    )
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">My Students</h1>
                <p className="text-muted-foreground">
                    View and manage students you're currently tutoring
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 rounded-xl border border-border bg-white p-4">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search students by name, ID, or subject..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">
                        Active Students ({activeStudents.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Past Students ({pastStudents.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                    {loading ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Loading students...
                            </p>
                        </div>
                    ) : filteredActiveStudents.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No active students found
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredActiveStudents.map((student) => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                    <div className="space-y-4">
                        {pastStudents.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                isPast
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Note Dialog */}
            <Dialog
                open={showAddNoteDialog}
                onOpenChange={setShowAddNoteDialog}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Progress Note</DialogTitle>
                        <DialogDescription>
                            Record student progress and observations
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Student
                                </p>
                                <p className="mb-3 text-foreground">
                                    {selectedStudent.name} (ID:{' '}
                                    {selectedStudent.studentId})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudent.subjects.map(
                                        (subject: string, idx: number) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                            >
                                                {subject}
                                            </Badge>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="note-type">Note Type</Label>
                                <Select>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select note type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="progress">
                                            Progress Update
                                        </SelectItem>
                                        <SelectItem value="concern">
                                            Concern
                                        </SelectItem>
                                        <SelectItem value="achievement">
                                            Achievement
                                        </SelectItem>
                                        <SelectItem value="general">
                                            General Note
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="subject">
                                    Related Subject (Optional)
                                </Label>
                                <Select>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedStudent.subjects.map(
                                            (subject: string, idx: number) => (
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

                            <div>
                                <Label htmlFor="progress-note">
                                    Progress Note *
                                </Label>
                                <Textarea
                                    id="progress-note"
                                    placeholder="Describe the student's progress, challenges, achievements, or any observations..."
                                    className="mt-1 min-h-[150px]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="recommendations">
                                    Recommendations (Optional)
                                </Label>
                                <Textarea
                                    id="recommendations"
                                    placeholder="Suggest next steps, practice problems, or areas to focus on..."
                                    className="mt-1 min-h-[100px]"
                                />
                            </div>

                            {'notes' in selectedStudent &&
                                selectedStudent.notes &&
                                selectedStudent.notes.length > 0 && (
                                    <div>
                                        <Label className="mb-2 block">
                                            Previous Notes
                                        </Label>
                                        <div className="max-h-[200px] space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-4">
                                            {selectedStudent.notes.map(
                                                (note, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="border-b border-border pb-3 last:border-0"
                                                    >
                                                        <p className="mb-1 text-xs text-muted-foreground">
                                                            {note.date}
                                                        </p>
                                                        <p className="text-sm text-foreground">
                                                            {note.note}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowAddNoteDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    onClick={() => setShowAddNoteDialog(false)}
                                >
                                    Save Note
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Schedule Session Dialog */}
            <Dialog
                open={showScheduleDialog}
                onOpenChange={setShowScheduleDialog}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Schedule Session</DialogTitle>
                        <DialogDescription>
                            Create a new tutoring session with{' '}
                            {selectedStudent?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-sm text-muted-foreground">
                                    Student
                                </p>
                                <p className="text-foreground">
                                    {selectedStudent.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    ID: {selectedStudent.studentId}
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="session-subject">
                                    Subject *
                                </Label>
                                <Select>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedStudent.subjects.map(
                                            (subject: string, idx: number) => (
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

                            <div>
                                <Label htmlFor="session-date">Date *</Label>
                                <Input
                                    id="session-date"
                                    type="date"
                                    className="mt-1"
                                    value={
                                        selectedDate
                                            ? selectedDate
                                                  .toISOString()
                                                  .split('T')[0]
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setSelectedDate(
                                            e.target.value
                                                ? new Date(e.target.value)
                                                : undefined,
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="session-time">
                                    Time Slot *
                                </Label>
                                <Select>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8-9">
                                            8:00 AM - 9:00 AM
                                        </SelectItem>
                                        <SelectItem value="9-10">
                                            9:00 AM - 10:00 AM
                                        </SelectItem>
                                        <SelectItem value="10-11">
                                            10:00 AM - 11:00 AM
                                        </SelectItem>
                                        <SelectItem value="11-12">
                                            11:00 AM - 12:00 PM
                                        </SelectItem>
                                        <SelectItem value="14-15">
                                            2:00 PM - 3:00 PM
                                        </SelectItem>
                                        <SelectItem value="15-16">
                                            3:00 PM - 4:00 PM
                                        </SelectItem>
                                        <SelectItem value="16-17">
                                            4:00 PM - 5:00 PM
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="session-type">
                                    Session Type *
                                </Label>
                                <Select>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in-person">
                                            In-person
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Online (Zoom/Teams)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="session-notes">
                                    Session Notes (Optional)
                                </Label>
                                <Textarea
                                    id="session-notes"
                                    placeholder="Add any preparation notes or topics to cover..."
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowScheduleDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    onClick={() => setShowScheduleDialog(false)}
                                >
                                    Schedule Session
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Student Details Dialog */}
            <Dialog
                open={showStudentDetailDialog}
                onOpenChange={setShowStudentDetailDialog}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="mb-3 text-foreground">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Full Name
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Student ID
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.studentId}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Phone
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div>
                                <h3 className="mb-3 text-foreground">
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Faculty
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.faculty}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Year
                                        </p>
                                        <p className="text-foreground">
                                            {selectedStudent.year}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div>
                                <h3 className="mb-3 text-foreground">
                                    Subjects
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudent.subjects.map(
                                        (subject: string, idx: number) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="text-sm"
                                            >
                                                {subject}
                                            </Badge>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* Session Statistics */}
                            <div>
                                <h3 className="mb-3 text-foreground">
                                    Session Statistics
                                </h3>
                                <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                                    <div>
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            Total Sessions
                                        </p>
                                        <p className="text-2xl text-foreground">
                                            {selectedStudent.totalSessions}
                                        </p>
                                    </div>
                                    {'attendanceRate' in selectedStudent && (
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                Attendance Rate
                                            </p>
                                            <p className="text-2xl text-foreground">
                                                {selectedStudent.attendanceRate}
                                            </p>
                                        </div>
                                    )}
                                    {'lastSession' in selectedStudent && (
                                        <div>
                                            <p className="mb-1 text-sm text-muted-foreground">
                                                Last Session
                                            </p>
                                            <p className="text-foreground">
                                                {selectedStudent.lastSession}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Notes */}
                            {'notes' in selectedStudent &&
                                selectedStudent.notes &&
                                selectedStudent.notes.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 text-foreground">
                                            Progress History
                                        </h3>
                                        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                            {selectedStudent.notes.map(
                                                (note, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="border-b border-border pb-4 last:border-0"
                                                    >
                                                        <p className="mb-1 text-sm text-muted-foreground">
                                                            {note.date}
                                                        </p>
                                                        <p className="text-foreground">
                                                            {note.note}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() =>
                                        setShowStudentDetailDialog(false)
                                    }
                                >
                                    Close
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    onClick={() => {
                                        setShowStudentDetailDialog(false);
                                        handleSchedule(selectedStudent);
                                    }}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Session
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
