const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const config = require('../src/config/defaultConfig');
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname, '../src/template/dir.tpl');
const source = fs.readFileSync(tplPath); // 1.只会执行一次 ; 2. fs读出来的是buffer, 如果想要得到string, 可以 fs.readFileSync(tplPath, 'utf-8');
const template = Handlebars.compile(source.toString()); // compile 需要传入字符串  

module.exports = async function (req, res, filePath) {
    try {
        const stats =await stat(filePath);

        if(stats.isFile()) {
            const contentType = mime(filePath);
            res.statusCode = '200';
            res.setHeader('Content-Type', contentType);

            if(isFresh(stats, req, res)) {
                res.statusCode = 304;
                res.end();
                return;
            }

            let rs;
            const {code, start, end} = range(stats.size, req, res);
            if(code === 200){
                rs = fs.createReadStream(filePath);
            }else {
                res.statusCode = 206;
                rs = fs.createReadStream(filePath, {start, end});
            }
            // begin 压缩 
            if(filePath.match(config.compress)) {
                rs = compress(rs, req, res);
            }
            // over 压缩
            rs.pipe(res);
        }else if(stats.isDirectory()){
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const dir = path.relative(config.root, filePath);
            const data = {
                title: path.basename(filePath),
                dir: dir ? `/${dir}` : '',
                // dir: `/${dir}`, // 访问根目录出错
                files: files.map((file) => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            }
            res.end(template(data));
        }
    } catch (err) {
        console.error(err);
        res.statusCode = '404';
            res.setHeader('Content-Type', 'text/plain');
            res.end(`${filePath} is not a directory or file`);
    }    
}