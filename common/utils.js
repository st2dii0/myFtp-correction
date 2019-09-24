import chalk from 'chalk'


export function argv(){
    return process.argv.splice(2)
}

export function log(string, color='magenta', withNewLine=true){
    let toReturn = chalk[color](string);
    if(withNewLine){
        console.log(toReturn);
    } else {
        process.stdout.write(toReturn);
    }
}
