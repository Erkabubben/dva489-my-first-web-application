var http = require('http');

var server = http.createServer((req, res) => {
  console.log(req.method + " " + req.url + " " + req.httpVersion);
  res.statusCode(200)
  res.setHeader("Content-Type", "text/html")
  //res.send('<p>Hello World!</p>')
  //res.end();
});

server.listen(8000);
