    var getOffsetWin = function(){
        console.log(250*($("div[id*=user-chat-]:visible").size()-1));    
        return 250*($("div[id*=user-chat-]:visible").size()-1);    
    }
    var closedWin = function(){
        //Re arrange windows
        $("div[id*=user-chat-]:visible").each(function(i,v){ //console.log(i,v)
           $(this).chatbox("option", "offset", 250*i)
        })
		//$("#" + showList[i]).chatbox("option", "offset", offset - diff);
    }

jQuery(document).ready(function(){
    if(typeof superGlobal!="undefined"){
    var port = (window.location.port=="")?":80":"";
    var socket = io.connect('http://'+window.location.host+port,{'sync disconnect on unload': true });

    //Receive chat
	socket.on('chatIn', function (username, data) {
		console.log('chatIn>>',data);
        //$('body').append('<b>'+username + ':</b> ' + data.msg + '<br>');
        //$("#single-chat").chatbox("option", "boxManager").addMsg("Mr. Foo", data.msg);

        //If the chat window is not open
        $('ul#users li a').each(function(i,v){
            if($(v).attr('data-idusr')==username){
                $(this).click();    
            }    
        });
        console.log("++",$("div[id*=user-chat-]:visible").size())
        var size = ($("div[id*=user-chat-]:visible").size()==1)?0:$("div[id*=user-chat-]:visible").size();
        $("#user-chat-"+username).chatbox("option", "offset", 250*size)
        $("#user-chat-"+username).chatbox("option", "boxManager").addMsg(data.name.split(" ")[0].substring(0,10)||username, data.msg);

	}); 

    //new user joins
	socket.on('joinedUser', function (username) {
		console.log('joinedUser>>',username);
        $('ul#users li a').each(function(i,v){
            if($(v).attr('data-idusr')==username){
                $(this).addClass('online');    
            }    
        });
	}); 

    //user left the site
	socket.on('logoutUser', function (username) {
		console.log('joinedUser>>',username);
        $('ul#users li a').each(function(i,v){
            if($(v).attr('data-idusr')==username){
                $(this).removeClass('online');    
            }    
        });
	}); 

    // Join Room
	socket.emit('joinRoom', superGlobal);
	//socket.emit('sendChat', { msg: 'User connected!' });
    //$("#userId").attr('data-idusr'superGlobal);

    //ChatBox Manager
    var counter = 0, idList = new Array();

      var broadcastMessageCallback = function(from, msg) {
          console.log("broadcast called",from,msg);
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
    $('ul#users li a').live("click",function(e){
       e.preventDefault();
       e.stopPropagation();
       if($("#user-chat-"+$(this).attr('data-idusr')).size()==0){
           console.log($("#user-chat-"+$(this).attr('data-idusr')))
            $("body").append("<div id='user-chat-"+$(this).attr('data-idusr')+"' data-idusr='"+$(this).attr('data-idusr')+"'></div>")
            $("body").find("#user-chat-"+$(this).attr('data-idusr')).chatbox({
                  user: $(this).html().replace(/<img.*>/,""),
                  id: $(this).attr('data-idusr'),
                  title: $(this).html(),
                  offset: getOffsetWin,
			      boxClosed : closedWin,
                  messageSent: function(id, user, msg){
                    console.log(">>>", id);
	                socket.emit('sendChat', { msg: msg, user: id, name: currentUserName});
                    $("#user-chat-"+id).chatbox("option", "boxManager").addMsg("Me", msg);
            }});
       }else{
           
           //$(this).chatbox("option", "offset", 250*$("div[id*=user-chat-]:visible").size())
           /*
           console.log("re-arrange", $("#user-chat-"+$(this).attr('data-idusr')))
           $("#user-chat-"+$(this).attr('data-idusr')).show();
           */
            console.log("already exist");
            var size = ($("div[id*=user-chat-]:visible").size()==1)?0:$("div[id*=user-chat-]:visible").size();
            $("#user-chat-"+$(this).attr('data-idusr')).show().parent().show().parent().show();//.chatbox("option", "offset", 250*size);
            $("div[id*=user-chat-]:visible").each(function(i,v){ //console.log(i,v)
               $(this).chatbox("option", "offset", 250*i)
            });
       }
    });
    console.log("ready loaded")
    }
});

