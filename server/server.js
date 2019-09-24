import net from 'net'
import dbUser from '../config/db.json'
import path from 'path'
import fs from 'fs'
import { isAllowedCommand, isAllowLoggedCommands } from '../common/utils'


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
        this.ROOT_FTP_DIRECTORY = '/tmp';
    }

    start(){
        super.create(this.port, (socket) => {
            console.log("socket connected");
            socket.setEncoding('ascii');
            socket.on('close', () => {
                console.log("socket disconnected.")
            })

            socket.on('data', (data) => {
                //TODO create command directory and use index.js

                data = data.trim();
                let [cmd, ...args] = data.split(' ');
                cmd = cmd.toLowerCase();

                if((!socket.session || !socket.session.isConnected) && !isAllowedCommand(cmd)){
                    socket.write(`This command is not implemented or you need to be logged to use ${cmd}`);
                    return
                }
                if (!isAllowLoggedCommands(cmd)){
                    socket.write(`This command is not implemented: <${cmd}>`);
                    return
                }

                this[cmd](socket, ...args)

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
            this.checkDir(socket, user.username);
            socket.write("Password accepted, you're logged")
        } else {
            socket.write("Password rejected, administrators will be notified");
        }
    }

    pwd(socket){
        socket.write(socket.session.pwd);
    }

    checkDir(socket, username) {
        const tmpPath = path.join(this.ROOT_FTP_DIRECTORY, username);
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);

        }
        socket.session.directory = tmpPath;
        socket.session.pwd = `/${username}`;
    }
}


let ftpServer = new FtpServer();
ftpServer.start();