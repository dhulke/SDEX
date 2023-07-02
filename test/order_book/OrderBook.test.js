const { expect } = require("chai");

const { OrderBook, OPERATION, TYPE } = require("../../src/order_book/OrderBook");

describe("OrderBook", function () {
    describe("Add standalone limit buy order", function () {
        it("should return one order", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 10);
            const orders = orderBook.getBuyOrders();

            expect(orders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 10 },
            ]);
        });

        it("should return two sorted orders", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 10);
            orderBook.limitBuy(10, 20);
            const orders = orderBook.getBuyOrders();

            expect(orders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 20 },
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 10 },
            ]);
        });
    });

    describe("Add standalone limit sell order", function () {
        it("should return one order", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 10);
            const orders = orderBook.getSellOrders();

            expect(orders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 10 },
            ]);
        });

        it("should return two sorted orders", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 20);
            orderBook.limitSell(10, 10);
            const orders = orderBook.getSellOrders();

            expect(orders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 10 },
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 20 },
            ]);
        });
    });

    describe("Add standalone market buy order", function () {
        it("should return one order", function () {
            const orderBook = new OrderBook();
            orderBook.marketBuy(10, 10);
            const orders = orderBook.getBuyOrders();
            const marketOrders = orderBook.getMarketBuyOrders();

            expect(orders).to.deep.equal([]);
            expect(marketOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.MARKET, volume: 10 },
            ]);
        });
    });

    describe("Add standalone market sell order", function () {
        it("should return one order", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(10, 10);
            const orders = orderBook.getSellOrders();
            const marketOrders = orderBook.getMarketSellOrders();

            expect(orders).to.deep.equal([]);
            expect(marketOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.MARKET, volume: 10 },
            ]);
        });
    });

    describe("Add combined limit buy and sell orders", function () {
        it("should return all buy and sell orders if no match", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 10);
            orderBook.limitBuy(10, 20);
            orderBook.limitSell(10, 40);
            orderBook.limitSell(10, 30);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 20 },
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 10 },
            ]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 30 },
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 40 },
            ]);
        });

        it("should return no orders if all match (sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 20);
            orderBook.limitSell(10, 10);
            orderBook.limitBuy(10, 10);
            orderBook.limitBuy(10, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 10);
            orderBook.limitBuy(10, 20);
            orderBook.limitSell(10, 20);
            orderBook.limitSell(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (mixed)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 10);
            orderBook.limitSell(10, 20);
            orderBook.limitBuy(10, 20);
            orderBook.limitSell(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
        });

        it("should return one order if not all match", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 10);
            orderBook.limitBuy(10, 20);
            orderBook.limitBuy(10, 10);
            orderBook.limitSell(10, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 10, value: 10 },
            ]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 10, value: 20 },
            ]);
        });
    });

    describe("Creation of partial sell orders", function () {
        it("should return one partial sell order from limit operation (sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 10);
            orderBook.limitBuy(5, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 5, value: 10 },
            ]);
        });

        it("should return one partial sell order from limit operation (buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(5, 20);
            orderBook.limitSell(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 5, value: 10 },
            ]);
        });
    });

    describe("Creation of partial buy orders", function () {
        it("should return one partial buy order from limit operation (sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(5, 10);
            orderBook.limitBuy(10, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 5, value: 20 },
            ]);
            expect(sellOrders).to.deep.equal([]);
        });

        it("should return one partial buy order from limit operation (buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 20);
            orderBook.limitSell(5, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 5, value: 20 },
            ]);
            expect(sellOrders).to.deep.equal([]);
        });
    });
});
