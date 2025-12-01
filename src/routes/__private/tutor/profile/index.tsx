import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TutorService } from '@/services/tutor';
import type { TutorDashboardDto } from '@/services/tutor';
import { useUserStore } from '@/stores';
import { createFileRoute } from '@tanstack/react-router';
import { Award, Lock, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/__private/tutor/profile/')({
    component: RouteComponent,
});

// Mock data - Replace with actual API calls
const mockProfile = {
    name: 'Tutor Name',
    tutorId: 'N/A',
    email: 'tutor@hcmut.edu.vn',
    department: 'Computer Science & Engineering',
    position: 'Associate Professor',
    degree: 'PhD in Computer Science',
    expertise: [
        'Data Structures',
        'Algorithms',
        'Database Systems',
        'Software Engineering',
    ],
    bio: 'PhD in Computer Science with over 10 years of teaching and research experience. Specialized in algorithms, data structures, and software engineering. Passionate about helping students understand complex computer science concepts through practical examples and hands-on learning.',
    research:
        'Algorithms and data structures, distributed systems, machine learning applications in software engineering.',
    phone: '',
    office: 'Building A1, Room 301',
    sessionTypes: {
        inPerson: true,
        online: true,
    },
    maxStudentsPerWeek: 15,
    teachingApproach:
        "I focus on practical, hands-on learning with real-world examples. I encourage students to ask questions and work through problems together. Each session is tailored to the student's individual needs and learning pace.",
    statistics: {
        totalSessions: 89,
        activeStudents: 12,
        averageRating: 4.9,
        totalStudentsHelped: 45,
        yearsActive: 3,
        completionRate: '98%',
    },
};

function RouteComponent() {
    const { user: userData } = useUserStore();
    const expertise = mockProfile.expertise;

    // Dashboard data state
    const [dashboardData, setDashboardData] =
        useState<TutorDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);

    // Use real user data if available, fallback to mock data
    const isTutor = userData?.role === 'TUTOR';
    const tutorData = isTutor ? userData : null;

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await TutorService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Tutor Profile</h1>
                <p className="text-muted-foreground">
                    Manage your profile and expertise information
                </p>
            </div>

            <div className="max-w-3xl">
                {/* Personal Information - Synced from DATACORE */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-foreground">
                            Personal Information
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            (Synced from HCMUT_DATACORE)
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                defaultValue={
                                    tutorData?.fullName || mockProfile.name
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="employeeid">Employee ID</Label>
                            <Input
                                id="employeeid"
                                defaultValue={
                                    tutorData?.staffId || mockProfile.tutorId
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">University Email</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={
                                    tutorData?.email || mockProfile.email
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                defaultValue={
                                    tutorData?.departmentName ||
                                    mockProfile.department
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                defaultValue={
                                    tutorData?.position || mockProfile.position
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="degree">Highest Degree</Label>
                            <Input
                                id="degree"
                                defaultValue={
                                    tutorData?.degree || mockProfile.degree
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-4 text-foreground">
                        Professional Information
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="expertise">
                                Areas of Expertise
                            </Label>
                            <div className="mt-2 mb-2 flex flex-wrap gap-2">
                                {(tutorData?.subjects || expertise).map(
                                    (item, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-sm"
                                        >
                                            {item}
                                            <button className="ml-2 hover:text-red-600">
                                                ×
                                            </button>
                                        </Badge>
                                    ),
                                )}
                            </div>
                            <Input
                                id="expertise"
                                placeholder="Add new expertise area (press Enter)"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Write a brief professional bio..."
                                className="mt-1 min-h-[120px]"
                                defaultValue={tutorData?.bio || mockProfile.bio}
                            />
                        </div>

                        <div>
                            <Label htmlFor="research">Research Interests</Label>
                            <Textarea
                                id="research"
                                placeholder="Your research areas and interests..."
                                className="mt-1 min-h-[80px]"
                                defaultValue={
                                    tutorData?.expertise || mockProfile.research
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">
                                Contact Phone (Optional)
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+84 xxx xxx xxx"
                                className="mt-1"
                                defaultValue={
                                    tutorData?.phone || mockProfile.phone
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="office">Office Location</Label>
                            <Input
                                id="office"
                                placeholder="e.g., Building A1, Room 301"
                                defaultValue={
                                    tutorData?.officeLocation ||
                                    mockProfile.office
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Teaching Preferences */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-4 text-foreground">
                        Teaching Preferences
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="session-types">
                                Preferred Session Types
                            </Label>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        defaultChecked={
                                            mockProfile.sessionTypes.inPerson
                                        }
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">
                                        In-person sessions
                                    </span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        defaultChecked={
                                            mockProfile.sessionTypes.online
                                        }
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">
                                        Online sessions (Zoom/Meet)
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="max-students">
                                Maximum Students Per Week
                            </Label>
                            <Input
                                id="max-students"
                                type="number"
                                defaultValue={mockProfile.maxStudentsPerWeek}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="teaching-approach">
                                Teaching Approach
                            </Label>
                            <Textarea
                                id="teaching-approach"
                                placeholder="Describe your teaching methodology..."
                                className="mt-1 min-h-[80px]"
                                defaultValue={mockProfile.teachingApproach}
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="text-foreground">Teaching Statistics</h3>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                Loading statistics...
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Today's Sessions
                                </p>
                                <p className="text-2xl text-foreground">
                                    {dashboardData?.todaySessionsCount ??
                                        mockProfile.statistics.totalSessions}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Active Students
                                </p>
                                <p className="text-2xl text-foreground">
                                    {dashboardData?.activeStudentsCount ??
                                        mockProfile.statistics.activeStudents}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Average Rating
                                </p>
                                <p className="text-2xl text-foreground">
                                    {(
                                        dashboardData?.averageRating ??
                                        mockProfile.statistics.averageRating
                                    ).toFixed(1)}{' '}
                                    ⭐
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Pending Requests
                                </p>
                                <p className="text-2xl text-foreground">
                                    {dashboardData?.pendingRequestsCount ?? 0}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Upcoming Sessions
                                </p>
                                <p className="text-2xl text-foreground">
                                    {dashboardData?.upcomingSessions.length ??
                                        0}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">
                                    Recent Reviews
                                </p>
                                <p className="text-2xl text-foreground">
                                    {dashboardData?.recentFeedback.length ?? 0}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
