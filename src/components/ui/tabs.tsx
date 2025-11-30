import { cn } from '@/lib/utils';
import * as React from 'react';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
    undefined,
);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    (
        {
            value: controlledValue,
            defaultValue,
            onValueChange,
            children,
            ...props
        },
        ref,
    ) => {
        const [internalValue, setInternalValue] = React.useState(
            defaultValue || '',
        );
        const value = controlledValue ?? internalValue;

        const handleValueChange = (newValue: string) => {
            setInternalValue(newValue);
            onValueChange?.(newValue);
        };

        return (
            <TabsContext.Provider
                value={{ value, onValueChange: handleValueChange }}
            >
                <div ref={ref} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        );
    },
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
            className,
        )}
        {...props}
    />
));
TabsList.displayName = 'TabsList';

interface TabsTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value: triggerValue, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error('TabsTrigger must be used within Tabs');

        const isActive = context.value === triggerValue;

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => context.onValueChange(triggerValue)}
                className={cn(
                    'inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                    isActive && 'bg-background text-foreground shadow',
                    className,
                )}
                {...props}
            />
        );
    },
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value: contentValue, ...props }, ref) => {
        const context = React.useContext(TabsContext);
        if (!context) throw new Error('TabsContent must be used within Tabs');

        if (context.value !== contentValue) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    'mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                    className,
                )}
                {...props}
            />
        );
    },
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsContent, TabsList, TabsTrigger };
