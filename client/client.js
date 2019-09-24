import net from 'net'
import { argv, log } from '../common/utils'
import readlLine from 'readline'

class FtpClient {
    constructor(host, port){
        this.host = host;
        this.port = port;
    }

    connect(){
        this.socket = net.createConnection({
            port: this.port,
            host: this.host
        }, () => {
            log('client connected', "cyan");
            this.prompt();

        })
        this.socket.on('data', (data) => {
            log(data.toString(), "yellow")
            this.prompt();
        })
    }

    prompt(){
        log(">>> ", "white", false);
        const rl = readlLine.createInterface({
            input: process.stdin
        });
        rl.on('line', (input) => {
            this.socket.write(input)
            rl.close();
        });

    }


}

const args = argv();
if (args.length != 2){
    log("Usage: client.js <host> <port>", "cyan");
    process.exit(0)
}

const [host, port] = args

const client = new FtpClient(host, port)
client.connect()