'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MdEmail, MdLock } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Link from 'next/link';

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#5C2482] to-white">

      {/* LEFT SIDE */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-no-repeat bg-center bg-cover rounded-br-[100px]"
           style={{ backgroundImage: "url('/assets/rectangle_left.png')" }}>
        <img src="/login.png" className="w-3/5 h-3/5 object-contain" alt="Login" />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white rounded-tl-[100px] p-8">

        <h1 className="text-[#5C2482] text-4xl font-semibold mb-10">
          Welcome!
        </h1>

        <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-6">

          {error && (
            <div className="text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-[#5C2482] font-medium">Email</label>
            <div className="relative flex items-center">
              <MdEmail className="absolute left-3 text-[#5C2482] text-xl" />
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full h-12 border border-gray-300 rounded-xl pl-10 pr-4 text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="text-[#5C2482] font-medium">Password</label>
            <div className="relative flex items-center">
              <MdLock className="absolute left-3 text-[#5C2482] text-xl" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                className="w-full h-12 border border-gray-300 rounded-xl pl-10 pr-10 text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {showPassword ? (
                <AiOutlineEye
                  className="absolute right-3 text-[#5C2482] text-xl cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="absolute right-3 text-[#5C2482] text-xl cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <Link
                  href="/auth/forgot-password"
                  className="text-right text-xs sm:text-sm text-[#5C2482] hover:text-[#7B3FA3] transition font-medium"
                >
                  Forgot Password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-3/5 mx-auto bg-[#F95B0E] hover:bg-[#d94f0c] text-white h-12 rounded-xl text-lg font-medium mt-4 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <section className="py-6 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center space-y-4 text-sm">

              <div>
                <span className="text-black font-bold text-lg">Demo Accounts: Temporary</span>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-left">
                
                <div className="min-w-[150px]">
                  <span className="font-bold text-[#5C2482]">Admin:</span> 
                  <span className="text-gray-700 ml-1">admin@educy.com / admin123</span>
                </div>

                <div className="min-w-[150px]">
                  <span className="font-bold text-[#F95B0E]">Instructor:</span> 
                  <span className="text-gray-700 ml-1">alice.instructor@educy.com / instructor123</span>
                </div>

                <div className="min-w-[150px]">
                  <span className="font-bold text-green-600">Moderator:</span> 
                  <span className="text-gray-700 ml-1">moderator@educy.com / moderator123</span>
                </div>

                <div className="min-w-[150px]">
                  <span className="font-bold text-blue-600">Student:</span> 
                  <span className="text-gray-700 ml-1">bob.student@educy.com / student123</span>
                </div>

              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
    
  );
  
}