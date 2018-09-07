//var http = require('http')
const jsonServer = require("json-server")
const httpProxy = require('http-proxy');
const  HttpProxyRules = require('http-proxy-rules');
const path = require("path");

// Set up proxy rules instance
var proxyRules = new HttpProxyRules({
rules: {
'/api/ping': 'http://localhost:3000/ping',
'/api/loanRequests/([0-9]+)': 'http://localhost:3000/loanrequest/$1', 
'/api/loanRequests/*': 'http://localhost:3000/loanrequest/all', 
'/api/newLoanRequest': 'http://localhost:3000/loanrequest/save',
'/api/relayerFee': 'http://localhost:3000/config/relayerFee',
'/api/relayerAddress': 'http://localhost:3000/config/relayerAddress',

}
});

// Create reverse proxy instance
var proxy = httpProxy.createProxy();

const server = jsonServer.create();
//const server = http.create();

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "build")
});

// server.use(middlewares);
// server.use(jsonServer.bodyParser);

server.get("/api/*", 
// function(req, res){ 
//   apiProxy.web(req, res, { target: 'http://google.com:80' });
// }
  function(req, res) {
    // a match method is exposed on the proxy rules instance
    // to test a request to see if it matches against one of the specified rules
    var target = proxyRules.match(req);
    console.log("GET target: ", target, " req: ", req.url)
    
    if (target) {    
      proxy.web(req, res, { target: target });
    } else {
      res.statusCode = 404;
      res.json({ error: 'Not Found' })
    }
  }
);


server.post("/api/*", 
// function(req, res){ 
//   apiProxy.web(req, res, { target: 'http://google.com:80' });
// }
  function(req, res) {
    // a match method is exposed on the proxy rules instance
    // to test a request to see if it matches against one of the specified rules
    var target = proxyRules.match(req);
    console.log("POST target: ", target, " req: ", req.url)
    if (target) { 
        proxy.web(req, res, { target: target });
    } else {
      res.statusCode = 404;
      res.json({ error: 'Not Found' })
    }
  }
);

server.use(middlewares);
//server.use(jsonServer.bodyParser);

server.listen(process.env.PORT || 8080, () => {
  console.log(`JSON Server started  on port ${process.env.PORT }`);
});