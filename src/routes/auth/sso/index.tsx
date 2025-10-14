import { LogoIcon } from '@/assets/icons';
import { AuthService } from '@/services/auth';
import { useUserStore } from '@/stores';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

export const Route = createFileRoute('/auth/sso/')({
    component: RouteComponent,
});

function RouteComponent() {
    const usernameRef = useRef<string>(null);
    const passwordRef = useRef<string>(null);
    const { setUser } = useUserStore();
    const navigate = useNavigate();

    const AuthRequest = z.object({
        username: z.string().min(1).max(32),
        password: z.string().min(1).max(64),
    });

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const validateResult = AuthRequest.safeParse({
            username: usernameRef.current,
            password: passwordRef.current,
        });
        if (!validateResult.success) {
            toast.error('Username or password is not valid');
        } else {
            const { username, password } = validateResult.data;

            const authResponse = await AuthService.getToken({
                username,
                password,
            });

            if (authResponse) {
                localStorage.setItem('access_token', authResponse.token);
                setUser({
                    fullName: authResponse.fullName,
                    userId: authResponse.userId,
                    faculty: authResponse.faculty,
                });
                toast.success('Logged in successfully');
                navigate({
                    to: '/',
                });
            }
        }
    };
    return (
        <div className="flex h-screen w-screen flex-col">
            <div className="inline-flex w-full bg-secondary px-5 py-2">
                <Link className="inline-flex items-center" to="/">
                    <LogoIcon className="h-auto w-20" />
                    <div className="ms-5">
                        <p className="text-md font-bold text-nowrap text-white md:text-xl xl:text-2xl 2xl:text-3xl">
                            Central Authenication Service
                        </p>
                    </div>
                </Link>
            </div>
            <div className="w-full px-5">
                <div className="flex w-full flex-row">
                    <form
                        className="my-5 w-full border border-black bg-gray/10 p-3 md:p-5 xl:w-auto xl:px-8"
                        onSubmit={handleLogin}
                    >
                        <p className="text-md mb-2 font-bold text-nowrap text-red md:text-xl xl:text-2xl 2xl:text-3xl">
                            Enter your Username and Password
                        </p>
                        <p className="mb-1 font-bold text-gray">Username</p>
                        <input
                            placeholder="Username"
                            className="mb-2 w-full border border-gray p-2"
                            onChange={(e) =>
                                (usernameRef.current = e.target.value)
                            }
                        />

                        <p className="mb-1 font-bold text-gray">Password</p>
                        <input
                            type="password"
                            placeholder="Password"
                            className="mb-2 w-full border border-gray p-2"
                            onChange={(e) =>
                                (passwordRef.current = e.target.value)
                            }
                        />
                        <div className="flex flex-col">
                            <hr className="my-3 w-full text-gray" />
                            <button
                                className="inline-flex w-full justify-center bg-secondary py-2 hover:cursor-pointer hover:bg-secondary-darken"
                                onClick={handleLogin}
                                type="submit"
                            >
                                <p className="text-lg font-bold text-white">
                                    Login
                                </p>
                            </button>
                            <Link
                                to="/auth/change-password"
                                className="mt-2 text-secondary underline hover:cursor-pointer hover:text-secondary-darken"
                            >
                                Change password?
                            </Link>
                        </div>
                    </form>
                    <div className="my-5 hidden border border-s-0 border-black bg-gray/10 p-3 md:p-5 xl:block xl:w-full xl:px-8">
                        <p className="text-md mb-2 font-bold text-nowrap text-red md:text-xl xl:text-2xl 2xl:text-3xl">
                            Please note
                        </p>
                        <p className="my-1 font-medium text-black">
                            The Login page enables single sign-on to multiple
                            websites at HCMUT. This means that you only have to
                            enter your user name and password once for websites
                            that subscribe to the Login page.
                        </p>
                        <p className="my-1 font-medium text-black">
                            You will need to use your HCMUT Username and
                            password to login to this site. The "HCMUT" account
                            provides access to many resources including the
                            HCMUT Information System, e-mail, ...
                        </p>
                        <p className="my-1 font-medium text-black">
                            For security reasons, please Exit your web browser
                            when you are done accessing services that require
                            authentication!
                        </p>
                        <p className="text-md my-2 font-bold text-nowrap text-red md:text-xl xl:text-2xl 2xl:text-3xl">
                            Technical support
                        </p>

                        <p className="my-1 font-medium text-black">
                            Email:{' '}
                            <a
                                href="mailto:mybk@hcmut.edu.vn"
                                className="text-secondary underline hover:cursor-pointer hover:text-secondary-darken"
                            >
                                ilovecse@hcmut.edu.vn
                            </a>
                        </p>
                        <p className="my-1 font-medium text-black">
                            Tel:{' '}
                            <a className="text-secondary underline hover:cursor-pointer hover:text-secondary-darken">
                                (+84) 903 0B1tEmD@NguCku@
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
