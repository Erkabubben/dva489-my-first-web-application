var http = require('http');
var fs = require('fs');

var server = http.createServer(async (req, res) => {
    var logMessage = req.method + " " + req.url + " " + req.httpVersion + ' ' + req.headers['content-type'] + ' '

    await req.on('data', (chunk) => {
        console.log(`Received ${chunk.length} bytes of data.`);
        logMessage += chunk
    });
    await req.on('end', () => {
        //console.log('There will be no more data.');
    });

    console.log(logMessage);

    if (req.url.endsWith('.html')) {
        res.setHeader("Content-Type", 'text/html');
    } else if (req.url.endsWith('.css')) {
        res.setHeader("Content-Type", 'text/css');
    } else if (req.url.endsWith('.css')) {
        res.setHeader("Content-Type", 'text/javascript');
    } else if (req.url.endsWith('.ico')) {
        res.setHeader("Content-Type", 'image/x-icon');
    }

    var location = 'public' + req.url

    function getAssociatedController(req) {
        const route = req.method + ";" + req.url
        console.log(route)
        const controllerMethods = {
            'GET;/DisplayHelloWorldFromController': (req, res) => {
                var generatedHTML = '<p>This is an Hello World-message from a controller method!</p>'
                res.writeHead(200);
                res.write(generatedHTML)
                res.end();
            }
        }
        if (controllerMethods.hasOwnProperty(route)) {
            return controllerMethods[route]
        } else {
            return null
        }
    }

    function serveDirectoryListing(location) {
        var dirPaths = []
        var filePaths = []
        var paths = fs.readdirSync(location)
        paths.forEach(path => {
            if (fs.lstatSync(location + '/' + path).isDirectory()) {
                dirPaths.push(path)
            } else {
                filePaths.push(path)
            }
        });
        var generatedHTML = '<p>'
        dirPaths.forEach(element => {
            generatedHTML += element + '/<br>'
        });
        filePaths.forEach(element => {
            generatedHTML += element + '<br>'
        });
        generatedHTML += '</p>'
        res.writeHead(200);
        res.write(generatedHTML)
        res.end();
    }

    function serveFile(location) {
        data = fs.readFileSync(location)
        res.writeHead(200);
        res.end(data);
    }

    var controller = getAssociatedController(req)

    if (controller !== null) {
        controller(req, res)
    } else if (fs.existsSync(location)) {
        if (fs.lstatSync(location).isDirectory()) {
            if (fs.existsSync(location + '/index.html')) {
                serveFile(location + '/index.html')
            } else {
                serveDirectoryListing(location)
            }
        } else {
            serveFile(location)
        }
    }
});

server.listen(8000);
