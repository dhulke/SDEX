const { OrderBook } = require("./order_book/OrderBook");
const { DexClient } = require("./overlay_network/DexClient");
const { DexServer } = require("./overlay_network/DexServer");

// Should load grapeHost from args. Hard coding it for now
const grapeHost = "http://127.0.0.1:30001";
const applicationPort = process.argv[2] || 1337;
const orderBook = new OrderBook();

const dexClient = new DexClient(grapeHost, orderBook);
const dexServer = new DexServer(grapeHost, applicationPort, orderBook);

(async function main() {
    // start the node
    dexClient.init();
    // load a dump from a fully loaded peer
    await dexClient.loadDump();
    // register server handler
    dexServer.init();
    // start command prompt
    dexClient.getInput();
})();
