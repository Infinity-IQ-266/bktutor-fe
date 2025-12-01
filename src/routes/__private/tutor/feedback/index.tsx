import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import {
    Award,
    type LucideIcon,
    MessageSquare,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__private/tutor/feedback/')({
    component: RouteComponent,
});

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    change?: string;
    iconBgColor: string;
}

// Mock data - Replace with actual API calls
const mockFeedbackStats = {
    overallRating: 4.9,
    totalReviews: 89,
    '5star': 85,
    '4star': 3,
    '3star': 1,
    '2star': 0,
    '1star': 0,
};

const mockRecentFeedback = [
    {
        id: 1,
        student: 'Anonymous',
        subject: 'Data Structures',
        rating: 5,
        date: 'Oct 30, 2025',
        comment:
            'Excellent explanation of binary trees and graph algorithms. Dr. Nguyen is very patient and makes complex topics easy to understand. The practical examples really helped me grasp the concepts.',
        helpful: true,
    },
    {
        id: 2,
        student: 'Anonymous',
        subject: 'Algorithms',
        rating: 5,
        date: 'Oct 28, 2025',
        comment:
            'Clear teaching style and well-prepared materials. Helped me understand sorting and searching algorithms much better. Would highly recommend!',
        helpful: true,
    },
    {
        id: 3,
        student: 'Anonymous',
        subject: 'Database Systems',
        rating: 5,
        date: 'Oct 25, 2025',
        comment:
            'Great tutor! Very knowledgeable and approachable. The SQL practice sessions were especially valuable.',
        helpful: true,
    },
    {
        id: 4,
        student: 'Anonymous',
        subject: 'Data Structures',
        rating: 4,
        date: 'Oct 20, 2025',
        comment:
            'Good session overall. Would appreciate more time for questions at the end.',
        helpful: true,
    },
    {
        id: 5,
        student: 'Anonymous',
        subject: 'Algorithms',
        rating: 5,
        date: 'Oct 18, 2025',
        comment:
            'Exceptional tutor! Makes difficult topics accessible and engaging.',
        helpful: true,
    },
];

const mockFeedbackBySubject = [
    { subject: 'Data Structures', avgRating: 4.9, totalReviews: 35 },
    { subject: 'Algorithms', avgRating: 5.0, totalReviews: 28 },
    { subject: 'Database Systems', avgRating: 4.8, totalReviews: 26 },
];

function RouteComponent() {
    const [feedbackStats] = useState(mockFeedbackStats);
    const [recentFeedback] = useState(mockRecentFeedback);
    const [feedbackBySubject] = useState(mockFeedbackBySubject);

    const getRatingPercentage = (count: number) => {
        return ((count / feedbackStats.totalReviews) * 100).toFixed(0);
    };

    const StatCard = ({
        icon: Icon,
        label,
        value,
        change,
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
                    {change && (
                        <p className="text-xs text-muted-foreground">
                            {change}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Student Feedback</h1>
                <p className="text-muted-foreground">
                    View ratings and comments from your students
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-4 gap-6">
                <StatCard
                    icon={Star}
                    label="Overall Rating"
                    value={feedbackStats.overallRating.toString()}
                    iconBgColor="bg-yellow-50 text-yellow-600"
                />
                <StatCard
                    icon={MessageSquare}
                    label="Total Reviews"
                    value={feedbackStats.totalReviews.toString()}
                    iconBgColor="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={Award}
                    label="5-Star Reviews"
                    value={feedbackStats['5star'].toString()}
                    iconBgColor="bg-green-50 text-green-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Rating Trend"
                    value="+0.1"
                    change="This month"
                    iconBgColor="bg-purple-50 text-purple-600"
                />
            </div>

            {/* Rating Distribution */}
            <div className="mb-6 rounded-xl border border-border bg-white p-6">
                <h3 className="mb-4 text-foreground">Rating Distribution</h3>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = feedbackStats[
                            `${stars}star` as keyof typeof feedbackStats
                        ] as number;
                        const percentage = getRatingPercentage(count);
                        return (
                            <div
                                key={stars}
                                className="flex items-center gap-4"
                            >
                                <div className="flex w-24 items-center gap-1">
                                    <span className="text-sm text-muted-foreground">
                                        {stars}
                                    </span>
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                </div>
                                <div className="h-2 flex-1 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-yellow-500 transition-all"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-sm text-muted-foreground">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All Feedback</TabsTrigger>
                    <TabsTrigger value="by-subject">By Subject</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="space-y-4">
                        {recentFeedback.map((feedback) => (
                            <div
                                key={feedback.id}
                                className="rounded-xl border border-border bg-white p-6"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-5 w-5 ${
                                                            i < feedback.rating
                                                                ? 'fill-yellow-500 text-yellow-500'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {feedback.date}
                                            </span>
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {feedback.subject} •{' '}
                                            {feedback.student}
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-3 text-foreground">
                                    "{feedback.comment}"
                                </p>
                                {feedback.helpful && (
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-50 text-green-700">
                                            Marked as helpful
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="by-subject" className="mt-6">
                    <div className="space-y-4">
                        {feedbackBySubject.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border bg-white p-6"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-foreground">
                                        {item.subject}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                        <span className="text-xl text-foreground">
                                            {item.avgRating}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({item.totalReviews} reviews)
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-[#0F2D52]"
                                        style={{
                                            width: `${(item.avgRating / 5) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
