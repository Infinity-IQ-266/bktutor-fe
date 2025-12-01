import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import LogoGroup21 from '../imports/LogoGroup21';
import { toast } from 'sonner@2.0.3';

interface SignupPageProps {
  ssoEmail: string;
  ssoUser?: any; // SSO user data from authentication
  onComplete: (userData: any) => void;
  onCancel: () => void;
}

export default function SignupPage({ ssoEmail, ssoUser, onComplete, onCancel }: SignupPageProps) {
  const [role, setRole] = useState<'student' | 'tutor' | ''>('');
  const [step, setStep] = useState(1);
  
  // Common fields - pre-fill from SSO if available
  const [name, setName] = useState(ssoUser?.name || '');
  const [phone, setPhone] = useState(ssoUser?.phone || '');
  const [address, setAddress] = useState('');
  
  // Student-specific fields - pre-fill from SSO if available
  const [studentId, setStudentId] = useState(ssoUser?.studentId || '');
  const [department, setDepartment] = useState(ssoUser?.department || '');
  const [year, setYear] = useState('1');
  const [gpa, setGpa] = useState('');
  const [major, setMajor] = useState('');
  
  // Tutor-specific fields - pre-fill from SSO if available
  const [tutorId, setTutorId] = useState(ssoUser?.employeeId || '');
  const [position, setPosition] = useState('');
  const [education, setEducation] = useState('');
  const [office, setOffice] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');

  const handleRoleSelection = (selectedRole: 'student' | 'tutor') => {
    setRole(selectedRole);
    setStep(2);
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (exp: string) => {
    setExpertise(expertise.filter(e => e !== exp));
  };

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (role === 'student') {
      if (!department || !studentId.trim()) {
        toast.error('Please fill in all required student fields');
        return;
      }
      
      const userData = {
        email: ssoEmail,
        name: name.trim(),
        role: 'student',
        studentId: studentId.trim(),
        department,
        year: parseInt(year),
        gpa: parseFloat(gpa) || 0.0,
        major: major.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: '123456789' // Default password for SSO users
      };
      
      onComplete(userData);
    } else if (role === 'tutor') {
      if (!department || !position) {
        toast.error('Please fill in all required tutor fields');
        return;
      }
      
      const userData = {
        email: ssoEmail,
        name: name.trim(),
        role: 'tutor',
        tutorId: tutorId.trim(),
        department,
        position,
        education: education.trim(),
        office: office.trim(),
        bio: bio.trim(),
        expertise,
        phone: phone.trim(),
        address: address.trim(),
        password: '123456789' // Default password for SSO users
      };
      
      onComplete(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoGroup21 className="w-48" />
          </div>
          <h1 className="text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Welcome to BK TUTOR! Please complete your profile to get started.
          </p>
          <div className="mt-4 px-4 py-2 bg-blue-50 rounded-lg inline-block">
            <p className="text-sm text-blue-700">HCMUT Email: <strong>{ssoEmail}</strong></p>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-foreground mb-4 text-center">Select Your Role</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelection('student')}
                  className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all group"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-foreground mb-1">Student</h3>
                    <p className="text-sm text-muted-foreground">I'm looking for academic support</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('tutor')}
                  className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all group"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-foreground mb-1">Tutor</h3>
                    <p className="text-sm text-muted-foreground">I want to provide tutoring services</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Student Information Form */}
        {step === 2 && role === 'student' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="sticky top-0 bg-white pb-4 border-b border-border mb-4">
              <h2 className="text-foreground">Student Information</h2>
              <p className="text-sm text-muted-foreground">Please provide your details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Nguyen Van A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="student-id">Student ID *</Label>
                <Input
                  id="student-id"
                  placeholder="2011234"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 xxx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                    <SelectItem value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    <SelectItem value="Environmental Engineering">Environmental Engineering</SelectItem>
                    <SelectItem value="Industrial Engineering">Industrial Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  placeholder="e.g., Software Engineering"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="0.00"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="District, Ho Chi Minh City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 sticky bottom-0 bg-white border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleSubmit}>
                Complete Registration
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tutor Information Form */}
        {step === 2 && role === 'tutor' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="sticky top-0 bg-white pb-4 border-b border-border mb-4">
              <h2 className="text-foreground">Tutor Information</h2>
              <p className="text-sm text-muted-foreground">Please provide your details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Nguyen Minh A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tutor-id">Tutor/Employee ID</Label>
                <Input
                  id="tutor-id"
                  placeholder="T1001"
                  value={tutorId}
                  onChange={(e) => setTutorId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 xxx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                    <SelectItem value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    <SelectItem value="Environmental Engineering">Environmental Engineering</SelectItem>
                    <SelectItem value="Industrial Engineering">Industrial Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position">Position *</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                    <SelectItem value="Graduate Student">Graduate Student</SelectItem>
                    <SelectItem value="Senior Student">Senior Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="PhD in Computer Science"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="office">Office Location</Label>
                <Input
                  id="office"
                  placeholder="Building A1, Room 301"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="expertise"
                    placeholder="Enter an area of expertise"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addExpertise();
                      }
                    }}
                  />
                  <Button type="button" onClick={addExpertise}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {expertise.map((exp, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {exp}
                      <button
                        type="button"
                        onClick={() => removeExpertise(exp)}
                        className="ml-2 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief introduction about yourself and your teaching experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="District, Ho Chi Minh City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 sticky bottom-0 bg-white border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white" onClick={handleSubmit}>
                Complete Registration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
