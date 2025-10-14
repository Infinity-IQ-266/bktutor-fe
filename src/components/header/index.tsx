import { LogoWhiteIcon } from '@/assets/icons';
import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useWindowSize } from 'usehooks-ts';

import { HeaderDesktop } from './components';

export const Header = () => {
    const { width } = useWindowSize();
    if (width > 1200) return <HeaderDesktop />;
    return (
        <div className="inline-flex w-full bg-secondary px-5 py-2">
            <Link to="/" className="inline-flex items-center">
                <LogoWhiteIcon className="h-auto w-40" />
            </Link>
            <button className="ms-auto">
                <Menu className="h-20 w-10 text-white" />
            </button>
        </div>
    );
};
