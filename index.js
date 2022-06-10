const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoute")
const socket = require("socket.io")

const app = express()

require("dotenv").config()

app.use(cors());
app.use(express.json())

app.use("/api/auth", userRoutes)

app.use("/api/messages", messageRoute)

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("DB Connected!!")
}).catch((error)=> {
    console.log(error.message)
})

const server = app.listen(process.env.PORT,()=> {
    console.log(`Server started on port ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
})

global.onlineUsers = new Map()
//Store online users inside the map
io.on("connection",(socket)=>{
    console.log('a user connected')
    global.chatSocket= socket;
    //we store connection with global.chatsocket
    socket.on('add-user',(userId)=>{
        onlineUsers.set(userId, socket.id)
    })
    // Whenever we have socket on send message we grab the data then send with sendUserSocket
    socket.on("send-msg",(data)=>{
        console.log("sendmsg", {data})
        const sendUserSocket = onlineUsers.get(data.to)
        //If user is online send socket // emit helps pass data // if not online it will be stared on database 
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message)
        }
    })
})