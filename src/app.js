const http = require('http');
const chalk = require('chalk');
const config = require('./config/defaultConfig');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('hello world');
})

server.listen(config.port, config.hostname, () => {
    console.info(chalk.red('server runing on %s', config.port));
})