/**
 * Created by autoc on 03/09/2017.
 */
let WebServer = {
	defaults:function(){
		this.express = require('express');
		this.http = require('http');
		this.io = require('socket.io');
	},
	initialize:function(){
		this.defaults();
		this.staticServer = this.createServer('/out/',8080);
		this.setupSocket();
	},
	createServer:function(directory,port){
		let serverObject={};
		serverObject.app=this.express();
		serverObject.server=this.http.createServer(serverObject.app);
		serverObject.socket=this.io(serverObject.server);
		serverObject.app.use(this.express.static(__dirname + directory));
		serverObject.app.get('/', function(req,res) {
			res.sendFile(__dirname + directory +'/index.html');
		});
		serverObject.server.listen(port);
		return serverObject;
	},
	getPlayers:function(room_id){
		let room = this.staticServer.socket.sockets.adapter.rooms[room_id];
		if(room){
			return Object.keys(room.sockets)
				.map((key)=>{
					return {
						position:sockets[key].game_position,
						name:sockets[key].game_name,
						moderator:sockets[key].game_moderator,
						user_id:sockets[key].game_user_id
					}
				});
		}

	},
	setupSocket:function(){
		this.staticServer.socket.on('connection',socket=>{
			socket.on('take-seat',message=>{
				socket.join(message.room_id);
				let game_sockets = this.staticServer.socket.sockets.adapter.rooms[message.room_id].sockets;
				if(Object.keys(game_sockets)
						.map(key=>{
							return game_sockets[key].game_position;
						})
						.indexOf(message.position)===-1){
					socket.game_position = message.position;
					socket.game_room = message.room_id;
					socket.game_name = message.name;
					socket.game_moderator = message.moderator;
					socket.game_user_id = message.user_id;
					socket.emit('seat-taken',socket.id);
					console.log('seat-taken','room:',socket.game_room,'socketId:',socket.id,'position:',message.position,'userId:',message.user_id);
				}else{
					socket.emit('seat-unavailable',{position:message.position});
					console.log('seat-unavailable','room:',socket.game_room,'socketId:',socket.id,'position:',message.position,'userId:',message.user_id);
				}
			});
			socket.on('leave-seat',()=>{
				socket.leave(socket.game_room);
				console.log('leave-seat','room:',socket.game_room,'socketId:',socket.id,'position:',socket.game_position,'userId:',socket.game_user_id);
				delete socket.game_room;
				delete socket.game_position;
				this.staticServer.socket.to(socket.game_room).emit('players',this.getPlayers(socket.game_room));
				//this.staticServer.socket.sockets.broadcast.emit('players',this.getPlayers());
			});
			socket.on('get-players',()=>{
				socket.emit('players',this.getPlayers());
			});
			socket.on('disconnect',()=>{
				this.staticServer.socket.to(socket.game_room).emit('players',this.getPlayers(socket.game_room));
			})
		});
	}
};
WebServer.initialize();