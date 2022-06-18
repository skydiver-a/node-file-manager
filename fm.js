import { argv, exit, stdin, stdout } from 'process';
import { basename, dirname, extname,
  isAbsolute, resolve } from 'path';
import { fileURLToPath } from 'url';
import { access, constants, copyFile,
  createReadStream, createWriteStream,
  mkdir, rename, readdir, stat,
  writeFile, unlink } from 'fs';
import { arch, cpus, EOL, homedir,
  userInfo } from 'os';
import { createInterface } from 'readline';
import { createHash } from 'crypto';
import { createBrotliCompress,
  createBrotliDecompress } from 'zlib';

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
        this.ls();
        break;
      case ('cat'):
        this.cat(line.split(' ')[1]);
        break;
      case ('add'):
        this.add(line.split(' ')[1]);
        break;
      case ('rn'):
        this.rn(line.split(' ')[1], line.split(' ')[2]);
        break;
      case ('cp'):
        this.cp(line.split(' ')[1], line.split(' ')[2]);
        break;
      case ('mv'):
        this.mv(line.split(' ')[1], line.split(' ')[2]);
        break;
      case ('rm'):
        this.rm(line.split(' ')[1]);
        break;
      case ('os'):
        this.os(line.split(' ')[1]);
        break;
      case ('hash'):
        this.hash(line.split(' ')[1]);
        break;
      case ('compress'):
        this.compress(line.split(' ')[1], line.split(' ')[2]);
        break;
      case ('decompress'):
        this.decompress(line.split(' ')[1], line.split(' ')[2]);
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

  ls() {
    readdir(this.path, { withFileTypes: true }, (error, files) => {
      if (error) throw error;
      if (!files.length) {
        stdout.write(`Directory ${this.path} are empty.\n`);
        this.pathMessage(this.path);
        return;
      } else {
        files.forEach(item => {
          if (item.isDirectory()) {
            stdout.write(`${item.name}\n`);
          }
          if (item.isFile()) {
            const extension = extname(item.name);
            const fileName = basename(item.name, extension);
            stat(resolve(this.path, item.name), (error, element) => {
              if (error) throw error;
              stdout.write(`${fileName}.${extension.slice(1)} - ${element.size}b\n`);
            });
          }
        });
      }
    });
  }

  cat(pathToFile) {
    const absPathToFile = this.path + '/' + pathToFile;
    access(absPathToFile, (error) => {
      if (error) throw error;
    });
    const readStream = createReadStream(absPathToFile, { encoding: 'utf8' });
    readStream.on('data', (chunk) => {
      stdout.write(chunk);
      readStream.destroy();
      stdout.write('\n');
    }).on('end', () => {
        // not been called since we are destroying the stream
        // the first time 'data' event is received
        stdout.write('\n');
    })
    .on('close', (error) => {
        if (error) throw error;
    });
    this.pathMessage(this.path);
    return;
  }

  add(newFileName) {
    const absPathToFile = this.path + '/' + newFileName;
    writeFile(absPathToFile, '', { flag: 'wx' }, (err) => {
      if (err) throw err;
    });
    this.pathMessage(this.path);
    return;
  }

  rn(pathToFile, newFileName) {
    const absPathToFile = this.path + '/' + pathToFile;
    const pathToRename = this.path + '/' + newFileName;
    // if target file doesn't exist
    access(absPathToFile, (err) => {
      if (err) throw err;
    });
    // if new file name already exists
    access(pathToRename, (err) => {
      if (!err) {
        stdout.write(`The file ${newFileName} already exists,\n`);
        stdout.write(`please, try another name.\n`);
        return;
      };
    });

    rename(absPathToFile, pathToRename, (err) => {
      if (err) throw err;
    });
    this.pathMessage(this.path);
    return;
  }

  cp(pathToFile, pathToNewDir) {
    const sourceFile = this.path + '/' + `${pathToFile}`;
    const targetFolder = this.path + '/' + pathToNewDir;
    const targetFile = targetFolder + '/' + `${pathToFile}`;

    // making directory
    this.makeDirectory(targetFolder);
    // reading source directory
    readdir(this.path, {withFileTypes: true}, (err) => {
      if (err) throw err;
    });
    // coping file from source to target
    copyFile(sourceFile, targetFile, (err) => {
      if (err) throw err;
      this.path = targetFolder;
    });
    this.pathMessage(this.path);
    return;
  }

  mv(pathToFile, pathToNewDir) {
    // copy file to directory
    this.cp(pathToFile, pathToNewDir);

    // remove source file
    this.rm(pathToFile);
  }

  rm(pathToFile) {
    const absPathToFile = this.path + '/' + pathToFile;
    // if source folder doesn't exist
    readdir(this.path, {withFileTypes: true}, (err) => {
      if (err) throw err;
    });
    // if source file doesn't exist
    access(absPathToFile, (err) => {
      if (err) throw err;
    });
    // delete file
    unlink(absPathToFile, (err) => {
      if (err) throw err;
    });
    this.pathMessage(this.path);
    return;
  }

  os(command) {
    switch (command) {
      case ('--EOL'):
        stdout.write(JSON.stringify(EOL));
        stdout.write('\n');
        break;
      case ('--cpus'):
        stdout.write(`${cpus().length}`);
        stdout.write('\n');
        cpus().forEach(item => {
          stdout.write(`${item.model}\n`);
        });
        break;
      case('--homedir'):
        stdout.write(homedir());
        stdout.write('\n');
        break;
      case('--username'):
        stdout.write(userInfo().username);
        stdout.write('\n');
        break;
      case('--architecture'):
        stdout.write(arch());
        stdout.write('\n');
        break;
      default:
        stdout.write(`No such command, try again.\n`);
        break;
    }
  }

  hash(pathToFile) {
    const absPathToFile = this.path + '/' + pathToFile;
    const readStream = createReadStream(absPathToFile);
    const hashSum = createHash('sha256').setEncoding('hex');

    readStream.on('end', () => {
      hashSum.end();
      stdout.write(hashSum.read());
      stdout.write('\n');
    });

    readStream.pipe(hashSum);
    return;
  }

  async compress(pathToFile, pathToDestination = '') {
    const absPathToFile = this.path + '/' + pathToFile;
    // if file which must be compressed doesn't exist
    access(absPathToFile, constants.F_OK, (err) => {
      if (err) {
        stdout.write(`File ${pathToFile} doesn't exist, \n`);
        stdout.write(`please, try again.\n`);
        return;
      }
    });
    // if directory in which compressed file will be doesn't exist
    const destination = this.path + '/' + pathToDestination;
    access(destination, err => {
      if (err) {
        mkdir(destination, err => {
          if (err) throw err;
          return this.promiseCompress(absPathToFile, destination, pathToFile);
        });
      } else {
        return this.promiseCompress(absPathToFile, destination, pathToFile);
      }
    });
  }

  promiseCompress(absPathToFile, destination, pathToFile) {
    // create streams
    return new Promise((resolve, reject) => {
      const input = createReadStream(absPathToFile, 'utf-8');
      const output = createWriteStream(destination + '/' + pathToFile + '.br');
      const compress = createBrotliCompress();
      // create pipe
      input.pipe(compress).pipe(output);
      output.on('finish', () => {
        resolve();
      });
      output.on('error', err => reject(err));
      this.path = destination;
      this.pathMessage(this.path);
    });
  }

  async decompress(pathToFile, pathToDestination = '') {
    const absPathToFile = this.path + '/' + pathToFile;
    // if file which must be decompressed doesn't exist
    access(absPathToFile, constants.F_OK, (err) => {
      if (err) {
        stdout.write(`File ${pathToFile} doesn't exist, \n`);
        stdout.write(`please, try again.\n`);
        return;
      }
    });

    // if directory in which decompressed file will be doesn't exist
    const destination = this.path + '/' + pathToDestination;
    access(destination, err => {
      if (err) {
        mkdir(destination, err => {
          if (err) throw err;
          return this.promiseDecompress(absPathToFile, destination, pathToFile);
        });
      } else {
        return this.promiseDecompress(absPathToFile, destination, pathToFile);
      }
    });
  }

  promiseDecompress(absPathToFile, destination, pathToFile) {
    // create streams
    return new Promise((resolve, reject) => {
      const input = createReadStream(absPathToFile);
      const output = createWriteStream((destination + '/' + pathToFile).split('.br')[0]);
      const decompress = createBrotliDecompress();
      // create pipe
      input.pipe(decompress).pipe(output);
      output.on('finish', () => {
        resolve();
      });
      output.on('error', err => reject(err));
      this.path = destination;
      this.pathMessage(this.path);
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
