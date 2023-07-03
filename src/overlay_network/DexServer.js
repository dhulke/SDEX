"use strict";

const Link = require("grenache-nodejs-link");
const { PeerRPCServer } = require("grenache-nodejs-ws");

class DexServer {
    #grapeHost;
    #applicationPort;
    #orderBook;
    #link;
    #peer;

    constructor(grapeHost, applicationPort, orderBook) {
        this.#grapeHost = grapeHost;
        this.#applicationPort = applicationPort;
        this.#orderBook = orderBook;
        this.#link = new Link({
            grape: this.#grapeHost,
        });
        this.#peer = new PeerRPCServer(this.#link, {});
    }

    init() {
        this.#link.start();
        this.#peer.init();

        const service = this.#peer.transport("server");
        service.listen(Number(this.#applicationPort));

        setInterval(() => {
            this.#link.announce(SERVICE.GET_DUMP, service.port, {});
            this.#link.announce(SERVICE.SEND_ORDER, service.port, {});
        }, 1000);

        service.on("request", (rid, key, payload, handler) => {
            let response;

            if (key === SERVICE.GET_DUMP) {
                response = this.#getDump();
            } else if (key === SERVICE.SEND_ORDER) {
                response = this.#sendOrder(payload);
            }

            handler.reply(null, response);
        });
    }

    #getDump() {
        return this.#orderBook.getDump();
    }

    #sendOrder(order) {
        // should not register orders created by this client
        // this.#orderBook.registerOrder(order);
        console.log("server:", order);
    }
}

const SERVICE = {
    GET_DUMP: "orderBook:get_dump",
    SEND_ORDER: "orderBook:send_order",
};

module.exports = { DexServer, SERVICE };
