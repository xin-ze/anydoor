const http = require('http');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const config = require('./config/defaultConfig');

const server = http.createServer((req, res) => {
    console.info('== ', req.url);

    const filePath = path.join(config.root, req.url);

    fs.stat(filePath, (err, stats) => {
        if(err) {
            res.statusCode = '404';
            res.setHeader('Content-Type', 'text/plain');
            res.end(`${filePath} is not a directory or file`);
            return;            
        }
        if(stats.isFile()) {
            res.statusCode = '200';
            res.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(filePath).pipe(res);
            // res.end()    // me error
        }else if(stats.isDirectory()){
            // me error
            // res.statusCode = '200';
            // res.setHeader('Content-Type', 'text/plain');
            // fs.readdir(filePath, (err, files) => {
            //     res.end(files);
            // })
            fs.readdir(filePath, (err, files) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end(files.join(','));
            })
        }

    })

    
})

server.listen(config.port, config.hostname, () => {
    const addr = `http://${config.hostname}:${config.port}`;
    console.info(`Server started at ${chalk.green(addr)}`)
})