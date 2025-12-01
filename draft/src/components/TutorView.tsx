import { Plus, Search, Filter, Star, Mail, Phone, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function TutorView() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state for adding tutor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tutorId: '',
    department: '',
    position: '',
    expertise: [] as string[],
    bio: '',
    phone: '',
    address: '',
    office: '',
    education: ''
  });
  
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    loadTutors();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadTutors, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTutors = async () => {
    try {
      const response = await api.getUsers({ role: 'tutor' });
      const tutorsData = response.users || [];
      
      // Enrich with session count
      const enriched = await Promise.all(
        tutorsData.map(async (tutor: any) => {
          const sessionsResponse = await api.getSessionsForUser(tutor.id);
          const sessions = sessionsResponse.sessions || [];
          
          return {
            ...tutor,
            totalSessions: sessions.length,
            completedSessions: sessions.filter((s: any) => s.status === 'completed').length,
            activeStudents: [...new Set(sessions.map((s: any) => s.studentId))].length,
            rating: 4.5 + Math.random() * 0.5 // Random rating for now
          };
        })
      );
      
      setTutors(enriched);
    } catch (error) {
      console.error('Error loading tutors:', error);
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tutor: any) => {
    setSelectedTutor(tutor);
    setShowDetailDialog(true);
  };

  const handleDeleteClick = (tutor: any) => {
    setSelectedTutor(tutor);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTutor) return;
    
    try {
      await api.deleteUser(selectedTutor.id);
      await loadTutors();
      setShowDeleteDialog(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error('Error deleting tutor:', error);
      toast.error('Failed to delete tutor');
    }
  };

  const handleAddTutor = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await api.createUser({
        role: 'tutor',
        ...formData
      });
      
      await loadTutors();
      setShowAddDialog(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        tutorId: '',
        department: '',
        position: '',
        expertise: [],
        bio: '',
        phone: '',
        address: '',
        office: '',
        education: ''
      });
      setExpertiseInput('');
    } catch (error) {
      console.error('Error creating tutor:', error);
      toast.error('Failed to create tutor');
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(e => e !== expertise)
    });
  };

  const filteredTutors = tutors.filter(tutor => {
    const query = searchQuery.toLowerCase();
    return (
      tutor.name?.toLowerCase().includes(query) ||
      tutor.email?.toLowerCase().includes(query) ||
      tutor.tutorId?.toLowerCase().includes(query) ||
      tutor.department?.toLowerCase().includes(query) ||
      tutor.position?.toLowerCase().includes(query) ||
      tutor.expertise?.some((e: string) => e?.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground mb-2">Tutor Management</h1>
          <p className="text-muted-foreground">Manage tutors, track their performance, and review feedback.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Tutor
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, tutor ID, department, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading tutors...</div>
        ) : filteredTutors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No tutors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Tutor</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Tutor ID</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Department</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Position</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Students</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Sessions</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground">Rating</th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-foreground">{tutor.name}</p>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="w-3 h-3" />
                          {tutor.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{tutor.tutorId || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{tutor.department || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{tutor.position || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{tutor.activeStudents || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{tutor.totalSessions || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-foreground">{tutor.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(tutor)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(tutor)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tutor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tutor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  placeholder="Nguyen Minh A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tutor@hcmut.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tutor-id">Tutor ID</Label>
                <Input
                  id="tutor-id"
                  placeholder="T1001"
                  value={formData.tutorId}
                  onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 xxx xxx xxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                    <SelectItem value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="office">Office Location</Label>
                <Input
                  id="office"
                  placeholder="Building A1, Room 301"
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="PhD in Computer Science"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
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
                {formData.expertise.map((exp, index) => (
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
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Brief introduction about the tutor..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="District, Ho Chi Minh City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleAddTutor}
              >
                Add Tutor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutor Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
          </DialogHeader>
          
          {selectedTutor && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-foreground mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="text-foreground">{selectedTutor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tutor ID</p>
                    <p className="text-foreground">{selectedTutor.tutorId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{selectedTutor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground">{selectedTutor.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-foreground mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Department</p>
                    <p className="text-foreground">{selectedTutor.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Position</p>
                    <p className="text-foreground">{selectedTutor.position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Education</p>
                    <p className="text-foreground">{selectedTutor.education || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Office</p>
                    <p className="text-foreground">{selectedTutor.office || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="text-foreground mb-3">Areas of Expertise</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.expertise && selectedTutor.expertise.length > 0 ? (
                      selectedTutor.expertise.map((exp: string, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-700">{exp}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No expertise listed</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedTutor.bio && (
                <div>
                  <h3 className="text-foreground mb-3">Bio</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-foreground">{selectedTutor.bio}</p>
                  </div>
                </div>
              )}

              {/* Program Statistics */}
              <div>
                <h3 className="text-foreground mb-3">Performance Statistics</h3>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Students</p>
                    <p className="text-foreground">{selectedTutor.activeStudents || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-foreground">{selectedTutor.totalSessions || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-foreground">{selectedTutor.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tutor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTutor?.name}? This will remove all their sessions and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
