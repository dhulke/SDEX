"use strict";

const Link = require("grenache-nodejs-link");
const { PeerRPCServer } = require("grenache-nodejs-ws");

console.log("Server", process.argv[2]);

function fibonacci(n) {
    if (n <= 1) {
        return 1;
    }

    return fibonacci(n - 1) + fibonacci(n - 2);
}

const link = new Link({
    grape: "http://127.0.0.1:30001",
});
link.start();

const peer = new PeerRPCServer(link, {});
peer.init();

const service = peer.transport("server");
service.listen(Number(process.argv[3]) || 1337);

setInterval(() => {
    link.announce("fibonacci_worker", service.port, {});
}, 1000);

service.on("request", (rid, key, payload, handler) => {
    const result = fibonacci(payload.number);
    handler.reply(null, `${process.argv[2]} - ${result}`);
});
