import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__private/student/progress/')({
    component: RouteComponent,
});

// TODO: Replace with actual API integration
const mockProgressData = [
    {
        id: 1,
        subject: 'Data Structures',
        tutor: 'Dr. Nguyen Van A',
        tutorId: 1,
        totalSessions: 12,
        completedSessions: 10,
        attendance: 83,
        lastSession: 'Nov 25, 2025',
        improvementScore: 85,
        averageRating: 4.5,
        progress: [
            {
                date: 'Nov 25',
                note: 'Excellent understanding of Binary Search Trees',
                rating: 5,
            },
            {
                date: 'Nov 18',
                note: 'Good progress on Graph algorithms',
                rating: 4,
            },
            {
                date: 'Nov 11',
                note: 'Completed Hash Table implementation',
                rating: 4,
            },
        ],
    },
    {
        id: 2,
        subject: 'Calculus II',
        tutor: 'Prof. Tran Thi B',
        tutorId: 2,
        totalSessions: 8,
        completedSessions: 7,
        attendance: 88,
        lastSession: 'Nov 23, 2025',
        improvementScore: 75,
        averageRating: 4.8,
        progress: [
            {
                date: 'Nov 23',
                note: 'Strong grasp of Integration techniques',
                rating: 5,
            },
            {
                date: 'Nov 16',
                note: 'Improved problem-solving speed',
                rating: 5,
            },
            {
                date: 'Nov 9',
                note: 'Working on Series convergence',
                rating: 4,
            },
        ],
    },
];

function RouteComponent() {
    const [progressData] = useState(mockProgressData);
    const [loading] = useState(false);

    // Calculate overall stats
    const totalSessions = progressData.reduce(
        (sum, p) => sum + p.completedSessions,
        0,
    );
    const totalScheduled = progressData.reduce(
        (sum, p) => sum + p.totalSessions,
        0,
    );
    const overallAttendance =
        totalScheduled > 0
            ? Math.round((totalSessions / totalScheduled) * 100)
            : 0;
    const activeSubjects = progressData.length;

    if (loading) {
        return (
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-foreground">Learning Progress</h1>
                    <p className="text-muted-foreground">
                        Loading your progress data...
                    </p>
                </div>
            </div>
        );
    }

    if (progressData.length === 0) {
        return (
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-foreground">Learning Progress</h1>
                    <p className="text-muted-foreground">
                        Track your academic progress and tutor feedback
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-12 text-center">
                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-foreground">
                        No Progress Data Yet
                    </h3>
                    <p className="text-muted-foreground">
                        Complete tutoring sessions to see your learning progress
                        here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Learning Progress</h1>
                <p className="text-muted-foreground">
                    Track your academic progress and tutor feedback
                </p>
            </div>

            {/* Overall Stats */}
            <div className="mb-8 grid grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl text-foreground">
                                {totalSessions}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Completed Sessions
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-3">
                            <Star className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl text-foreground">
                                {overallAttendance}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Attendance Rate
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-3">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl text-foreground">
                                {activeSubjects}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Active Subjects
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress by Subject */}
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All Subjects</TabsTrigger>
                    {progressData.map((item, idx) => (
                        <TabsTrigger key={item.id} value={`subject-${idx}`}>
                            {item.subject}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="space-y-6">
                        {progressData.map((item) => (
                            <SubjectProgressCard key={item.id} data={item} />
                        ))}
                    </div>
                </TabsContent>

                {progressData.map((item, idx) => (
                    <TabsContent
                        key={item.id}
                        value={`subject-${idx}`}
                        className="mt-6"
                    >
                        <SubjectProgressCard data={item} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

interface SubjectProgressCardProps {
    data: {
        subject: string;
        tutor: string;
        totalSessions: number;
        completedSessions: number;
        attendance: number;
        improvementScore: number;
        averageRating: number;
        lastSession: string;
        progress: Array<{
            date: string;
            note: string;
            rating?: number;
        }>;
    };
}

function SubjectProgressCard({ data }: SubjectProgressCardProps) {
    const improvementValue = Math.min(data.improvementScore, 100);

    return (
        <div className="rounded-xl border border-border bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h3 className="mb-1 text-foreground">{data.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                        {data.tutor}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-2xl text-foreground">
                        {data.completedSessions}/{data.totalSessions}
                    </p>
                </div>
            </div>

            {/* Progress Metrics Grid */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                {/* Attendance Rate */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Attendance
                        </p>
                        <p className="text-sm text-foreground">
                            {data.attendance}%
                        </p>
                    </div>
                    <Progress value={data.attendance} className="h-2" />
                </div>

                {/* Improvement Score */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Improvement
                        </p>
                        <p className="text-sm text-foreground">
                            {data.improvementScore}%
                        </p>
                    </div>
                    <Progress value={improvementValue} className="h-2" />
                </div>

                {/* Average Rating */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Avg. Rating
                        </p>
                        <p className="text-sm text-foreground">
                            {data.averageRating}/5
                        </p>
                    </div>
                    <Progress
                        value={(data.averageRating / 5) * 100}
                        className="h-2"
                    />
                </div>
            </div>

            {/* Recent Progress Notes */}
            <div>
                <h4 className="mb-3 text-sm text-muted-foreground">
                    Recent Feedback
                </h4>
                <div className="space-y-3">
                    {data.progress.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 rounded-lg border border-border p-3"
                        >
                            <div className="rounded bg-blue-50 p-2">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {item.date}
                                    </p>
                                    {item.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm text-foreground">
                                                {item.rating}/5
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-foreground">
                                    {item.note}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
