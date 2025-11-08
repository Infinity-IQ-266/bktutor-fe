import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores';
import { ROLE_LABELS } from '@/utils';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Search } from 'lucide-react';

// Function to get initials from name
function getInitials(name: string): string {
    if (!name) return 'U';

    const words = name.trim().split(' ');

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    // Get first letter of first word and first letter of last word
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

    return firstInitial + lastInitial;
}

export const Header = () => {
    const { user } = useUserStore();
    const initials = getInitials(user?.fullName || 'User');
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate({
            to: '/',
        });
    };
    return (
        <div className="flex items-center justify-between border-b border-border bg-white px-8 py-4">
            {/* Search Bar */}
            <div className="max-w-md flex-1">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 transition-colors outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[#2D3748]">{user?.fullName || 'User'}</p>
                    <p className="text-sm text-[#6B7280]">
                        {user?.role ? ROLE_LABELS[user?.role] : 'USER'}
                    </p>
                </div>
                <Avatar>
                    <AvatarFallback className="bg-[#1F3F5B] text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="ml-2 hover:cursor-pointer hover:bg-[#f1f1f1]"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
