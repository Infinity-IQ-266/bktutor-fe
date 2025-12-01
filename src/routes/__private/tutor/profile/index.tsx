import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { createFileRoute } from '@tanstack/react-router';
import {
    Award,
    Book,
    Calendar,
    Clock,
    type LucideIcon,
    Mail,
    MapPin,
    Phone,
    Save,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__private/tutor/profile/')({
    component: RouteComponent,
});

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    iconBgColor: string;
}

// Mock data - Replace with actual API calls
const mockProfile = {
    personal: {
        fullName: 'Dr. Nguyen Thanh Tuan',
        email: 'nguyen.tuan@hcmut.edu.vn',
        phone: '+84 123 456 789',
        faculty: 'Computer Science',
        department: 'Software Engineering',
        office: 'B4-404',
        workingHours: 'Monday - Friday, 8:00 AM - 5:00 PM',
    },
    professional: {
        title: 'Associate Professor',
        experience: '15 years',
        education: 'PhD in Computer Science - Stanford University',
        specialization: ['Data Structures', 'Algorithms', 'Database Systems'],
        achievements: [
            'Best Teaching Award 2023',
            'Published 20+ research papers',
            'Supervised 50+ graduate students',
        ],
    },
    teaching: {
        subjects: [
            { id: 1, name: 'Data Structures', rate: 300000 },
            { id: 2, name: 'Algorithms', rate: 300000 },
            { id: 3, name: 'Database Systems', rate: 250000 },
        ],
        teachingStyle: 'Interactive and hands-on with practical examples',
        languages: ['Vietnamese', 'English'],
        preferredSessionLength: '2 hours',
        maxStudentsPerSession: 1,
    },
    statistics: {
        totalSessions: 234,
        totalStudents: 89,
        averageRating: 4.9,
        totalReviews: 89,
        responseTime: '< 1 hour',
        completionRate: '98%',
    },
};

