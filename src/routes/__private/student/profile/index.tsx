import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/stores';
import { createFileRoute } from '@tanstack/react-router';
import { Lock, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/student/profile/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { user } = useUserStore();

    // TODO: Replace with actual API integration for updating profile
    const [phone, setPhone] = useState('');
    const [subjects, setSubjects] = useState('Data Structures, Calculus II');
    const [goals, setGoals] = useState(
        'Improve understanding of data structures and algorithms. Prepare for upcoming exams in Calculus II.',
    );
    const [preferences, setPreferences] = useState(
        'Prefer afternoon sessions. Learn best with visual aids and practical examples.',
    );

    const handleSave = () => {
        // TODO: Implement API call to save profile changes
        toast.success('Profile updated successfully');
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Student Profile</h1>
                <p className="text-muted-foreground">
                    Manage your profile and academic support preferences
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
                            (Synced from HCMUT System)
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                defaultValue={user?.fullName || 'Student Name'}
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>

                        <div>
                            <Label htmlFor="studentid">Student ID</Label>
                            <Input
                                id="studentid"
                                defaultValue={
                                    (user?.role === 'STUDENT' &&
                                        user?.studentId) ||
                                    'N/A'
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
                                    user?.email || 'student@hcmut.edu.vn'
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
                                    user?.role === 'STUDENT'
                                        ? user.departmentName
                                        : 'Computer Science & Engineering'
                                }
                                disabled
                                className="mt-1 bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Editable Information */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-4 text-foreground">
                        Academic Support Preferences
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone">
                                Contact Phone (Optional)
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+84 xxx xxx xxx"
                                className="mt-1"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="subjects">
                                Subjects Need Support
                            </Label>
                            <Input
                                id="subjects"
                                placeholder="e.g., Data Structures, Calculus II, Algorithms"
                                className="mt-1"
                                value={subjects}
                                onChange={(e) => setSubjects(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="goals">Learning Goals</Label>
                            <Textarea
                                id="goals"
                                placeholder="What do you hope to achieve through the tutoring program?"
                                className="mt-1 min-h-[100px]"
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="preferences">
                                Session Preferences
                            </Label>
                            <Textarea
                                id="preferences"
                                placeholder="Preferred meeting times, learning style, etc."
                                className="mt-1 min-h-[80px]"
                                value={preferences}
                                onChange={(e) => setPreferences(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Program Status */}
                <div className="mb-6 rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-4 text-foreground">Program Status</h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Registration Date
                            </p>
                            <p className="text-foreground">
                                September 15, 2025
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Program Status
                            </p>
                            <p className="text-green-600">Active</p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                                Role
                            </p>
                            <p className="text-foreground capitalize">
                                {user?.role || 'Student'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        className="bg-primary text-white hover:bg-primary/90"
                        onClick={handleSave}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
