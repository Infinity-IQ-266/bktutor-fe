import { Header, Sidebar } from '@/routes/-components';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__private')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
