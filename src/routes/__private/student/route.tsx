import { useUserStore } from '@/stores';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/__private/student')({
    component: RouteComponent,
    beforeLoad: async () => {
        const { user } = useUserStore.getState();

        if (!user || user.role !== 'STUDENT') {
            throw redirect({
                to: '/',
            });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}
