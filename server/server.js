import net from 'net'


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
                if (data === 'HELP'){
                    this.help(socket);
                }
            })
        });
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
}


let ftpServer = new FtpServer();
ftpServer.start();