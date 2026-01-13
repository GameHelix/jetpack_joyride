'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MdEmail, MdLock } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

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

            <p className="text-right text-sm text-gray-400 cursor-pointer hover:text-indigo-600">
              Forget Password?
            </p>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-3/5 mx-auto bg-[#F95B0E] hover:bg-[#d94f0c] text-white h-12 rounded-xl text-lg font-medium mt-4 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
      </div>
    </div>
  );
}
