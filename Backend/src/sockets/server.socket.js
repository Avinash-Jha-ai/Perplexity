import { Server } from "socket.io";


let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                const allowedOrigins = [
                    process.env.FRONTEND_URL,
                    "http://localhost:5173",
                ];
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}