import { argv, stdin, stdout, exit } from 'process';
import { dirname, resolve, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, access } from 'fs';
import { lstat } from 'node:fs/promises';
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
    this.path = '';
    this.pathBase = __dirname + '/' + this.makeDirectory(username);
    this.readLines = readLines.on('line', (line) => this.readCommandLine(line));
  }

  init() {
    stdout.write(`Welcome to the File Manager, ${this.username}!\n`);

    this.pathMessage(this.pathBase);
    this.path = this.pathBase;
  }

  readCommandLine(line) {
    switch (line.split(' ')[0]) {
      case ('up'):
        this.up();
        break;
      case ('cd'):
        this.cd(line.split(' ')[1]);
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
        stdout.write('Invalid input. Please try again.\n');
        break;
    }
  }

  up() {
    if (this.path !== this.pathBase) {
      this.path = resolve(this.path, '..');
      this.pathMessage(this.path);
    } else {
      stdout.write('You are in the root directory. Please try another command.\n');
    }
  }

  cd(pathToDir) {
    // if path is absolute
    if (isAbsolute(pathToDir)) {
      // and contains path to the base directory
      if (pathToDir.includes(this.pathBase)) {
        this.isExist(pathToDIr);
      } else {
        stdout.write('Invalid directory path. Please try again.\n');
      }
    } else {
      const pathArray = pathToDir.split('/');
      let createPath = this.path;
      pathArray.forEach(folder => {
        createPath += '/' + folder;
      });
      this.isExist(createPath);
    }
  }

  isExist(pathToDir) {
    access(pathToDir, (error) => {
      if (error) {
        stdout.write(`No such directory: ${pathToDir},\n`);
        stdout.write(`make directory first.\n`);
        this.pathMessage(this.path);
        return;
      }
      // update path to current directory
      this.path = pathToDir;
      this.pathMessage(pathToDir);
    });
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
        stdout.write('Please enter a username: ')
        exit();
      }
    });
