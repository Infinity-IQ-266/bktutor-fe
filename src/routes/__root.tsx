import { Toaster } from '@/components/ui/sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => {
    return (
        <>
            <TanStackRouterDevtools />
            <ReactQueryDevtools />
            <Toaster />
            <Outlet />
        </>
    );
};

export const Route = createRootRoute({ component: RootLayout });
