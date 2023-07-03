"use strict";

const Link = require("grenache-nodejs-link");
const { PeerRPCClient } = require("grenache-nodejs-ws");

const { SERVICE } = require("./DexServer");
const { Prompt } = require("../util/Prompt");

class DexClient {
    #grapeHost;
    #orderBook;
    #link;
    #peer;

    constructor(grapeHost, orderBook) {
        this.#grapeHost = grapeHost;
        this.#orderBook = orderBook;
        this.#link = new Link({
            grape: this.#grapeHost,
            requestTimeout: 10000,
        });
        this.#peer = new PeerRPCClient(this.#link, {});
    }

    init() {
        this.#link.start();
        this.#peer.init();
    }

    loadDump() {
        return new Promise((resolve) => {
            this.#peer.request(SERVICE.GET_DUMP, "", { timeout: 100000 }, (err, result) => {
                if (err) {
                    Prompt.output("Didn't find any relay servers to load a dump from");
                } else {
                    Prompt.output(`Loading dump:\n${JSON.stringify(result, null, 2)}`);
                    this.#orderBook.loadDump(result);
                }
                resolve();
            });
        });
    }

    getInput() {
        const input = Prompt.input();
        const command = input.split(" ");

        if (command[0] === "get_dump") {
            Prompt.output(JSON.stringify(this.#orderBook.getDump(), null, 2));
        } else if (command[0] === "send_order") {
            let order;
            if (command[2] === "limit") {
                order = {
                    operation: command[1],
                    type: command[2],
                    volume: Number(command[3]),
                    value: Number(command[4]),
                };
            } else {
                order = {
                    operation: command[1],
                    type: command[2],
                    volume: Number(command[3]),
                };
            }

            this.#orderBook.registerOrder(order);

            this.#peer.map(SERVICE.SEND_ORDER, order, { timeout: 100000 }, (err) => {
                if (err) {
                    Prompt.output("Ok. Not sending order to any relay servers");
                } else {
                    Prompt.output("ok");
                }
                // this is not stack recursion so it's ok
                this.getInput();
            });
            return;
        }
        // this iteration is suboptimal but fast to implement
        setTimeout(() => this.getInput(), 100);
    }
}

module.exports = { DexClient };
