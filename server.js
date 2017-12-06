var WebSocketServer = require('ws').Server,
uuid = require('node-uuid'),
wss = new WebSocketServer({ port: 8181 });
var clientIndex = 1;
var clients = [];
wss.on('connection', function(ws) {
    var client_uuid = uuid.v4();
    var nickname = "AnonymousUser" + clientIndex;
    clientIndex += 1;
    clients.push({ "id": client_uuid, "ws": ws, "nickname": nickname });
    console.log('client [%s] connected', client_uuid);
    var connect_message = nickname + " has connected";
    wsSend("notification", client_uuid, nickname, connect_message);
    console.log('client [%s] connected', client_uuid);
    ws.on('message', function(message) {
        if (message.indexOf('/nick') === 0) {
            var nickname_array = message.split(' ');
            if (nickname_array.length >= 2) {
                var old_nickname = nickname;
                nickname = nickname_array[1];
                var nickname_message = "Client " + old_nickname + " changed to " + nickname;
                wsSend("nick_update", client_uuid, nickname, nickname_message);
            }
        } else {
            console.log(message);
            wsSend("message", client_uuid, nickname, message);
        }
    });
});

function wsSend(type, client_uuid, nickname, message) {
    for (var i = 0; i < clients.length; i++) {
        var clientSocket = clients[i].ws;
        if (clientSocket.readyState === 1) {
            clientSocket.send(JSON.stringify({
                "type": type,
                "id": client_uuid,
                "nickname": nickname,
                "message": message
            }));
        }
    }
}