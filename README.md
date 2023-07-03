# Install

```
$ git clone git@github.com:dhulke/SDEX.git
$ cd SDEX
$ npm install
```

# Testing

```
$ npm run test
```

# Running (quick demo)

Start the grape nodes

```
npm i -g grenache-grape
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

Start first client

```
$ node src/client 1337
```

In the command prompt that will appear run the following commands to add a buy order, partially sell and get a dump of the remaining orders

```
send_order buy limit 10 10
send_order sell limit 5 10
get_dump
```

Connect the second client

```
$ node src/client 1338
```

Because both the server and the command prompt are running in the same event loop, all interactions between servers are locked by the command prompt. This is easily solvable by separating the command prompt into its own process but I didn't have time to do this. Hence, you'll need to press Enter in the first client so that the second client can load a dump that it discovered from the first client. Sometimes more than one Enter is required.

Now in the second client run the following command

```
send_order buy limit 10 10
```

Make sure you hit enter in the first client again to unlock the event loop. The first client should have received a message `server: order` showing that it received the order from the first client. Every client is also a server and on every send_order I'm sending a request to all registered servers, including the server of the originating client. This would make orders get duplicated in the originating client and so I didn't implement the actual loading of orders. Again, this is very easy to solve with an order id by making sure I don't load orders which the ids have originated from the current client. I also didn't have time to fix this.

# Architecture Considerations

Every client when first instantiated, looks for an already loaded server from which it can load a dump to start itself. If no dumps are found, the dex is started empty. Every order placed is broadcasted to all listening nodes, including itself. I didn't have time to experiment with the pubsub classes but I was able to implement this arquitecture using the `peer.map` method which sends a request to all listening workers.

I didn't have time to implement a disambiguation of orders so that a client can ignore the orders it sent to its own server. This should be pretty straight forward using order ids.

The whole system is very simple with no consideration for timeouts and lost messages. I felt Grenache abstracts too much the infrastructure layer for me to create a trully reliable distributed orderbook where I can create a list of more up to date servers and give them preference. Nevertheless it does allow me to complete the excercise.

I initially thought of 2 ways of implementing the distributed orderbook: 

1. Limitng writes to a leader node like kafka does and having replica nodes that are kept in sync.
2. Fully distributed where state is not exactly matched between the nodes.

The first way of implementing this solution would make for a very reliable orderbook where all nodes have the exact same orders and all writes are synchronous. No double spending issues. I'd have to implement a leader ellection algorithm and check for stales servers. I didn't have enough time to explore the source code of Grenache to see how close I could get to this implementation but given the documentation available I think I don't have enough control of the infrastructure for this.

The second implementation doesn't keep orders in sync and different nodes would end up having different orders in their order books. To avoid double spending problems we'd have to rely on the consensus algorithm of a backing blockchain. Every order matched would have to be made into a blockchain transaction and confirmed there. If failed, it would be removed from the current node's order book. This is more or less how the 0x protocol works.

My implementation doesn't have a consensus algorithm backing it and so it is fundamentally flaud, but I believe it serves the purpose of the excercise.

# Addendum

On a second thought, I wouldn't have announced 2 services but instead announced only one called orderbook and expected the payload to select the service.