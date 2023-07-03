"use strict";

const Link = require("grenache-nodejs-link");
const { PeerRPCClient } = require("grenache-nodejs-ws");

const { Prompt } = require("../util/Prompt");

const link = new Link({
    grape: "http://127.0.0.1:30001",
    requestTimeout: 10000,
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

function getInput() {
    const number = Prompt.input();
    const payload = { number };
    peer.map("fibonacci_worker3", payload, { timeout: 100000 }, (err, result) => {
        if (err) throw err;
        Prompt.output(
            `Fibonacci number at place ${payload.number} in the sequence: ${result.length}`,
        );
        getInput();
    });
}

getInput();
