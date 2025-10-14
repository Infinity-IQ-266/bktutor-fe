import { LogoWhiteIcon } from '@/assets/icons';
import { useUserStore } from '@/stores';
import { Link } from '@tanstack/react-router';

import { LoginButton, UserAvatar } from './components';

export const HeaderDesktop = () => {
    const { userId } = useUserStore();
    return (
        <div className="inline-flex w-full items-center bg-secondary px-10 py-1">
            <Link to="/" className="inline-flex items-center">
                <LogoWhiteIcon className="h-20 w-48" />
            </Link>
            <div className="ms-auto">
                {userId ? <UserAvatar /> : <LoginButton />}
            </div>
        </div>
    );
};
