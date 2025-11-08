import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    change?: string;
    iconBgColor?: string;
}

export const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    iconBgColor = 'bg-blue-50',
}: StatCardProps) => {
    const isPositive = change && change.startsWith('+');

    return (
        <div className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div className={`${iconBgColor} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                {change && (
                    <span
                        className={`text-sm ${isPositive ? 'text-[#10B981]' : 'text-red-600'}`}
                    >
                        {change}
                    </span>
                )}
            </div>
            <p className="mb-1 text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl text-foreground">{value}</p>
        </div>
    );
};
