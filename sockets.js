var parent = module.parent.exports 
  , app = parent.app
  , server = parent.server
  , config = parent.config
  , User = require('./models/users.js') 
  , mongooseSessionStore = parent.SessionStore
  , express = require('express')
  , parseSignedCookie = require('connect').utils.parseSignedCookie
  , cookie = require('cookie')
  , sio = require('socket.io');


var io = sio.listen(server);

io.configure(function() {
  io.enable('browser client minification');
  io.enable('browser client gzip');
  //node js socketio Unexpected response code: 502
  // http://stackoverflow.com/questions/12569451/unexpected-response-code-502-error-when-using-socket-io-with-appfog
  io.set('transports', ['xhr-polling']);
  //Clear sessions when server starts
  //mongooseSessionStore.clear();
/*
  io.set('authorization', function (data, callback) {
        if(data.headers.cookie) {
            // save parsedSessionId to handshakeData
            data.cookie = cookie.parse(data.headers.cookie);
            data.sessionId = parseSignedCookie(data.cookie['connect.sid'], config.session.secret);
        }
        callback(null, true);
    });
*/
});

//console.log(mongooseSessionStore);

io.sockets.on('connection', function (socket) {
    var sessionId    = socket.handshake.sessionId; //access to the saved data.sessionId on auth

    socket.on('joinRoom', function (room) {
        socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.username = room;
        socket.join(room);
        User.login(socket.username);
        //to all sockets
	    io.sockets.emit('joinedUser', socket.username);
    });

    socket.on('sendChat', function(data){
	    //socket.broadcast.to("room_"+user["_id"]).emit('challenge request', {userChallenging:socket.handshake.userData});
        console.log(data);
        //console.log(socket);
	    socket.broadcast.to(data.user).emit('chatIn', socket.username, data);
        //io.sockets.emit('chatIn', socket.username, data);
	    //socket.broadcast.emit('chatIn', {msg:data.msg});
    });

    socket.on('askUserList', function(data){
        User.find({online:true}, function(err, list){
            socket.emit('receiveUserList', list);
        });
    });

    socket.on('disconnect', function () {
        console.log("Disconnected "+socket.username);                                                                                                                     
        console.log("Sockets in room "+io.sockets.clients(socket.username).length)
        if(io.sockets.clients(socket.username).length==1){
            //Update Status in DB
            User.logout(socket.username);
        }   
        //to all sockets
        io.sockets.emit('logoutUser', socket.username);

    });
});
