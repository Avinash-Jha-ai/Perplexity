import axios from 'axios'


const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
    withCredentials: true,
})


export async function register({ email, username, password }) {
    const response = await api.post("/api/auth/register", { email, username, password })
    return response.data
}

export async function verifyOtp({ email, otp }) {
    const response = await api.post("/api/auth/verify-otp", { email, otp })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    return response.data
}

export async function resendOtp({ email }) {
    const response = await api.post("/api/auth/resend-otp", { email })
    return response.data
}

export async function googleAuth({ credential }) {
    const response = await api.post("/api/auth/google", { credential })
    return response.data
}