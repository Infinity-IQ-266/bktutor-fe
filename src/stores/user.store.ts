import { type User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore extends User {
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            userId: 0,
            fullName: '',
            faculty: '',

            setUser: (user) => set(() => ({ ...user })),
            clearUser: () => set({ userId: 0, fullName: '', faculty: '' }),
        }),
        {
            name: 'user-store',
        },
    ),
);
