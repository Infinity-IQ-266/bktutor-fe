export type UploadMaterialRequestDto = {
    title: string;
    subject: string;
    description?: string;
    file: File;
};

export type MaterialDto = {
    id: number;
    title: string;
    description?: string;
    fileType: string;
    size: string;
    uploadDate: string;
    source: 'UPLOADED' | 'LIBRARY';
    subjectName: string;
    sharedWithCount: number;
    downloadUrl: string;
};

export type ShareMaterialRequestDto = {
    studentIds: number[];
};

export type GetMyUploadedMaterialsResponseDto = MaterialDto[];

export type GetSharedMaterialsResponseDto = MaterialDto[];
