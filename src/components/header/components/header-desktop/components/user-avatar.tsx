import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores';
import { User } from 'lucide-react';

type UserAvatarProps = {
    className?: string;
};

export const UserAvatar = ({ className }: UserAvatarProps) => {
    const { fullName } = useUserStore();
    return (
        <div className="relative">
            <button
                className={cn(
                    'inline-flex items-center rounded-4xl border-2 border-white pe-10 hover:cursor-pointer hover:bg-secondary-darken',
                    className,
                )}
            >
                <div className="aspect-square rounded-full bg-white p-2">
                    <User className="size-8 text-secondary" />
                </div>
                <p className="ms-3 max-w-24 truncate text-xl text-white">
                    {fullName}
                </p>
            </button>
        </div>
    );
};
