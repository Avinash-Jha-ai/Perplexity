import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            if (!state.chats[ chatId ]) {
                state.chats[ chatId ] = {
                    id: chatId,
                    title,
                    messages: [],
                    lastUpdated: new Date().toISOString(),
                }
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages.push({ content, role })
            }
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages = messages
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        resetChat: (state) => {
            state.chats = {}
            state.currentChatId = null
            state.isLoading = false
            state.error = null
        }
    }
})

export const { setChats, setCurrentChatId, setLoading, setError, createNewChat, addNewMessage, addMessages, resetChat } = chatSlice.actions
export default chatSlice.reducer


// chats = {
//     "docker and AWS": {
//         messages: [
//             {
//                 role: "user",
//                 content: "What is docker?"
//             },
//             {
//                 role: "ai",
//                 content: "Docker is a platform that allows developers to automate the deployment of applications inside lightweight, portable containers. It provides an efficient way to package and distribute software, ensuring consistency across different environments."
//             }
//         ],
//         id: "docker and AWS",
//         lastUpdated: "2024-06-20T12:34:56Z",
//     }

// }

