import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__private/tutor/dashboard/')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/__private/tutor/dashboard/"!</div>;
}
