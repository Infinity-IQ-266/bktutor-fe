import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  iconBgColor?: string;
}

export default function StatCard({ icon: Icon, label, value, change, iconBgColor = 'bg-blue-50' }: StatCardProps) {
  const isPositive = change && change.startsWith('+');
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <span className={`text-sm ${isPositive ? 'text-[#10B981]' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-3xl text-foreground">{value}</p>
    </div>
  );
}
