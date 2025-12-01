import { Save, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface StudentProfileViewProps {
  userData?: any;
}

export default function StudentProfileView({ userData }: StudentProfileViewProps) {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Student Profile</h1>
        <p className="text-muted-foreground">Manage your profile and academic support preferences</p>
      </div>

      <div className="max-w-3xl">
        {/* Personal Information - Synced from DATACORE */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-foreground">Personal Information</h3>
            <span className="text-xs text-muted-foreground">(Synced from HCMUT_DATACORE)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                defaultValue={userData?.name || "Student Name"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="studentid">Student ID</Label>
              <Input
                id="studentid"
                defaultValue={userData?.studentId || "N/A"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={userData?.email || "student@hcmut.edu.vn"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Input
                id="faculty"
                defaultValue={userData?.department || "Computer Science & Engineering"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="year">Year of Study</Label>
              <Input
                id="year"
                defaultValue={userData?.year ? `Year ${userData.year}` : "Year 1"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                defaultValue={userData?.major || "Computer Science"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Editable Information */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="text-foreground mb-4">Academic Support Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Contact Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+84 xxx xxx xxx"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="subjects">Subjects Need Support</Label>
              <Input
                id="subjects"
                placeholder="e.g., Data Structures, Calculus II, Algorithms"
                defaultValue="Data Structures, Calculus II"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="goals">Learning Goals</Label>
              <Textarea
                id="goals"
                placeholder="What do you hope to achieve through the tutoring program?"
                className="mt-1 min-h-[100px]"
                defaultValue="Improve understanding of data structures and algorithms. Prepare for upcoming exams in Calculus II."
              />
            </div>
            
            <div>
              <Label htmlFor="preferences">Session Preferences</Label>
              <Textarea
                id="preferences"
                placeholder="Preferred meeting times, learning style, etc."
                className="mt-1 min-h-[80px]"
                defaultValue="Prefer afternoon sessions. Learn best with visual aids and practical examples."
              />
            </div>
          </div>
        </div>

        {/* Program Status */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="text-foreground mb-4">Program Status</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
              <p className="text-foreground">September 15, 2025</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Program Status</p>
              <p className="text-green-600">Active</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-foreground">15 sessions</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Tutors</p>
              <p className="text-foreground">2 tutors</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
