import { LogoWhiteIcon } from '@/assets/icons';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores';
import { ROLE_LABELS, ROLE_ROUTE_PREFIX } from '@/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import {
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    Clock,
    GitMerge,
    GraduationCap,
    LayoutDashboard,
    type LucideProps,
    MessageSquare,
    Search,
    Settings,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';

// Type-safe icon map
const iconMap = {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    BarChart3,
    Settings,
    Search,
    TrendingUp,
    BookOpen,
    User,
    Clock,
    MessageSquare,
    GitMerge,
    Bell,
} satisfies Record<
    string,
    React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    >
>;

type MenuItem = {
    id: string;
    label: string;
    icon: keyof typeof iconMap;
    to: string;
};

export const Sidebar = () => {
    const { user } = useUserStore();
    const { location } = useRouterState();
    // TODO: Please try to implement this
    const unreadCount = 0;

    const menuItems: MenuItem[] = useMemo(() => {
        if (!user?.role) return [];

        const routePrefix = ROLE_ROUTE_PREFIX[user?.role] || '/';

        switch (user.role) {
            case 'PROGRAM_ADMINISTRATOR':
                return [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: 'LayoutDashboard',
                        to: `${routePrefix}/dashboard`,
                    },
                    {
                        id: 'tutor',
                        label: 'Tutors',
                        icon: 'GraduationCap',
                        to: `${routePrefix}/tutor`,
                    },
                    {
                        id: 'student',
                        label: 'Students',
                        icon: 'Users',
                        to: `${routePrefix}/student`,
                    },
                    {
                        id: 'sessions',
                        label: 'Sessions',
                        icon: 'Calendar',
                        to: `${routePrefix}/sessions`,
                    },
                    {
                        id: 'reports',
                        label: 'Reports',
                        icon: 'BarChart3',
                        to: `${routePrefix}/reports`,
                    },
                    {
                        id: 'settings',
                        label: 'Settings',
                        icon: 'Settings',
                        to: `${routePrefix}/settings`,
                    },
                ];

            case 'STUDENT':
                return [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: 'LayoutDashboard',
                        to: `${routePrefix}/dashboard`,
                    },
                    {
                        id: 'find-tutor',
                        label: 'Find Tutor',
                        icon: 'Search',
                        to: `${routePrefix}/find-tutor`,
                    },
                    {
                        id: 'my-sessions',
                        label: 'My Sessions',
                        icon: 'Calendar',
                        to: `${routePrefix}/my-sessions`,
                    },
                    {
                        id: 'progress',
                        label: 'Progress',
                        icon: 'TrendingUp',
                        to: `${routePrefix}/progress`,
                    },
                    {
                        id: 'materials',
                        label: 'Materials',
                        icon: 'BookOpen',
                        to: `${routePrefix}/materials`,
                    },
                    {
                        id: 'notifications',
                        label: 'Notifications',
                        icon: 'Bell',
                        to: `${routePrefix}/notifications`,
                    },
                    {
                        id: 'profile',
                        label: 'Profile',
                        icon: 'User',
                        to: `${routePrefix}/profile`,
                    },
                ];

            case 'TUTOR':
                return [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: 'LayoutDashboard',
                        to: `${routePrefix}/dashboard`,
                    },
                    {
                        id: 'students',
                        label: 'My Students',
                        icon: 'Users',
                        to: `${routePrefix}/my-students`,
                    },
                    {
                        id: 'sessions',
                        label: 'Sessions',
                        icon: 'Calendar',
                        to: `${routePrefix}/sessions`,
                    },
                    {
                        id: 'availability',
                        label: 'Availability',
                        icon: 'Clock',
                        to: `${routePrefix}/availability`,
                    },
                    {
                        id: 'feedback',
                        label: 'Feedback',
                        icon: 'MessageSquare',
                        to: `${routePrefix}/feedback`,
                    },
                    {
                        id: 'materials',
                        label: 'Materials',
                        icon: 'BookOpen',
                        to: `${routePrefix}/materials`,
                    },
                    {
                        id: 'notifications',
                        label: 'Notifications',
                        icon: 'Bell',
                        to: `${routePrefix}/notifications`,
                    },
                    {
                        id: 'profile',
                        label: 'Profile',
                        icon: 'User',
                        to: `${routePrefix}/profile`,
                    },
                ];

            case 'COORDINATOR':
                return [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: 'LayoutDashboard',
                        to: `${routePrefix}/dashboard`,
                    },
                    {
                        id: 'matching',
                        label: 'Matching',
                        icon: 'GitMerge',
                        to: `${routePrefix}/matching`,
                    },
                    {
                        id: 'tutors',
                        label: 'Tutors',
                        icon: 'GraduationCap',
                        to: `${routePrefix}/tutors`,
                    },
                    {
                        id: 'students',
                        label: 'Students',
                        icon: 'Users',
                        to: `${routePrefix}/students`,
                    },
                    {
                        id: 'sessions',
                        label: 'Sessions',
                        icon: 'Calendar',
                        to: `${routePrefix}/sessions`,
                    },
                    {
                        id: 'reports',
                        label: 'Reports',
                        icon: 'BarChart3',
                        to: `${routePrefix}/reports`,
                    },
                ];

            case 'DEPARTMENT_CHAIR':
                return [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: 'LayoutDashboard',
                        to: `${routePrefix}/dashboard`,
                    },
                    {
                        id: 'students',
                        label: 'Department Students',
                        icon: 'Users',
                        to: `${routePrefix}/students`,
                    },
                    {
                        id: 'reports',
                        label: 'Reports',
                        icon: 'BarChart3',
                        to: `${routePrefix}/reports`,
                    },
                ];

            default:
                return [];
        }
    }, [user?.role]);

    return (
        <div className="flex h-screen min-w-1/6 flex-col bg-[#0F2D52]">
            {/* Logo and Title */}
            <div className="p-6 pb-4">
                <div className="mb-3 flex items-center gap-2">
                    <LogoWhiteIcon className="px-2" />
                </div>
                <p className="text-sm text-white/80">
                    {user?.role ? ROLE_LABELS[user.role] : 'User'}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 pt-4">
                {menuItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const isActive = location.pathname === item.to;
                    const isNotifications = item.id === 'notifications';

                    return (
                        <Link
                            key={item.id}
                            to={item.to}
                            className={cn(
                                'mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                                isActive
                                    ? 'bg-white text-[#0F2D52]'
                                    : 'text-white/90 hover:bg-white/10',
                            )}
                        >
                            <div className="relative">
                                <Icon className="h-5 w-5" />
                                {isNotifications && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="no-wrap">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
