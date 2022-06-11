import { argv, stdin, stdout, exit } from 'process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, access } from 'fs';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const readLines = createInterface({
  input: stdin,
  output: stdout
});

class FileManager {
  constructor(username) {
    process.on('exit', () => this.exitMessage(username));
    this.username = username;
    this.pathBase = __dirname + '/' + this.makeDirectory(username);
    this.readLines = readLines.on('line', (line) => this.readCommandLine(line));
  }

  init() {
    stdout.write(`Welcome to the File Manager, ${this.username}!\n`);

    this.pathMessage(this.pathBase);
  }

  readCommandLine(line) {
    switch (line.split(' ')[0]) {
      case ('up'):
        break;
      case ('cd'):
        break;
      case ('ls'):
        break;
      case ('cat'):
        break;
      case ('add'):
        break;
      case ('rn'):
        break;
      case ('cp'):
        break;
      case ('mv'):
        break;
      case ('rm'):
        break;
      case ('os'):
        break;
      case ('hash'):
        break;
      case ('compress'):
        break;
      case ('decompress'):
        break;
      case ('exit'):
        this.exit();
        break;
      default:
        stdout.write('Invalid input. Please try again.');
        break;
    }
  }

  exit() {
    this.readLines.close();
    exit(0);
  }

  makeDirectory(dir) {
    access(dir, (error) => {
      if (error) {
        mkdir(dir, (error) => {
          if (error) throw error;
        });
      }
    });
    return `${dir}`;
  }

  pathMessage(path) {
    stdout.write(`You are currently in ${path}\n`);
  }

  exitMessage(username) {
    stdout.write(`Thank you for using File Manager, ${username}!\n`);
  }
}

argv.slice(2).forEach(item => {
      if (item.slice(0, 11) === '--username=') {
        const fm = new FileManager(item.slice(11, item.length));
        fm.init();
      } else {
        stdout.write('Please enter a username.')
        exit();
      }
    });
