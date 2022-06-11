import { argv, stdout } from 'process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, access } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
class FileManager {
  constructor(username) {
    process.on('exit', () => this.exitMessage());
    this.username = username;
    this.pathBase = __dirname + '/' + this.makeDirectory(username);
  }

  init() {
    stdout.write(`Welcome to the File Manager, ${this.username}!\n`);

    this.pathMessage(this.pathBase);
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

  exitMessage() {
    stdout.write(`Thank you for using File Manager, ${this.username}!\n`);
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
