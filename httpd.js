var http = require('http')
var fs = require('fs')
var url = require('url');

var server = http.createServer(async (req, res) => {
    var logMessage = req.method + " " + req.url + " " + req.httpVersion + ' ' + req.headers['content-type'] + ' '

    await req.on('data', (chunk) => {
        logMessage += chunk
    })
    await req.on('end', () => {})

    console.log(logMessage)

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
        const route = req.method + ";" + req.url.split('?')[0]
        const anyMethodRoute = 'ANY;' + req.url.split('?')[0]
        console.log(route)
        const controllerMethods = {
            'GET;/DisplayHelloWorldFromController': (req, res) => {
                var generatedHTML = '<p>This is an Hello World-message from a controller method!</p>'
                res.writeHead(200)
                res.write(generatedHTML)
                res.end()
            },
            'ANY;/information': (req, res) => {
                const data = fs.readFileSync('templates/information.template', { encoding: 'utf8' })
                console.log(data)
                var modifiedTemplate = String(data).replace('{{method}}', req.method)
                var splitUrl = req.url.split('?')
                modifiedTemplate = modifiedTemplate.replace('{{path}}', splitUrl[0])
                if (splitUrl.length > 1) {
                    modifiedTemplate = modifiedTemplate.replace('{{query}}', '?' + splitUrl[1])
                    var queryData = url.parse(req.url, true).query;
                    var queryKeyValPairs = ''
                    for (const [key, value] of Object.entries(queryData)) {
                        queryKeyValPairs += `<li>${key} : ${value}</li>`
                    }
                    modifiedTemplate = modifiedTemplate.replace('{{queries}}', queryKeyValPairs)
                }
                res.writeHead(200)
                res.end(modifiedTemplate)
            }
        }
        if (controllerMethods.hasOwnProperty(route)) {
            return controllerMethods[route]
        } else if (controllerMethods.hasOwnProperty(anyMethodRoute)) {
            return controllerMethods[anyMethodRoute]
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
        res.writeHead(200)
        res.write(generatedHTML)
        res.end()
    }

    function serveFile(location) {
        data = fs.readFileSync(location)
        res.writeHead(200)
        res.end(data)
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
})

server.listen(8000)
