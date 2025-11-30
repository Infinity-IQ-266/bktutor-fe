import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { Download, ExternalLink, FileText, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/student/materials/')({
    component: RouteComponent,
});

// TODO: Replace with actual API integration using /api/v1/materials/student/me
const mockMaterials = [
    {
        id: 1,
        title: 'Data Structures - Lecture Notes Week 5',
        uploadedByName: 'Dr. Nguyen Van A',
        uploadDate: 'Nov 25, 2025',
        subject: 'Data Structures',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        downloads: 15,
        url: '#',
    },
    {
        id: 2,
        title: 'Binary Search Trees - Implementation Guide',
        uploadedByName: 'Dr. Nguyen Van A',
        uploadDate: 'Nov 20, 2025',
        subject: 'Data Structures',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        downloads: 23,
        url: '#',
    },
    {
        id: 3,
        title: 'Calculus II - Integration Techniques',
        uploadedByName: 'Prof. Tran Thi B',
        uploadDate: 'Nov 18, 2025',
        subject: 'Calculus II',
        fileType: 'PDF',
        fileSize: '3.2 MB',
        downloads: 18,
        url: '#',
    },
];

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

function RouteComponent() {
    const [materials] = useState(mockMaterials);
    const [loading] = useState(false);

    const handleView = (material: (typeof mockMaterials)[0]) => {
        // TODO: Implement view functionality with actual material URL
        toast.info('Opening material...');
        window.open(material.url, '_blank');
    };

    const handleDownload = (material: (typeof mockMaterials)[0]) => {
        // TODO: Implement download using /api/v1/materials/{id}/download
        toast.success(`Downloading ${material.title}`);
    };

    const handleAccessLibrary = () => {
        // TODO: Implement library resource access
        toast.info('Opening library resource...');
    };

    const getIcon = (fileType: string) => {
        switch (fileType.toUpperCase()) {
            case 'PDF':
                return FileText;
            default:
                return FileText;
        }
    };

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="mb-2 text-foreground">Learning Materials</h1>
                <p className="text-muted-foreground">
                    Access materials shared by your tutors and library resources
                </p>
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
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    Loading materials...
                                </p>
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    No materials shared yet
                                </p>
                            </div>
                        ) : (
                            materials.map((material) => {
                                const Icon = getIcon(material.fileType);
                                return (
                                    <div
                                        key={material.id}
                                        className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-blue-50 p-3">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="mb-1 text-foreground">
                                                    {material.title}
                                                </h3>
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    Shared by{' '}
                                                    {material.uploadedByName} •{' '}
                                                    {material.uploadDate}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {material.subject}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {material.fileSize}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        • {material.downloads}{' '}
                                                        downloads
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleView(material)
                                                    }
                                                >
                                                    <ExternalLink className="mr-1 h-4 w-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-primary text-white hover:bg-primary/90"
                                                    onClick={() =>
                                                        handleDownload(material)
                                                    }
                                                >
                                                    <Download className="mr-1 h-4 w-4" />
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
                    <div className="mb-6 rounded-xl border border-border bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-1 text-foreground">
                                    HCMUT Library Integration
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Access thousands of academic resources from
                                    the university library
                                </p>
                            </div>
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                <Search className="mr-2 h-4 w-4" />
                                Browse Library
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {libraryResources.map((resource) => (
                            <div
                                key={resource.id}
                                className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-50 p-3">
                                        <FileText className="h-6 w-6 text-green-600" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="mb-1 text-foreground">
                                            {resource.title}
                                        </h3>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {resource.author} •{' '}
                                            {resource.source}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {resource.category}
                                            </Badge>
                                            {resource.available ? (
                                                <Badge className="bg-green-100 text-green-700">
                                                    Available
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700">
                                                    Checked Out
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="bg-primary text-white hover:bg-primary/90"
                                        disabled={!resource.available}
                                        onClick={() =>
                                            resource.available &&
                                            handleAccessLibrary()
                                        }
                                    >
                                        <ExternalLink className="mr-1 h-4 w-4" />
                                        {resource.available
                                            ? 'Access'
                                            : 'Unavailable'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
