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
    const email = location.state?.email

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

    if (!email) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100 px-4">
                <div className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur">
                    <h2 className="text-xl font-semibold mb-4 text-red-400">Invalid Session</h2>
                    <p className="mb-6">Please register again to receive a new OTP.</p>
                    <button 
                        onClick={() => navigate('/register')}
                        className="px-6 py-2 bg-[#31b8c6] text-zinc-950 font-semibold rounded-lg hover:bg-[#45c7d4] transition"
                    >
                        Go to Register
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
                <h1 className="text-3xl font-bold text-[#31b8c6] text-center">Verify OTP</h1>
                <p className="mt-4 text-sm text-zinc-300 text-center">
                    We've sent a 6-digit code to <span className="text-[#31b8c6] font-medium">{email}</span>.
                    Enter it below to verify your account.
                </p>

                {status.message && (
                    <div className={`mt-6 rounded-lg p-4 text-center text-sm font-medium ${
                        status.type === 'success' ? 'bg-[#31b8c6]/10 text-[#31b8c6]' : 'bg-red-400/10 text-red-400'
                    }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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
            </div>
        </section>
    )
}

export default VerifyOtp

