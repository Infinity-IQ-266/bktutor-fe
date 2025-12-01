import { Search, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface HeaderProps {
  userData?: any;
  onLogout?: () => void;
}

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

export default function Header({ userData, onLogout }: HeaderProps) {
  const initials = getInitials(userData?.name || 'User');
  
  return (
    <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-foreground">{userData?.name || 'User'}</p>
          <p className="text-sm text-muted-foreground">{userData?.role || 'Role'}</p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-[#0f2d52] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="ml-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
