import { LogoWhiteIcon } from '@/assets/icons';
import { AuthService } from '@/services/auth';
import { useUserStore } from '@/stores';
import { ROLE_ROUTE_PREFIX } from '@/utils';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useUserStore();

    const AuthRequest = z.object({
        username: z.string().min(1).max(32),
        password: z.string().min(1).max(64),
    });

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);

        const validateResult = AuthRequest.safeParse({
            username,
            password,
        });

        if (!validateResult.success) {
            toast.error('Username or password is not valid');
            setIsLoading(false);
            return;
        }

        const { username: userInput, password: passInput } =
            validateResult.data;

        try {
            const authResponse = await AuthService.getToken({
                username: userInput,
                password: passInput,
            });

            if (!authResponse) {
                setError('There is an error while trying to login');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('access_token', authResponse.token);

            const meResponse = await AuthService.getMe();
            if (!meResponse) {
                setError('There is an error while trying to get user data');
                setIsLoading(false);
                return;
            }

            setUser(meResponse);

            const role = meResponse.role;
            const routePrefix = ROLE_ROUTE_PREFIX[role] || '/';

            toast.success('Logged in successfully');

            navigate({
                to: `${routePrefix}/dashboard`,
            });
        } catch (err) {
            console.error(err);
            setError('Unexpected error during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen flex-col bg-[#f8f9fa] md:flex-row">
            {/* Left Side - Branding */}
            <div className="relative flex w-1/2 flex-col items-center justify-center space-y-6 bg-[url(/images/hcmut-background.png)] bg-cover bg-no-repeat px-5">
                <LogoWhiteIcon className="h-auto w-2/5" />

                {/* Heading */}
                <p className="text-center font-['Arimo',sans-serif] text-[30px] leading-[36px] font-normal text-white">
                    Tutor Support System
                </p>

                {/* Subtitle */}
                <p className="text-center font-['Arimo',sans-serif] text-[18px] leading-[28px] font-normal text-[rgba(255,255,255,0.8)]">
                    Ho Chi Minh City University of Technology - VNU-HCM
                </p>

                {/* Description */}
                <p className="text-center font-['Arimo',sans-serif] text-[16px] leading-[24px] font-normal text-[rgba(255,255,255,0.6)]">
                    Connecting students with expert tutors for academic
                    excellence and personal growth.
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="w-2/3">
                    {/* SSO Login Card */}
                    <div className="mb-[24px] rounded-[12px] border-[0.8px] border-gray-200 bg-white p-[32.8px]">
                        <div className="mb-[24px]">
                            <h2 className="mb-[8px] font-['Arimo',sans-serif] text-[24px] leading-[32px] font-normal text-[#2d3748]">
                                Sign in with HCMUT SSO
                            </h2>
                            <p className="font-['Arimo',sans-serif] text-[16px] leading-[24px] font-normal text-gray-500">
                                Enter your university credentials to continue
                            </p>
                        </div>

                        {error && (
                            <div className="mb-[16px] rounded-[6px] border border-red-200 bg-red-50 p-[12px]">
                                <p className="font-['Arimo',sans-serif] text-[14px] font-normal text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-[16px]">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-[4px] block font-['Arimo',sans-serif] text-[14px] leading-[14px] font-normal text-[#2d3748]"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="yourname@hcmut.edu.vn"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="h-[36px] w-full rounded-[6px] border-[0.8px] border-gray-200 bg-white px-[12px] py-[4px] font-['Arimo',sans-serif] text-[14px] font-normal text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#0f2d52] focus:outline-none"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-[4px] block font-['Arimo',sans-serif] text-[14px] leading-[14px] font-normal text-[#2d3748]"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="h-[36px] w-full rounded-[6px] border-[0.8px] border-gray-200 bg-white px-[12px] py-[4px] font-['Arimo',sans-serif] text-[14px] font-normal text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#0f2d52] focus:outline-none"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="h-[36px] w-full rounded-[6px] bg-[#0f2d52] text-center font-['Arimo',sans-serif] text-[14px] leading-[20px] font-normal text-white transition-colors hover:bg-[#0f2d52]/90 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-[20px] text-center">
                            <a
                                href="#"
                                className="font-['Arimo',sans-serif] text-[14px] leading-[20px] font-normal text-[#0f2d52] hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    {/* Testing Info */}
                    {/* <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h3 className="mb-2 font-['Arimo',sans-serif] text-[14px] text-[#0f2d52]">
                            🔐 HCMUT SSO Database (67 users):
                        </h3>
                        <div className="space-y-1 font-['Arimo',sans-serif] text-[12px] text-gray-700">
                            <p>
                                • Students: student1-26@hcmut.edu.vn (password:
                                123456789)
                            </p>
                            <p>
                                • Tutors: tutor1-26@hcmut.edu.vn (password:
                                123456789)
                            </p>
                            <p>
                                • Chairs: chair1-5@hcmut.edu.vn (password:
                                123456789)
                            </p>
                            <p>
                                • Coordinators: coord1-5@hcmut.edu.vn (password:
                                123456789)
                            </p>
                            <p>
                                • Admins: admin1-5@hcmut.edu.vn (password:
                                admin123)
                            </p>
                        </div>
                        <div className="mt-3 border-t border-blue-300 pt-3">
                            <p className="mb-1 text-[12px] font-semibold text-green-700">
                                ✅ Pre-registered in BK TUTOR (35 users):
                            </p>
                            <p className="text-[11px] text-gray-700">
                                • student1-10, tutor1-10, chair1-5, coord1-5,
                                admin1-5
                            </p>
                            <p className="mt-1 text-[11px] text-orange-600">
                                📝 Not registered yet (32 users):
                            </p>
                            <p className="text-[11px] text-gray-700">
                                • student11-26, tutor11-26 → Complete signup
                                after SSO login
                            </p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
