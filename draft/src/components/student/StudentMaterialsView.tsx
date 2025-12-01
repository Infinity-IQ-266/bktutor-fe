import { Download, FileText, Video, Image, ExternalLink, Upload, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface StudentMaterialsViewProps {
  userData?: any;
}

export default function StudentMaterialsView({ userData }: StudentMaterialsViewProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, [userData]);

  const loadMaterials = async () => {
    if (!userData?.id) return;
    
    try {
      setLoading(true);
      const response = await api.getMaterials({ userId: userData.id });
      setMaterials(response.materials || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (material: any) => {
    // Open PDF in new tab (same as "Access")
    window.open(material.url, '_blank');
    
    // Increment download counter
    api.incrementMaterialDownload(material.id);
  };

  const handleDownload = (material: any) => {
    // Download the file
    const link = document.createElement('a');
    link.href = material.url;
    link.download = `${material.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Increment download counter
    api.incrementMaterialDownload(material.id);
  };

  const handleAccessLibrary = (resource: any) => {
    // Access library resource - open in new tab
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
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
      type: 'E-Book',
      author: 'Cormen, Leiserson, Rivest, Stein',
      source: 'HCMUT Library',
      category: 'Computer Science',
      available: true,
      description: 'Comprehensive textbook on algorithms and data structures',
    },
    {
      id: 2,
      title: 'Calculus: Early Transcendentals',
      type: 'E-Book',
      author: 'James Stewart',
      source: 'HCMUT Library',
      category: 'Mathematics',
      available: true,
      description: 'Advanced calculus textbook with applications',
    },
    {
      id: 3,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      type: 'E-Book',
      author: 'Robert C. Martin',
      source: 'HCMUT Library',
      category: 'Computer Science',
      available: true,
      description: 'Best practices for writing clean, maintainable code',
    },
    {
      id: 4,
      title: 'Linear Algebra and Its Applications',
      type: 'E-Book',
      author: 'Gilbert Strang',
      source: 'HCMUT Library',
      category: 'Mathematics',
      available: false,
      description: 'Comprehensive introduction to linear algebra',
    },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Learning Materials</h1>
          <p className="text-muted-foreground">Access materials shared by your tutors and library resources</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shared">
        <TabsList>
          <TabsTrigger value="shared">Shared by Tutors</TabsTrigger>
          <TabsTrigger value="library">Library Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="shared" className="mt-6">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading materials...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No materials shared yet</p>
              </div>
            ) : (
              materials.map((material) => {
                const Icon = getIcon(material.fileType);
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
                        <p className="text-sm text-muted-foreground mb-2">
                          Shared by {material.uploadedByName} • {material.uploadDate}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{material.subject}</Badge>
                          <span className="text-sm text-muted-foreground">{material.fileSize}</span>
                          <span className="text-sm text-muted-foreground">• {material.downloads} downloads</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(material)}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleDownload(material)}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground mb-1">HCMUT Library Integration</p>
                <p className="text-sm text-muted-foreground">
                  Access thousands of academic resources from the university library
                </p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => setShowLibraryDialog(true)}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Library
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {libraryResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {resource.author} • {resource.source}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{resource.category}</Badge>
                      {resource.available ? (
                        <Badge className="bg-green-100 text-green-700">Available</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Checked Out</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-white"
                    disabled={!resource.available}
                    onClick={() => resource.available && handleAccessLibrary(resource)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {resource.available ? 'Access' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Material Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Material</DialogTitle>
            <DialogDescription>
              Share your notes, assignments, or study materials
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File *</Label>
              <div className="mt-1">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, PPT, or Image (Max 50MB)
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="material-title">Title *</Label>
              <Input
                id="material-title"
                placeholder="e.g., Midterm Study Guide"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="material-subject">Subject *</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ds">Data Structures</SelectItem>
                  <SelectItem value="algo">Algorithms</SelectItem>
                  <SelectItem value="calc">Calculus</SelectItem>
                  <SelectItem value="prog">Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="material-description">Description (Optional)</Label>
              <Textarea
                id="material-description"
                placeholder="Describe the content..."
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={() => setShowUploadDialog(false)}
              >
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Browse Library Dialog */}
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Browse HCMUT Library</DialogTitle>
            <DialogDescription>
              Search and access academic resources from the university library
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Bar */}
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
                  <SelectItem value="engineering">Engineering</SelectItem>
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
                  <SelectItem value="thesis">Theses</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available Now</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
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
                      <p className="text-sm text-foreground mb-2">{resource.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{resource.category}</Badge>
                        <Badge variant="secondary">{resource.type}</Badge>
                        {resource.available ? (
                          <Badge className="bg-green-100 text-green-700">Available</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Checked Out</Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      disabled={!resource.available}
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => resource.available && handleAccessLibrary(resource)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Access
                    </Button>
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


    </div>
  );
}
