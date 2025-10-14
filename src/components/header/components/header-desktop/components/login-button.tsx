import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

type LoginButtonProps = {
    className?: string;
};

export const LoginButton = ({ className }: LoginButtonProps) => {
    return (
        <Link
            to="/auth/sso"
            className={cn(
                'inline-flex rounded-4xl border-2 border-white px-10 py-3 hover:cursor-pointer hover:bg-secondary-darken',
                className,
            )}
        >
            <p className="text-xl text-white">Login</p>
        </Link>
    );
};
