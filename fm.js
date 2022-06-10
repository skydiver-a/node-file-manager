import { argv, stdout } from 'node:process';

class FileManager {
  constructor(username) {
    process.on('exit', () => this.exitMessage());
    this.username = username;
  }

  init() {
    stdout.write(`Welcome to the File Manager, ${this.username}!\n`)
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
