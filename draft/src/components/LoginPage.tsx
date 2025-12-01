import { useState } from 'react';
import svgPaths from '../imports/svg-zvzkd9pgee';
import imgImage from 'figma:asset/6f8d31165ed17686442a3e4ad430e28054b62993.png';
import imgContainer from 'figma:asset/60c3d24e4f2268475cbc3c46d5f54f55ba2235dd.png';
import { api } from '../utils/api';

interface LoginPageProps {
  onLogin: (role: string, userData: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.login(email, password);
      
      if (!response.success) {
        setError('Invalid HCMUT SSO credentials');
        return;
      }
      
      // SSO authentication succeeded
      if (response.programUser) {
        // User is registered in BK TUTOR program
        onLogin(response.programUser.role, response.programUser);
      } else if (response.ssoUser) {
        // User authenticated but not registered in program - need signup
        onLogin('sso_new', response.ssoUser);
      } else {
        setError('Authentication failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] flex h-screen w-screen overflow-hidden">
      {/* Left Side - Branding */}
      <div className="relative h-full w-[620.8px]">
        <div className="absolute inset-0">
          <div className="absolute bg-[#0f2d52] inset-0" />
          <img 
            alt="" 
            className="absolute max-w-none mix-blend-soft-light object-50%-50% object-cover size-full" 
            src={imgContainer} 
          />
        </div>
        
        {/* Logo Group - BK Icon + BK TUTOR Text */}
        <div className="absolute left-[120px] top-[270px] flex items-center gap-[16px]">
          {/* BK Icon */}
          <div className="w-[80px] h-[86px]">
            <img 
              alt="BK HCMUT Logo" 
              className="max-w-none object-contain pointer-events-none size-full" 
              src={imgImage} 
            />
          </div>
          
          {/* BK TUTOR Text */}
          <div className="w-[206px] h-[30px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 206 30">
              <path d={svgPaths.p1d13b880} fill="white" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="absolute left-[85px] top-[348px] w-[448px]">
          <p className="font-['Arimo',sans-serif] font-normal leading-[36px] text-[30px] text-center text-white">
            Tutor Support System
          </p>
        </div>

        {/* Subtitle */}
        <div className="absolute left-[87px] top-[414px] w-[448px]">
          <p className="font-['Arimo',sans-serif] font-normal leading-[28px] text-[18px] text-center text-[rgba(255,255,255,0.8)]">
            Ho Chi Minh City University of Technology - VNU
          </p>
        </div>

        {/* Description */}
        <div className="absolute left-[86.4px] top-[441.6px] w-[448px]">
          <p className="font-['Arimo',sans-serif] font-normal leading-[24px] text-[16px] text-center text-[rgba(255,255,255,0.6)]">
            Connecting students with expert tutors for academic excellence and personal growth.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center items-center flex-1">
        <div className="w-[448px]">
          {/* SSO Login Card */}
          <div className="bg-white rounded-[12px] border-[0.8px] border-gray-200 p-[32.8px] mb-[24px]">
            <div className="mb-[24px]">
              <h2 className="font-['Arimo',sans-serif] font-normal leading-[32px] text-[24px] text-[#2d3748] mb-[8px]">
                Sign in with HCMUT SSO
              </h2>
              <p className="font-['Arimo',sans-serif] font-normal leading-[24px] text-[16px] text-gray-500">
                Enter your university credentials to continue
              </p>
            </div>

            {error && (
              <div className="mb-[16px] p-[12px] bg-red-50 border border-red-200 rounded-[6px]">
                <p className="font-['Arimo',sans-serif] font-normal text-[14px] text-red-600">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-[16px]">
              <div>
                <label 
                  htmlFor="email" 
                  className="font-['Arimo',sans-serif] font-normal leading-[14px] text-[14px] text-[#2d3748] block mb-[4px]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="yourname@hcmut.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[36px] bg-white border-[0.8px] border-gray-200 rounded-[6px] px-[12px] py-[4px] font-['Arimo',sans-serif] font-normal text-[14px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f2d52] focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="font-['Arimo',sans-serif] font-normal leading-[14px] text-[14px] text-[#2d3748] block mb-[4px]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[36px] bg-white border-[0.8px] border-gray-200 rounded-[6px] px-[12px] py-[4px] font-['Arimo',sans-serif] font-normal text-[14px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0f2d52] focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-[36px] bg-[#0f2d52] hover:bg-[#0f2d52]/90 rounded-[6px] font-['Arimo',sans-serif] font-normal leading-[20px] text-[14px] text-white text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-[20px] text-center">
              <a 
                href="#" 
                className="font-['Arimo',sans-serif] font-normal leading-[20px] text-[14px] text-[#0f2d52] hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Testing Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-['Arimo',sans-serif] text-[14px] text-[#0f2d52] mb-2">🔐 HCMUT SSO Database (67 users):</h3>
            <div className="space-y-1 text-[12px] text-gray-700 font-['Arimo',sans-serif]">
              <p>• Students: student1-26@hcmut.edu.vn (password: 123456789)</p>
              <p>• Tutors: tutor1-26@hcmut.edu.vn (password: 123456789)</p>
              <p>• Chairs: chair1-5@hcmut.edu.vn (password: 123456789)</p>
              <p>• Coordinators: coord1-5@hcmut.edu.vn (password: 123456789)</p>
              <p>• Admins: admin1-5@hcmut.edu.vn (password: admin123)</p>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-[12px] text-green-700 font-semibold mb-1">✅ Pre-registered in BK TUTOR (35 users):</p>
              <p className="text-[11px] text-gray-700">• student1-10, tutor1-10, chair1-5, coord1-5, admin1-5</p>
              <p className="text-[11px] text-orange-600 mt-1">📝 Not registered yet (32 users):</p>
              <p className="text-[11px] text-gray-700">• student11-26, tutor11-26 → Complete signup after SSO login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
