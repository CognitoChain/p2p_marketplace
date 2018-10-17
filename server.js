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
    '/api/loanRequests/([a-zA-Z0-9]+)': 'http://localhost:3000/loanrequest/$1',
    '/api/user/loanRequests': 'http://localhost:3000/user/loanrequests',    
    '/api/loanRequests/*': 'http://localhost:3000/loanrequest/all',
    '/api/relayerFee': 'http://localhost:3000/config/relayerFee',
    '/api/relayerAddress': 'http://localhost:3000/config/relayerAddress',
    '/api/priceFeed': 'http://localhost:3000/prices/all',
    '/api/stats/([a-zA-Z0-9]+)': 'http://localhost:3000/stats/$1',
    '/api/loan/([a-zA-Z0-9]+)': 'http://localhost:3000/loan/$1',

    '/api/swagger-ui.html': 'http://localhost:3000/swagger-ui.html',
    '/api/webjars/(.+)': 'http://localhost:3000/webjars/$1',
    '/api/swagger-resources(.*)': 'http://localhost:3000/swagger-resources/$1',
    '/api/v2/(.+)': 'http://localhost:3000/v2/$1'

  }
});


var postProxyRules = new HttpProxyRules({
  rules: {
    '/api/loanRequests': 'http://localhost:3000/loanrequest/save',
    '/api/goauthlogin': 'http://localhost:3000/goauthlogin',
    '/api/login': 'http://localhost:3000/login',
    '/api/sign-up': 'http://localhost:3000/sign-up',
    '/api/email/([a-zA-Z0-9]+)': 'http://localhost:3000/email/$1'    
  }
});

var putProxyRules = new HttpProxyRules({
  rules: {
    '/api/loanRequests/([a-zA-Z0-9]+)': 'http://localhost:3000/loanrequest/$1',
    '/api/email/subscribe': 'http://localhost:3000/email/subscribe',
    '/api/email/unsubscribe': 'http://localhost:3000/email/unsubscribe'
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
    try {   
      proxy.web(req, res, { target: target });
    } catch(err) {
      console.log("Error: ", err);
    }
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

// PUT requests use 'putProxyRules'
server.put("/api/*", function(req, res) {
    proxyRequestHandler(req, res, putProxyRules);
  }
);

server.use(middlewares);

server.get('/*', function(req, res){
    res.sendFile(__dirname + '/build/index.html');
});

process.on('uncaughtException', function (err) {
  console.log("uncaughtException:", err);
}); 

server.listen(process.env.PORT || 8080, () => {
  console.log(`JSON Server started  on port ${process.env.PORT }`);
});
