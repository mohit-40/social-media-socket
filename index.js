const http = require("http");
const express = require("express");
const port = process.env.PORT || 8900;
const app = express();
const  server = http.createServer(app);

//using middleware
app.use(express.json());


/* ------------------------------------ . ----------------------------------- */
const io= require('socket.io')(server,{cors:{origin:"http://localhost:3000"}});
let users=[]
const addUser=(userId,socketId)=>{
	!users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
}
const removeUser=(socketId)=>{
	users=users.filter((user)=> user.socketId!==socketId)
}
const getUser=(userId)=> users.find((user)=> user.userId===userId)

io.on("connection",(socket)=>{
	console.log("A New User is connected to socket io") 
	socket.on("addUser",(userId)=>{
		console.log("userAdded");
		addUser(userId,socket.id)
		io.emit("getUsers",users)
	})
	socket.on("removeUser",(userId)=>{
		console.log("userRemoved")
		const user=getUser(userId);
		user && removeUser(user.socketId);
		io.emit("getUsers",users);
	})
	socket.on("disconnect",()=>{
		console.log("disconnected and user removed")
		removeUser(socket.id);
		io.emit("getUsers",users)
	})
	socket.on("sendMessage",({body,receiverId})=>{
		console.log(body);
		const receiver = getUser(receiverId);  
		io.to(receiver?.socketId).emit('getMessage',body)
	})
	socket.on("sendNotification" , ({senderId , receiverId , type ,text})=>{
		console.log(type);
		const receiver = getUser(receiverId)
		if(senderId !== receiverId){
			io.to(receiver?.socketId).emit("getNotification" , {senderId , receiverId , type, text} )
		}
	})

})


/* ------------------------------------ . ----------------------------------- */

server.listen(port,"0.0.0.0", () => {
	console.log("server started on port " +port );
});