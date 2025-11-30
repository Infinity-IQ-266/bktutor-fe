import { BACKEND_URL } from '@/envs';
import client from '@/services/client';
import { toast } from 'sonner';

import type { Response } from '../response';
import type {
    GetMyUploadedMaterialsResponseDto,
    GetSharedMaterialsResponseDto,
    ShareMaterialRequestDto,
    UploadMaterialRequestDto,
} from './dtos/material.dto';

const url = `${BACKEND_URL}/api/v1/materials`;

export const MaterialService = {
    /**
     * Upload a new material (Tutor only)
     */
    uploadMaterial: async (
        uploadMaterialRequestDto: UploadMaterialRequestDto,
    ) => {
        try {
            const formData = new FormData();
            formData.append('file', uploadMaterialRequestDto.file);

            const response = await client.post<Response<void>>(
                `${url}?title=${encodeURIComponent(uploadMaterialRequestDto.title)}&subject=${encodeURIComponent(uploadMaterialRequestDto.subject)}${uploadMaterialRequestDto.description ? `&description=${encodeURIComponent(uploadMaterialRequestDto.description)}` : ''}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            toast.success('Material uploaded successfully');
            return response.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to upload material');
            throw error;
        }
    },

    /**
     * Share a material with students (Tutor only)
     */
    shareMaterial: async (
        materialId: number,
        shareMaterialRequestDto: ShareMaterialRequestDto,
    ) => {
        try {
            const response = await client.post<Response<void>>(
                `${url}/${materialId}/share`,
                shareMaterialRequestDto,
            );

            toast.success('Material shared successfully');
            return response.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to share material');
            throw error;
        }
    },

    /**
     * Download a material by ID
     */
    downloadMaterial: async (materialId: number) => {
        try {
            const response = await client.get<Blob>(
                `${url}/${materialId}/download`,
                {
                    responseType: 'blob',
                },
            );

            return response.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to download material');
            throw error;
        }
    },

    /**
     * Get all materials uploaded by the current tutor (Tutor only)
     */
    getMyUploadedMaterials: async () => {
        try {
            const response = await client.get<
                Response<GetMyUploadedMaterialsResponseDto>
            >(`${url}/tutor/me`);

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to get your uploaded materials');
            throw error;
        }
    },

    /**
     * Get all materials shared with the current student (Student only)
     */
    getSharedMaterials: async () => {
        try {
            const response = await client.get<
                Response<GetSharedMaterialsResponseDto>
            >(`${url}/student/me`);

            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error('Failed to get shared materials');
            throw error;
        }
    },
};
