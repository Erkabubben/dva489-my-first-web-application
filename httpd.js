var http = require('http');
var fs = require('fs');

var server = http.createServer((req, res) => {
    console.log(req.method + " " + req.url + " " + req.httpVersion);

    var contentTypes = {
        '.html': 'text/html',
        '.css': "text/css",
        '.js': 'application/javascript'
    };

    fs.readFile('public' + req.url, function(err, data) {
        if (err) {
            res.writeHead(404);
            return res.end("File not found.");
        }

    if (req.url.endsWith('.html')) {
        res.setHeader("Content-Type", 'text/html');
    }
    else if (req.url.endsWith('.css')) {
        res.setHeader("Content-Type", 'text/css');
    }
    else if (req.url.endsWith('.css')) {
        res.setHeader("Content-Type", 'text/javascript');
    }
    res.writeHead(200);
    res.end(data);
    });
});

server.listen(8000);
