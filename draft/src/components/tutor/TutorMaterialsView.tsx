import { Upload, FileText, Video, Image, Download, Share2, Trash2, ExternalLink, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner@2.0.3';

interface TutorMaterialsViewProps {
  userData?: any;
}

export default function TutorMaterialsView({ userData }: TutorMaterialsViewProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFileType, setUploadFileType] = useState('PDF');

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      
      // Load materials uploaded by this tutor
      const materialsRes = await api.getMaterials({ userId: userData.id });
      setMaterials(materialsRes.materials || []);
      
      // Load students who have sessions with this tutor
      const sessionsRes = await api.getSessionsForUser(userData.id);
      const sessions = sessionsRes.sessions || [];
      
      // Get unique student IDs
      const studentIds = [...new Set(sessions.map((s: any) => s.studentId))];
      
      // Load student details
      const studentsPromises = studentIds.map((id: string) => api.getUser(id));
      const studentsResults = await Promise.all(studentsPromises);
      const students = studentsResults.map(r => r.user).filter(Boolean);
      
      setMyStudents(students);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async () => {
    if (!uploadTitle || !uploadSubject || !userData) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const materialData = {
        title: uploadTitle,
        subject: uploadSubject,
        description: uploadDescription,
        uploadedBy: userData.id,
        uploadedByName: userData.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: uploadFileType,
        fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        downloads: 0,
        tags: [uploadSubject],
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        sharedWith: []
      };
      
      await api.createMaterial(materialData);
      await loadData();
      
      setShowUploadDialog(false);
      setUploadTitle('');
      setUploadSubject('');
      setUploadDescription('');
      setUploadFileType('PDF');
      
      toast.success('Material uploaded successfully!');
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    }
  };

  const handleShareMaterial = async () => {
    if (!selectedMaterial || selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    try {
      // Update material with new shared list
      const currentSharedWith = selectedMaterial.sharedWith || [];
      const newSharedWith = [...new Set([...currentSharedWith, ...selectedStudents])];
      
      await api.updateMaterial(selectedMaterial.id, {
        sharedWith: newSharedWith
      });
      
      // Create notifications for newly shared students
      const newlySharedStudents = selectedStudents.filter(id => !currentSharedWith.includes(id));
      
      for (const studentId of newlySharedStudents) {
        await api.createNotification({
          userId: studentId,
          type: 'material_shared',
          title: 'New Learning Material Shared',
          message: `${userData?.name} has shared "${selectedMaterial.title}" with you`,
          relatedId: selectedMaterial.id
        });
      }
      
      await loadData();
      setShowShareDialog(false);
      setSelectedStudents([]);
      
      toast.success(`Material shared with ${newlySharedStudents.length} student(s)`);
    } catch (error) {
      console.error('Error sharing material:', error);
      toast.error('Failed to share material');
    }
  };

  const handleDownload = (material: any) => {
    const link = document.createElement('a');
    link.href = material.url;
    link.download = `${material.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openShareDialog = (material: any) => {
    setSelectedMaterial(material);
    setSelectedStudents([]);
    setShowShareDialog(true);
  };

  const handleDeleteMaterial = (material: any) => {
    setSelectedMaterial(material);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMaterial) return;
    
    try {
      await api.deleteMaterial(selectedMaterial.id);
      await loadData();
      setShowDeleteDialog(false);
      toast.success('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return FileText;
      case 'VIDEO':
        return Video;
      case 'IMAGE':
        return Image;
      default:
        return FileText;
    }
  };

  const libraryResources = [
    {
      id: 1,
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Cormen, Leiserson, Rivest, Stein',
      category: 'Computer Science',
      type: 'E-Book',
      available: true,
    },
    {
      id: 2,
      title: 'Data Structures and Algorithm Analysis',
      author: 'Mark Allen Weiss',
      category: 'Computer Science',
      type: 'E-Book',
      available: true,
    },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Learning Materials</h1>
          <p className="text-muted-foreground">Manage and share educational resources with your students</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Library Integration */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground mb-2">HCMUT Library Resources</h3>
            <p className="text-sm text-muted-foreground">Access and share resources from the university library</p>
          </div>
          <Button variant="outline" onClick={() => setShowLibraryDialog(true)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Browse Library
          </Button>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading materials...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No materials uploaded yet</p>
          </div>
        ) : (
          materials.map((material) => {
            const Icon = getIcon(material.fileType);
            const sharedCount = material.sharedWith?.length || 0;
            
            return (
              <div
                key={material.id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">{material.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{material.fileType}</span>
                      <span>•</span>
                      <span>{material.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded {material.uploadDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {material.subject}
                      </Badge>
                      <Badge variant="secondary">
                        Shared with {sharedCount} student{sharedCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openShareDialog(material)}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(material)}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteMaterial(material)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Material</DialogTitle>
            <DialogDescription>
              Upload educational resources to share with your students
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter material title"
                className="mt-1"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={uploadSubject} onValueChange={setUploadSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Database Systems">Database Systems</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fileType">File Type</Label>
              <Select value={uploadFileType} onValueChange={setUploadFileType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the material"
                className="mt-1"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={handleUploadMaterial}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Material</DialogTitle>
            <DialogDescription>
              Select students to share this material with
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Material</p>
                <p className="text-foreground">{selectedMaterial.title}</p>
              </div>
              
              <div>
                <Label>Share with Students</Label>
                {myStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    No students found. Students will appear here once you have scheduled sessions with them.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {myStudents.map((student) => {
                      const isAlreadyShared = selectedMaterial.sharedWith?.includes(student.id);
                      const isSelected = selectedStudents.includes(student.id);
                      
                      return (
                        <label 
                          key={student.id} 
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <Checkbox
                            checked={isSelected || isAlreadyShared}
                            disabled={isAlreadyShared}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {student.studentId}</p>
                          </div>
                          {isAlreadyShared && (
                            <Badge variant="secondary" className="text-xs">Already shared</Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowShareDialog(false);
                    setSelectedStudents([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={handleShareMaterial}
                  disabled={selectedStudents.length === 0}
                >
                  Share Material
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Browse Library Dialog */}
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Browse HCMUT Library</DialogTitle>
            <DialogDescription>
              Search and access resources from the university library to share with students
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or keyword..."
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ebook">E-Books</SelectItem>
                  <SelectItem value="journal">Journals</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            <div className="space-y-3">
              {libraryResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-foreground mb-1">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{resource.author}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <Badge variant="secondary">{resource.type}</Badge>
                        {resource.available && (
                          <Badge className="bg-green-100 text-green-700">Available</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLibraryDialog(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Full Library Portal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material? This action cannot be undone and students who have access will lose it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedMaterial && (
            <div className="bg-gray-50 rounded-lg p-3 my-4">
              <p className="text-foreground">{selectedMaterial.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedMaterial.fileType} • {selectedMaterial.fileSize}
              </p>
              {selectedMaterial.sharedWith?.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Currently shared with {selectedMaterial.sharedWith.length} students
                </p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete Material
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
