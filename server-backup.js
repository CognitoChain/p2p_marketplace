const jsonServer = require("json-server");
const path = require("path");

// NOTE: This should change to the network that you're wanting to deploy against.
const network = process.env.NETWORK || "local";

const server = jsonServer.create();

// The database we "connect" to should depend on the network we're deploying for.
const db = `db-${network}.json`;

const router = jsonServer.router(`data/${db}`);

const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "build")
});

/**
 * This is where you put your address to start receiving fees.
 * @type {string}
 */
const RELAYER_ADDRESS = "0xcdad1af8b76b77bf6ae0b30bc2413865d3fa0cdd";

/**
 * This is an example of a way to set a fee amount per order filled.
 * @type {number}
 */
const FEE_PERCENT = 2;

server.use(middlewares);

/**
 * An example function to show how we might add fees, given some data about the loan.
 *
 * @param loanData
 */
const getFee = loanData => {
  const principalAmount = parseFloat(loanData.principalAmount);

  if (!principalAmount) {
    return 0;
  }

  // In this example we return a fee of 5% of the principal amount, rounded down to 2 decimals.
  const totalFee = (principalAmount / 100) * FEE_PERCENT;
  return totalFee.toFixed(2);
};

server.use(jsonServer.bodyParser);

// The client can request a relayer fee for some given loan data.
server.get("/relayerFee", (req, res) => res.json({ fee: getFee(req.query) }));
server.get("/relayerAddress", (req, res) =>
  res.json({ address: RELAYER_ADDRESS })
);

// Add a "createdAt" field for each new LoanRequest.
server.use((req, res, next) => {
  if (req.method === "POST") {
    console.log("request url ", req.url);
    console.log("body:\n", req.body);
    req.body.createdAt = Date.now();

    // NOTE: Here one could check if the relayer address and fee match the
    // expected values.
  }

  // Continue to JSON Server router
  next();
});

server.use(router);
server.listen(process.env.PORT || 8000, () => {
  console.log(`JSON Server is running for ${network} blockchain`);
});
