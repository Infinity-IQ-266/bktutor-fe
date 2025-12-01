import { Save, Lock, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

interface TutorProfileViewProps {
  userData?: any;
}

export default function TutorProfileView({ userData }: TutorProfileViewProps) {
  const expertise = ['Data Structures', 'Algorithms', 'Database Systems', 'Software Engineering'];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Tutor Profile</h1>
        <p className="text-muted-foreground">Manage your profile and expertise information</p>
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
                defaultValue={userData?.name || "Tutor Name"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="employeeid">Employee ID</Label>
              <Input
                id="employeeid"
                defaultValue={userData?.tutorId || "N/A"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={userData?.email || "tutor@hcmut.edu.vn"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                defaultValue={userData?.department || "Computer Science & Engineering"}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                defaultValue="Associate Professor"
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="degree">Highest Degree</Label>
              <Input
                id="degree"
                defaultValue="PhD in Computer Science"
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="text-foreground mb-4">Professional Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <div className="mt-2 flex flex-wrap gap-2 mb-2">
                {expertise.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {item}
                    <button className="ml-2 hover:text-red-600">×</button>
                  </Badge>
                ))}
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
                defaultValue="PhD in Computer Science with over 10 years of teaching and research experience. Specialized in algorithms, data structures, and software engineering. Passionate about helping students understand complex computer science concepts through practical examples and hands-on learning."
              />
            </div>
            
            <div>
              <Label htmlFor="research">Research Interests</Label>
              <Textarea
                id="research"
                placeholder="Your research areas and interests..."
                className="mt-1 min-h-[80px]"
                defaultValue="Algorithms and data structures, distributed systems, machine learning applications in software engineering."
              />
            </div>
            
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
              <Label htmlFor="office">Office Location</Label>
              <Input
                id="office"
                placeholder="e.g., Building A1, Room 301"
                defaultValue="Building A1, Room 301"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Teaching Preferences */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="text-foreground mb-4">Teaching Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-types">Preferred Session Types</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">In-person sessions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">Online sessions (Zoom/Meet)</span>
                </label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="max-students">Maximum Students Per Week</Label>
              <Input
                id="max-students"
                type="number"
                defaultValue="15"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="teaching-approach">Teaching Approach</Label>
              <Textarea
                id="teaching-approach"
                placeholder="Describe your teaching methodology..."
                className="mt-1 min-h-[80px]"
                defaultValue="I focus on practical, hands-on learning with real-world examples. I encourage students to ask questions and work through problems together. Each session is tailored to the student's individual needs and learning pace."
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-foreground">Teaching Statistics</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl text-foreground">89</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Students</p>
              <p className="text-2xl text-foreground">12</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
              <p className="text-2xl text-foreground">4.9 ⭐</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Students Helped</p>
              <p className="text-2xl text-foreground">45</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Years Active</p>
              <p className="text-2xl text-foreground">3</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
              <p className="text-2xl text-foreground">98%</p>
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
