const {cache} = require('../src/config/defaultConfig');

function refreshRes(stats, res) {
    const {maxAge, expires, cacheControl, lastModified, etag} = cache;

    if(expires) {
        let val = (new Date(Date.now() + maxAge * 1000)).toUTCString();
        console.warn("expires: ", val);
        res.setHeader('Expires', val);
    }
    if(cacheControl) {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    if(lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString());
    }
    if(etag) {
        res.setHeader('ETag', `${stats.size}-${stats.mtime}`);
    }
}

// module.export = (stats, req, res) => {
//     refreshRes();
// }
module.exports = function isFresh(stats, req, res) {
    refreshRes(stats, res);

    const lastModified = req.headers['if-modified-since']; // 小写
    const etag = req.headers['if-none-match'];
    
    // if(!lastModified || lastModified !== res.getHeader('Last-Modified')) {
    //     return false;
    // }
    // if(!etag || etag != res.getHeader('ETag')) {
    //     return false;
    // }
    if(!lastModified && !etag) {
        return false;
    }

    if(lastModified && lastModified !== res.getHeader('Last-Modified')) {
        return false;
    }

    if(etag && etag !== res.getHeader('ETag')) {
        return false;
    }

    return true;
}