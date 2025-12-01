import { Star, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import StatCard from '../StatCard';

export default function TutorFeedbackView() {
  const feedbackStats = {
    overallRating: 4.9,
    totalReviews: 89,
    '5star': 85,
    '4star': 3,
    '3star': 1,
    '2star': 0,
    '1star': 0,
  };

  const recentFeedback = [
    {
      id: 1,
      student: 'Anonymous',
      subject: 'Data Structures',
      rating: 5,
      date: 'Oct 30, 2025',
      comment: 'Excellent explanation of binary trees and graph algorithms. Dr. Nguyen is very patient and makes complex topics easy to understand. The practical examples really helped me grasp the concepts.',
      helpful: true,
    },
    {
      id: 2,
      student: 'Anonymous',
      subject: 'Algorithms',
      rating: 5,
      date: 'Oct 28, 2025',
      comment: 'Clear teaching style and well-prepared materials. Helped me understand sorting and searching algorithms much better. Would highly recommend!',
      helpful: true,
    },
    {
      id: 3,
      student: 'Anonymous',
      subject: 'Database Systems',
      rating: 5,
      date: 'Oct 25, 2025',
      comment: 'Great tutor! Very knowledgeable and approachable. The SQL practice sessions were especially valuable.',
      helpful: true,
    },
    {
      id: 4,
      student: 'Anonymous',
      subject: 'Data Structures',
      rating: 4,
      date: 'Oct 20, 2025',
      comment: 'Good session overall. Would appreciate more time for questions at the end.',
      helpful: true,
    },
    {
      id: 5,
      student: 'Anonymous',
      subject: 'Algorithms',
      rating: 5,
      date: 'Oct 18, 2025',
      comment: 'Exceptional tutor! Makes difficult topics accessible and engaging.',
      helpful: true,
    },
  ];

  const feedbackBySubject = [
    { subject: 'Data Structures', avgRating: 4.9, totalReviews: 35 },
    { subject: 'Algorithms', avgRating: 5.0, totalReviews: 28 },
    { subject: 'Database Systems', avgRating: 4.8, totalReviews: 26 },
  ];

  const getRatingPercentage = (count: number) => {
    return ((count / feedbackStats.totalReviews) * 100).toFixed(0);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Student Feedback</h1>
        <p className="text-muted-foreground">View ratings and comments from your students</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Star}
          label="Overall Rating"
          value={feedbackStats.overallRating.toString()}
          iconBgColor="bg-yellow-50"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Reviews"
          value={feedbackStats.totalReviews.toString()}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Award}
          label="5-Star Reviews"
          value={feedbackStats['5star'].toString()}
          iconBgColor="bg-green-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Rating Trend"
          value="+0.1"
          change="This month"
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="text-foreground mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = feedbackStats[`${stars}star` as keyof typeof feedbackStats] as number;
            const percentage = getRatingPercentage(count);
            return (
              <div key={stars} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-24">
                  <span className="text-sm text-muted-foreground">{stars}</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
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
              <div key={feedback.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < feedback.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{feedback.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feedback.subject} • {feedback.student}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-3">"{feedback.comment}"</p>
                {feedback.helpful && (
                  <div className="flex items-center gap-2">
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                      Marked as helpful
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-subject" className="mt-6">
          <div className="space-y-4">
            {feedbackBySubject.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground">{item.subject}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl text-foreground">{item.avgRating}</span>
                    <span className="text-sm text-muted-foreground">({item.totalReviews} reviews)</span>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(item.avgRating / 5) * 100}%` }}
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
