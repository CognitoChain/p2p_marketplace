const jsonServer = require("json-server")
const httpProxy = require('http-proxy');
const HttpProxyRules = require('http-proxy-rules');
const path = require("path");
process.env.NODE_ENV = 'development';
require('./config/env');

// Set up proxy rules instance
var getProxyRules = new HttpProxyRules({
  rules: {
    '/api/ping': 'http://localhost:3000/ping',
    '/api/loanRequests/([0-9]+)': 'http://localhost:3000/loanrequest/$1', 
    '/api/loanRequests/*': 'http://localhost:3000/loanrequest/all', 
    '/api/relayerFee': 'http://localhost:3000/config/relayerFee',
    '/api/relayerAddress': 'http://localhost:3000/config/relayerAddress'
  }
});


var postProxyRules = new HttpProxyRules({
  rules: {
    '/api/loanRequests': 'http://localhost:3000/loanrequest/save'
  }
});

// Create reverse proxy instance
var proxy = httpProxy.createProxy();
const server = jsonServer.create();

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "build")
});

// matches a 'req' against the rules defined in 'proxyRules'  
// and proxies the request if a match is found.
function proxyRequestHandler(req, res, proxyRules) {
  var target = proxyRules.match(req);
  console.log(req.method, "\t", req.originalUrl, " -> ", target)  
  if (target) {    
    proxy.web(req, res, { target: target });
  } else {
    res.statusCode = 404;
    res.json({ error: 'Not Found' })
  }
}

// GET requests use 'getProxyRules'
server.get("/api/*", function(req, res) {
    proxyRequestHandler(req, res, getProxyRules);
  }
);

// POST requests use 'postProxyRules'
server.post("/api/*", function(req, res) {
    proxyRequestHandler(req, res, postProxyRules);
  }
);

server.use(middlewares);

server.listen(process.env.PORT || 8080, () => {
  console.log(`JSON Server started  on port ${process.env.PORT }`);
});