import { useDispatch } from "react-redux";
import { register, verifyOtp, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";
import { resetChat } from "../../chat/chat.slice";


export function useAuth() {


    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            const data = await register({ email, username, password })
            return data
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleVerifyOtp({ email, otp }) {
        try {
            dispatch(setLoading(true))
            const data = await verifyOtp({ email, otp })
            return data
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "OTP verification failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return data
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true));
            await logout();
            dispatch(setUser(null));
            dispatch(resetChat());
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Logout failed"));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleVerifyOtp,
        handleLogin,
        handleGetMe,
        handleLogout,
    }

}