function RouteComponent() {
    const [profile, setProfile] = useState(mockProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);

    const handleSave = () => {
        // TODO: Call API to update profile
        console.log('Saving profile:', editedProfile);
        setProfile(editedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const StatCard = ({
        icon: Icon,
        label,
        value,
        iconBgColor,
    }: StatCardProps) => (
        <div className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${iconBgColor}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-foreground">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-foreground">My Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your professional information and preferences
                    </p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {/* Statistics Grid */}
            <div className="mb-8 grid grid-cols-3 gap-6">
                <StatCard
                    icon={Calendar}
                    label="Total Sessions"
                    value={profile.statistics.totalSessions}
                    iconBgColor="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={User}
                    label="Total Students"
                    value={profile.statistics.totalStudents}
                    iconBgColor="bg-green-50 text-green-600"
                />
                <StatCard
                    icon={Star}
                    label="Average Rating"
                    value={profile.statistics.averageRating}
                    iconBgColor="bg-yellow-50 text-yellow-600"
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal">
                <TabsList>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="teaching">
                        Teaching Preferences
                    </TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="mt-6">
                    <div className="rounded-xl border border-border bg-white p-6">
                        <h3 className="mb-6 text-foreground">
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Full Name
                                    </p>
                                    <p className="text-foreground">
                                        {profile.personal.fullName}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Synced from DATACORE (Cannot edit)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="text-foreground">
                                        {profile.personal.email}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Synced from DATACORE (Cannot edit)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Phone Number
                                    </p>
                                    {isEditing ? (
                                        <Input
                                            value={editedProfile.personal.phone}
                                            onChange={(e) =>
                                                setEditedProfile({
                                                    ...editedProfile,
                                                    personal: {
                                                        ...editedProfile.personal,
                                                        phone: e.target.value,
                                                    },
                                                })
                                            }
                                            className="mt-2"
                                        />
                                    ) : (
                                        <p className="text-foreground">
                                            {profile.personal.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Office Location
                                    </p>
                                    {isEditing ? (
                                        <Input
                                            value={
                                                editedProfile.personal.office
                                            }
                                            onChange={(e) =>
                                                setEditedProfile({
                                                    ...editedProfile,
                                                    personal: {
                                                        ...editedProfile.personal,
                                                        office: e.target.value,
                                                    },
                                                })
                                            }
                                            className="mt-2"
                                        />
                                    ) : (
                                        <p className="text-foreground">
                                            {profile.personal.office}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        Working Hours
                                    </p>
                                    <p className="text-foreground">
                                        {profile.personal.workingHours}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="mt-6">
                    <div className="rounded-xl border border-border bg-white p-6">
                        <h3 className="mb-6 text-foreground">
                            Professional Information
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Title
                                </label>
                                <p className="text-foreground">
                                    {profile.professional.title}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Education
                                </label>
                                <p className="text-foreground">
                                    {profile.professional.education}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Experience
                                </label>
                                <p className="text-foreground">
                                    {profile.professional.experience}
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Specialization
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.professional.specialization.map(
                                        (spec, idx) => (
                                            <Badge
                                                key={idx}
                                                className="bg-[#0F2D52] text-white"
                                            >
                                                {spec}
                                            </Badge>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-muted-foreground">
                                    Achievements
                                </label>
                                <ul className="space-y-2">
                                    {profile.professional.achievements.map(
                                        (achievement, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2"
                                            >
                                                <Award className="mt-0.5 h-4 w-4 text-yellow-600" />
                                                <span className="text-foreground">
                                                    {achievement}
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Teaching Preferences Tab */}
                <TabsContent value="teaching" className="mt-6">
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-white p-6">
                            <h3 className="mb-6 text-foreground">
                                Subjects & Rates
                            </h3>
                            <div className="space-y-4">
                                {profile.teaching.subjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Book className="h-5 w-5 text-[#0F2D52]" />
                                            <span className="text-foreground">
                                                {subject.name}
                                            </span>
                                        </div>
                                        <Badge className="bg-green-50 text-green-700">
                                            {subject.rate.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            VND / session
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-white p-6">
                            <h3 className="mb-6 text-foreground">
                                Teaching Preferences
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm text-muted-foreground">
                                        Teaching Style
                                    </label>
                                    {isEditing ? (
                                        <Textarea
                                            value={
                                                editedProfile.teaching
                                                    .teachingStyle
                                            }
                                            onChange={(e) =>
                                                setEditedProfile({
                                                    ...editedProfile,
                                                    teaching: {
                                                        ...editedProfile.teaching,
                                                        teachingStyle:
                                                            e.target.value,
                                                    },
                                                })
                                            }
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-foreground">
                                            {profile.teaching.teachingStyle}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-muted-foreground">
                                        Languages
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.teaching.languages.map(
                                            (lang, idx) => (
                                                <Badge
                                                    key={idx}
                                                    className="bg-blue-50 text-blue-700"
                                                >
                                                    {lang}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-muted-foreground">
                                        Preferred Session Length
                                    </label>
                                    <p className="text-foreground">
                                        {
                                            profile.teaching
                                                .preferredSessionLength
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-muted-foreground">
                                        Max Students Per Session
                                    </label>
                                    <p className="text-foreground">
                                        {profile.teaching.maxStudentsPerSession}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                        <StatCard
                            icon={Calendar}
                            label="Total Sessions"
                            value={profile.statistics.totalSessions}
                            iconBgColor="bg-blue-50 text-blue-600"
                        />
                        <StatCard
                            icon={User}
                            label="Total Students"
                            value={profile.statistics.totalStudents}
                            iconBgColor="bg-green-50 text-green-600"
                        />
                        <StatCard
                            icon={Star}
                            label="Average Rating"
                            value={profile.statistics.averageRating}
                            iconBgColor="bg-yellow-50 text-yellow-600"
                        />
                        <StatCard
                            icon={Award}
                            label="Total Reviews"
                            value={profile.statistics.totalReviews}
                            iconBgColor="bg-purple-50 text-purple-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Response Time"
                            value={profile.statistics.responseTime}
                            iconBgColor="bg-orange-50 text-orange-600"
                        />
                        <StatCard
                            icon={Award}
                            label="Completion Rate"
                            value={profile.statistics.completionRate}
                            iconBgColor="bg-teal-50 text-teal-600"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
