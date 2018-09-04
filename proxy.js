var http = require('http'),
httpProxy = require('http-proxy'),
HttpProxyRules = require('http-proxy-rules');

// Set up proxy rules instance
var proxyRules = new HttpProxyRules({
rules: {
'/ping': 'http://localhost:3000/ping',
'/loanRequests/*': 'http://localhost:3000/loanrequest/all', 
'/newLoanRequests': 'http://localhost:3000/loanrequest/save',
'/relayerFee': 'http://localhost:3000/config/relayerFee',
'/relayerAddress': 'http://localhost:3000/config/relayerAddress',

}
});

// Create reverse proxy instance
var proxy = httpProxy.createProxy();

// Create http server that leverages reverse proxy instance
// and proxy rules to proxy requests to different targets
http.createServer(function(req, res) {

// a match method is exposed on the proxy rules instance
// to test a request to see if it matches against one of the specified rules
var target = proxyRules.match(req);
console.log("target: ", target)

if (target) {
return proxy.web(req, res, {
  target: target
});
}

res.writeHead(404, { 'Content-Type': 'text/plain' });
res.end('Not Found');
}).listen(8080);