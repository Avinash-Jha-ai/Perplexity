import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../hook/useAuth'

const VerifyOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [status, setStatus] = useState({ type: '', message: '' })
    const [timer, setTimer] = useState(60)
    const [isResending, setIsResending] = useState(false)
    const { handleVerifyOtp, handleResendOtp } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [manualEmail, setManualEmail] = useState('')
    
    // Read email from state or URL query parameters
    const queryParams = new URLSearchParams(location.search)
    const emailFromParams = queryParams.get('email')
    const email = location.state?.email || emailFromParams || manualEmail

    useEffect(() => {
        let interval = null
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])

        if (element.nextSibling && element.value) {
            element.nextSibling.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const otpCode = otp.join('')
        
        if (otpCode.length < 6) {
            setStatus({ type: 'error', message: 'Please enter all 6 digits' })
            return
        }

        if (!email) {
            setStatus({ type: 'error', message: 'Please provide an email address' })
            return
        }

        try {
            await handleVerifyOtp({ email, otp: otpCode })
            setStatus({ type: 'success', message: 'Email verified successfully! Redirecting to login...' })
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Verification failed' })
        }
    }

    const handleResend = async () => {
        if (timer > 0 || isResending) return

        if (!email) {
            setStatus({ type: 'error', message: 'Email is required to resend OTP' })
            return
        }

        setIsResending(true)
        try {
            await handleResendOtp({ email })
            setStatus({ type: 'success', message: 'A new OTP has been sent to your email.' })
            setTimer(60) // Reset timer
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to resend OTP' })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
                <h1 className="text-3xl font-bold text-[#31b8c6] text-center">Verify Email</h1>
                <p className="mt-4 text-sm text-zinc-300 text-center">
                    {location.state?.email 
                        ? `We've sent a 6-digit code to ${location.state.email}` 
                        : "Enter your email and the 6-digit code we sent you."}
                </p>

                {status.message && (
                    <div className={`mt-6 rounded-lg p-4 text-center text-sm font-medium ${
                        status.type === 'success' ? 'bg-[#31b8c6]/10 text-[#31b8c6]' : 'bg-red-400/10 text-red-400'
                    }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {!location.state?.email && (
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-200">
                            Verification Code
                        </label>
                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onFocus={e => e.target.select()}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-zinc-700 bg-zinc-950/80 outline-none transition focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20"
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] active:scale-[0.98] disabled:opacity-50"
                    >
                        Verify & Continue
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-400">
                    Didn't receive the code?{' '}
                    <button 
                        onClick={handleResend}
                        disabled={timer > 0 || isResending}
                        className={`font-semibold transition ${
                            timer > 0 || isResending 
                                ? 'text-zinc-600 cursor-not-allowed' 
                                : 'text-[#31b8c6] hover:underline'
                        }`}
                    >
                        {isResending ? 'Resending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                    </button>
                </p>
                
                <div className="mt-6 text-center text-sm">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-zinc-400 hover:text-[#31b8c6] transition"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </section>
    )
}

export default VerifyOtp
