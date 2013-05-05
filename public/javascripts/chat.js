

$(document).ready(function(){
    var socket = io.connect('http://'+window.location.host);

	socket.on('chatIn', function (username, data) {
        $('body').append('<b>'+username + ':</b> ' + data.msg + '<br>');
        $("#single-chat").chatbox("option", "boxManager").addMsg("Mr. Foo", data.msg);
        $("#user-chat").chatbox("option", "boxManager").addMsg(username, data.msg);
		console.log(data);
	}); 

	socket.emit('joinRoom', superGlobal);
	socket.emit('sendChat', { msg: 'User connected!' });
    $("#userId").html(superGlobal);

    //ChatBox Manager
    var counter = 0;
      var idList = new Array();

      var broadcastMessageCallback = function(from, msg) {
          for(var i = 0; i < idList.length; i ++) {
              chatboxManager.addBox(idList[i]);
              $("#" + idList[i]).chatbox("option", "boxManager").addMsg(from, msg);
          }
      }


      // chatboxManager is excerpt from the original project
      // the code is not very clean, I just want to reuse it to manage multiple chatboxes
      chatboxManager.init({messageSent : broadcastMessageCallback});

      $("#link_add").click(function(event, ui) {
          counter ++;
          var id = "box" + counter;
          idList.push(id);
          chatboxManager.addBox(id, 
                                  {dest:"dest" + counter, // not used in demo
                                   title:"box" + counter,
                                   first_name:"First" + counter,
                                   last_name:"Last" + counter
                                   //you can add your own options too
                                  });
          event.preventDefault();
      });
    // Select user to chat with
    $('ul#users li a').click(function(e){
        e.preventDefault();
       e.stopPropagation();
       $("#user-chat").chatbox({
                  user: $(this).html(),
                  title: 'Chat with '+$(this).html(),
                  offset: 250,
                  messageSent: function(id, user, msg){
	                socket.emit('sendChat', { msg: msg, user: user});
                    $("#user-chat").chatbox("option", "boxManager").addMsg(superGlobal, msg);
       }});
    });
    //ChatBox Single
      $("#single-chat").chatbox({
                  user: 'admin',
                  title: 'Single Chat',
                  messageSent: function(id, user, msg){
	                socket.emit('sendChat', { msg: msg, user: user});
      }});
 
});

