const {createGzip, createDeflate} = require('zlib');

module.exports = (rs, req, res) => {
    const acceptEncoding = req.headers['accept-encoding'];
    if(!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
        console.error('--1');
        return rs;
    }else if(acceptEncoding.match(/\bgzip\b/)) {
        res.setHeader('Content-Encoding', 'gzip');
        console.error('--2');        
        return rs.pipe(createGzip());
    }else if(acceptEncoding.match(/\bdeflate\b/)) {
        res.setHeader('Content-Encoding', 'deflate');
        console.error('--3');                
        return rs.pipe(createDeflate());
    }
}