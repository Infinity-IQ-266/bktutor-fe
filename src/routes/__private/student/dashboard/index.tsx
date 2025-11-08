import { Badge } from '@/components/ui/badge';
import { StudentService } from '@/services/student';
import { useUserStore } from '@/stores';
import type { Progress, Session } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
    BookOpen,
    Calendar,
    Clock,
    Laptop,
    MapPin,
    Star,
    TrendingUp,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { StatCard } from './-components';

export const Route = createFileRoute('/__private/student/dashboard/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { user: userData } = useUserStore();
    const [stats, setStats] = useState({
        upcomingSessions: 0,
        totalSessions: 0,
        currentTutors: 0,
        attendanceRate: '0%',
    });
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        const dashboardData = await StudentService.getDashboard();
        if (dashboardData) {
            setUpcomingSessions(dashboardData.upcomingSessions);
            setRecentProgress(dashboardData.recentProgress);
            setStats({
                upcomingSessions: dashboardData.upcomingSessionsCount,
                attendanceRate: `${dashboardData.attendanceRate}%`,
                currentTutors: dashboardData.currentTutorsCount,
                totalSessions: dashboardData.totalSessionsCount,
            });
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-foreground">
                        Welcome, {userData?.fullName || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">
                    Welcome, {userData?.fullName || 'Student'}!
                </h1>
                <p className="text-muted-foreground">
                    Here's your academic support overview
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-4 gap-6">
                <StatCard
                    icon={Calendar}
                    label="Upcoming Sessions"
                    value={stats.upcomingSessions.toString()}
                    iconBgColor="bg-blue-50"
                />
                <StatCard
                    icon={BookOpen}
                    label="Completed Sessions"
                    value={stats.totalSessions.toString()}
                    iconBgColor="bg-green-50"
                />
                <StatCard
                    icon={User}
                    label="Current Tutors"
                    value={stats.currentTutors.toString()}
                    iconBgColor="bg-purple-50"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Attendance Rate"
                    value={stats.attendanceRate}
                    iconBgColor="bg-orange-50"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <div className="rounded-xl border border-border bg-white">
                    <div className="inline-flex w-full items-center border-b border-border p-6">
                        <h2 className="text-foreground">Upcoming Sessions</h2>
                        {upcomingSessions.length > 0 && (
                            <span className="ms-auto hover:cursor-pointer hover:underline">
                                View all
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        {upcomingSessions.length === 0 ? (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No upcoming sessions
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Book a session to get started
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-primary"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-foreground">
                                                    {session.subject}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.tutorName}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    session.status,
                                                )}
                                            >
                                                {session.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {dayjs(
                                                    session.startTime,
                                                ).format('DD-MM-YYYY')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {dayjs(
                                                    session.startTime,
                                                ).format('HH:mm:ss')}{' '}
                                                -{' '}
                                                {dayjs(session.endTime).format(
                                                    'HH:mm:ss',
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            <div className="inline-flex items-center gap-1">
                                                {session.type === 'ONLINE' ? (
                                                    <>
                                                        <Laptop size={16} />
                                                        <a
                                                            className="hover:cursor-pointer hover:underline"
                                                            href={
                                                                session.locationOrLink
                                                            }
                                                            target="_blank"
                                                        >
                                                            {
                                                                session.locationOrLink
                                                            }
                                                        </a>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin size={16} />
                                                        {session.locationOrLink}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Progress */}
                <div className="rounded-xl border border-border bg-white">
                    <div className="inline-flex w-full border-b border-border p-6">
                        <h2 className="text-foreground">Recent Progress</h2>
                        {recentProgress.length > 0 && (
                            <span className="ms-auto hover:cursor-pointer hover:underline">
                                View all
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        {recentProgress.length === 0 ? (
                            <div className="py-8 text-center">
                                <TrendingUp className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No progress data yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Complete sessions to track your progress
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentProgress.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-foreground">
                                                    {item.subject}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.tutor}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    Sessions
                                                </p>
                                                <p className="text-lg text-foreground">
                                                    {item.sessionsCompleted}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            Last session: {item.lastSessionDate}
                                        </p>
                                        <p className="text-sm text-foreground italic">
                                            "{item.progressNote}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                    <BookOpen className="mb-3 h-8 w-8 text-blue-600" />
                    <h3 className="mb-1 text-foreground">Find a Tutor</h3>
                    <p className="text-sm text-muted-foreground">
                        Browse available tutors and book sessions
                    </p>
                </div>
                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                    <Star className="mb-3 h-8 w-8 text-green-600" />
                    <h3 className="mb-1 text-foreground">View Materials</h3>
                    <p className="text-sm text-muted-foreground">
                        Access learning resources from your tutors
                    </p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                    <TrendingUp className="mb-3 h-8 w-8 text-purple-600" />
                    <h3 className="mb-1 text-foreground">Track Progress</h3>
                    <p className="text-sm text-muted-foreground">
                        Monitor your learning journey and feedback
                    </p>
                </div>
            </div>
        </div>
    );
}
