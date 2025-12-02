import { cn } from '@/lib/utils';
import * as React from 'react';

interface SwitchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    (
        {
            className,
            checked,
            defaultChecked,
            onCheckedChange,
            disabled,
            ...props
        },
        ref,
    ) => {
        const [internalChecked, setInternalChecked] = React.useState(
            defaultChecked ?? false,
        );
        const isChecked = checked !== undefined ? checked : internalChecked;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked;
            setInternalChecked(newChecked);
            onCheckedChange?.(newChecked);
        };

        return (
            <label
                className={cn(
                    'relative inline-flex cursor-pointer items-center',
                    disabled && 'cursor-not-allowed opacity-50',
                    className,
                )}
            >
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={disabled}
                    ref={ref}
                    {...props}
                />
                <div className="peer h-5 w-9 rounded-full bg-input shadow-sm transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background shadow-lg transition-transform peer-checked:translate-x-4"></div>
            </label>
        );
    },
);
Switch.displayName = 'Switch';

export { Switch };
