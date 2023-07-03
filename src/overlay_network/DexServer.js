"use strict";

const Link = require("grenache-nodejs-link");
const { PeerRPCServer } = require("grenache-nodejs-ws");

class DexServer {
    #grapeHost;
    #applicationPort;
    #orderBook;

    constructor(grapeHost, applicationPort, orderBook) {
        this.#grapeHost = grapeHost;
        this.#applicationPort = applicationPort;
        this.#orderBook = orderBook;
    }

    init() {
        const link = new Link({
            grape: this.#grapeHost,
        });
        link.start();

        const peer = new PeerRPCServer(link, {});
        peer.init();

        const service = peer.transport("server");
        service.listen(Number(this.#applicationPort));

        setInterval(() => {
            link.announce("orderBook:get_dump", service.port, {});
            link.announce("orderBook:send_order", service.port, {});
        }, 1000);

        service.on("request", (rid, key, payload, handler) => {
            const result = fibonacci(payload.number);
            handler.reply(null, `${process.argv[2]} - ${result}`);
        });
    }
}
