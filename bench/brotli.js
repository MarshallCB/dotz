var brotliSize = require('brotli-size');
var fs = require('fs')
var path = require('path')

let str = fs.readFileSync(path.join(process.cwd(),'es.js'))

console.log("Brotli size: " + brotliSize.sync(str))