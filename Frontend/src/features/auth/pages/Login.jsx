import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { GoogleLogin } from '@react-oauth/google'


const Login = () => {
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin, handleGoogleAuth } = useAuth()

    const navigate = useNavigate()

    const [message, setMessage] = useState('')

    const submitForm = async (event) => {
        event.preventDefault()
        setMessage('')

        const payload = {
            email,
            password,
        }

        try {
            await handleLogin(payload)
            navigate("/")
        } catch (err) {
            const errMsg = err.response?.data?.message || "Login failed"
            setMessage(errMsg)
            console.error("Login failed:", err)
        }
    }

    const onGoogleSuccess = async (response) => {
        try {
            await handleGoogleAuth({ credential: response.credential });
            navigate("/");
        } catch (err) {
            console.error("Google login failed", err);
            setMessage("Google login failed. Please try again.");
        }
    };

    if(!loading && user){
        return <Navigate to="/" replace />
    }

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
                    <h1 className="text-3xl font-bold text-[#31b8c6]">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Sign in with your email and password.
                    </p>

                    {message && (
                        <div className="mt-6 rounded-lg bg-red-400/10 p-4 text-center text-sm font-medium text-red-400">
                            {message}
                            {message.toLowerCase().includes("verify") && (
                                <div className="mt-2">
                                    <button 
                                        onClick={() => navigate('/verify-otp', { state: { email } })}
                                        className="text-[#31b8c6] hover:underline"
                                    >
                                        Click here to verify now
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={submitForm} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)]"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={onGoogleSuccess}
                                onError={() => {
                                    console.log('Login Failed');
                                    setMessage("Google login failed. Please try again.");
                                }}
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="344"
                            />
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]">
                            Register
                        </Link>
                    </p>

                    <div className="mt-4 text-center">
                        <Link to="/verify-otp" className="text-xs text-zinc-500 hover:text-[#31b8c6] transition underline-offset-4 hover:underline">
                            Didn't verify your email yet? Click here
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login