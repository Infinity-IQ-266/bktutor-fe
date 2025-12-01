import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MaterialDto } from '@/services/material';
import { MaterialService } from '@/services/material';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Download, FileText, Plus, Share2, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/__private/tutor/materials/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [materials, setMaterials] = useState<MaterialDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] =
        useState<MaterialDto | null>(null);
    const [studentIdsInput, setStudentIdsInput] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const data = await MaterialService.getMyUploadedMaterials();
            setMaterials(data || []);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadMaterial = () => {
        // TODO: Implement upload dialog
        toast.info('Upload functionality coming soon');
    };

    const handleShareMaterial = (materialId: number) => {
        const material = materials.find((m) => m.id === materialId);
        if (material) {
            setSelectedMaterial(material);
            setStudentIdsInput('');
            setShareDialogOpen(true);
        }
    };

    const handleShareConfirm = async () => {
        if (!selectedMaterial || !studentIdsInput.trim()) {
            toast.error('Please enter at least one student ID');
            return;
        }

        try {
            setIsSharing(true);
            // Parse student IDs from comma-separated input
            const studentIds = studentIdsInput
                .split(',')
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id));

            if (studentIds.length === 0) {
                toast.error('Please enter valid student IDs');
                return;
            }

            await MaterialService.shareMaterial(selectedMaterial.id, {
                studentIds,
            });

            setShareDialogOpen(false);
            await fetchMaterials(); // Refresh to show updated share count
        } catch (error) {
            console.error('Failed to share material:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleDeleteMaterial = () => {
        // API doesn't provide delete endpoint yet
        toast.info('Delete functionality not available in API');
    };

    const handleDownload = async (material: MaterialDto) => {
        try {
            const blob = await MaterialService.downloadMaterial(material.id);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${material.title}.${material.fileType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${material.title}`);
        } catch (error) {
            console.error('Failed to download material:', error);
        }
    };

    const getIcon = (fileType: string) => {
        const ext = fileType.toUpperCase();
        switch (ext) {
            case 'PDF':
            case 'IPYNB':
            case 'CSV':
            default:
                return FileText;
        }
    };

    const uploadedMaterials = materials.filter((m) => m.source === 'UPLOADED');

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-foreground">Learning Materials</h1>
                    <p className="text-muted-foreground">
                        Upload and share materials with your students
                    </p>
                </div>
                <Button
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={handleUploadMaterial}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Material
                </Button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-foreground">
                                {uploadedMaterials.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Materials
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-green-50 p-3">
                            <Share2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-foreground">
                                {materials.reduce(
                                    (sum, m) => sum + m.sharedWithCount,
                                    0,
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Shares
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-purple-50 p-3">
                            <Download className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-foreground">
                                {materials.length > 0
                                    ? `${materials.reduce((sum, m) => sum + parseFloat(m.size), 0).toFixed(1)} MB`
                                    : '0 MB'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Size
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials List */}
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">
                        All Materials ({materials.length})
                    </TabsTrigger>
                    <TabsTrigger value="shared">
                        Shared (
                        {materials.filter((m) => m.sharedWithCount > 0).length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    {loading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                                Loading materials...
                            </p>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="rounded-xl border border-border bg-white p-12 text-center">
                            <FileText className="mx-auto mb-3 h-16 w-16 text-muted-foreground opacity-50" />
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                No materials yet
                            </h3>
                            <p className="mb-4 text-muted-foreground">
                                Upload your first learning material to share
                                with students
                            </p>
                            <Button
                                className="bg-primary text-white hover:bg-primary/90"
                                onClick={handleUploadMaterial}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Material
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {materials.map((material) => {
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
                                                    {dayjs(
                                                        material.uploadDate,
                                                    ).format(
                                                        'MMM D, YYYY',
                                                    )}{' '}
                                                    • {material.size}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {material.subjectName}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {material.fileType.toUpperCase()}
                                                    </Badge>
                                                    {material.sharedWithCount >
                                                        0 && (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            Shared with{' '}
                                                            {
                                                                material.sharedWithCount
                                                            }{' '}
                                                            student
                                                            {material.sharedWithCount >
                                                            1
                                                                ? 's'
                                                                : ''}
                                                        </Badge>
                                                    )}
                                                    {material.description && (
                                                        <span className="text-sm text-muted-foreground">
                                                            •{' '}
                                                            {
                                                                material.description
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleShareMaterial(
                                                            material.id,
                                                        )
                                                    }
                                                >
                                                    <Share2 className="mr-1 h-4 w-4" />
                                                    Share
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleDownload(material)
                                                    }
                                                >
                                                    <Download className="mr-1 h-4 w-4" />
                                                    Download
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={
                                                        handleDeleteMaterial
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="shared" className="mt-6">
                    {materials.filter((m) => m.sharedWithCount > 0).length ===
                    0 ? (
                        <div className="rounded-xl border border-border bg-white p-12 text-center">
                            <Share2 className="mx-auto mb-3 h-16 w-16 text-muted-foreground opacity-50" />
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                No shared materials
                            </h3>
                            <p className="text-muted-foreground">
                                Share materials with your students to see them
                                here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {materials
                                .filter((m) => m.sharedWithCount > 0)
                                .map((material) => {
                                    const Icon = getIcon(material.fileType);
                                    return (
                                        <div
                                            key={material.id}
                                            className="rounded-xl border border-border bg-white p-5"
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
                                                        Shared with{' '}
                                                        {
                                                            material.sharedWithCount
                                                        }{' '}
                                                        student
                                                        {material.sharedWithCount >
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">
                                                            {
                                                                material.subjectName
                                                            }
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {material.fileType.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Share Material Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Material</DialogTitle>
                        <DialogDescription>
                            Share "{selectedMaterial?.title}" with your students
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentIds">
                                Student IDs (comma-separated)
                            </Label>
                            <Input
                                id="studentIds"
                                placeholder="e.g., 2011234, 2011235, 2011236"
                                value={studentIdsInput}
                                onChange={(e) =>
                                    setStudentIdsInput(e.target.value)
                                }
                            />
                            <p className="text-sm text-muted-foreground">
                                Enter one or more student IDs separated by
                                commas
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShareDialogOpen(false)}
                            disabled={isSharing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShareConfirm}
                            disabled={isSharing}
                        >
                            {isSharing ? 'Sharing...' : 'Share Material'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
