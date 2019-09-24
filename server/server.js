import net from 'net'
import dbUser from '../config/db.json'

class Server {

    create(port, callback){
        let instance = net.createServer(callback);

        instance.on('error', (e) => {
            console.error(e);
        })

        instance.on('close', () => {
            console.log('server closed')
        })

        instance.listen(port, () => {
            console.log(`This server is listening on ${port} port`);
        });
    }
}

class FtpServer extends Server {

    constructor(){
        super();
        this.port = 2121;
    }

    start(){
        super.create(this.port, (socket) => {
            console.log("socket connected");
            socket.setEncoding('ascii');
            socket.on('close', () => {
                console.log("socket disconnected.")
            })

            socket.on('data', (data) => {
                data = data.trim();
                let [cmd, ...args] = data.split(' ');
                cmd = cmd.toUpperCase();
                if (cmd === 'HELP'){
                    this.help(socket);
                } else if (cmd === 'QUIT') {
                    this.quit(socket);
                } else if (cmd === 'USER') {
                    this.user(socket, args[0]);
                } else if (cmd === 'PASS') {
                    this.pass(socket, args[0])
                }
            })
        });
    }

    quit(socket) {
        socket.end();
    }

    help(socket){
        const str = `
        This server configuration let you use this command :
          -  USER 
          -  PASS 
          -  LIST
          -  CWD
          -  RETR 
          -  STOR 
          -  PWD
          -  HELP
          -  QUIT
          `;
        socket.write(str);
    }

    user(socket, username) {
        const user = dbUser.find(user => user.username === username);
        if (!user){
            socket.write("Need an account to login")
        } else {
            socket.session = {
                username,
                isConnected: false
            }
            socket.write(`Username <${username}> ok -- need password`);

        }
    }

    pass(socket, password) {
        if (!socket.session){
            socket.write("enter user first");
            return
        }
        const user = dbUser.find(user => socket.session.username === user.username);

        if (user.password === password){
            socket.session.isConnected = true;
            socket.write("Password accepted, you're logged")
        } else {
            socket.write("Password rejected, administrators will be notified");
        }
    }
}


let ftpServer = new FtpServer();
ftpServer.start();