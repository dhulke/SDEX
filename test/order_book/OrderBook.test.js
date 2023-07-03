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

    describe("Add combined market and limit, buy and sell orders", function () {
        it("should return all market orders if only market orders are placed", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(10);
            orderBook.marketSell(10);
            orderBook.marketBuy(10);
            orderBook.marketBuy(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.MARKET, volume: 10 },
                { operation: OPERATION.BUY, type: TYPE.MARKET, volume: 10 },
            ]);
            expect(marketSellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.MARKET, volume: 10 },
                { operation: OPERATION.SELL, type: TYPE.MARKET, volume: 10 },
            ]);
        });

        it("should return no orders if all match (limit sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 20);
            orderBook.limitSell(10, 10);
            orderBook.marketBuy(10);
            orderBook.marketBuy(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (limit buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 20);
            orderBook.limitBuy(10, 10);
            orderBook.marketSell(10);
            orderBook.marketSell(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (market buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketBuy(10);
            orderBook.marketBuy(10);
            orderBook.limitSell(10, 20);
            orderBook.limitSell(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (market sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(10);
            orderBook.marketSell(10);
            orderBook.limitBuy(10, 20);
            orderBook.limitBuy(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([]);
        });

        it("should return no orders if all match (mixed)", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(10);
            orderBook.limitBuy(10, 10);
            orderBook.limitBuy(10, 20);
            orderBook.marketSell(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([]);
        });
    });

    describe("Creation of partial limit sell orders", function () {
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

        it("should return one partial sell order from market operation (limit sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(10, 10);
            orderBook.marketBuy(5);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 5, value: 10 },
            ]);
        });

        it("should return one partial sell order from limit operation (market buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketBuy(5);
            orderBook.limitSell(10, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 5, value: 10 },
            ]);
        });
    });

    describe("Creation of partial limit buy orders", function () {
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

        it("should return one partial buy order from limit operation (market sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(5);
            orderBook.limitBuy(10, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 5, value: 20 },
            ]);
            expect(sellOrders).to.deep.equal([]);
        });

        it("should return one partial buy order from limit operation (limit buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(10, 20);
            orderBook.marketSell(5);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();

            expect(buyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 5, value: 20 },
            ]);
            expect(sellOrders).to.deep.equal([]);
        });
    });

    describe("Creation of partial market sell orders", function () {
        it("should return one partial sell order from market operation (limit sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitSell(5, 10);
            orderBook.marketBuy(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.MARKET, volume: 5 },
            ]);
        });

        it("should return one partial sell order from limit operation (market buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketBuy(10);
            orderBook.limitSell(5, 10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketBuyOrders = orderBook.getMarketBuyOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketBuyOrders).to.deep.equal([
                { operation: OPERATION.BUY, type: TYPE.MARKET, volume: 5 },
            ]);
        });
    });

    describe("Creation of partial market buy orders", function () {
        it("should return one partial buy order from limit operation (market sell first)", function () {
            const orderBook = new OrderBook();
            orderBook.marketSell(10);
            orderBook.limitBuy(5, 20);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.MARKET, volume: 5 },
            ]);
        });

        it("should return one partial buy order from limit operation (limit buy first)", function () {
            const orderBook = new OrderBook();
            orderBook.limitBuy(5, 20);
            orderBook.marketSell(10);

            const buyOrders = orderBook.getBuyOrders();
            const sellOrders = orderBook.getSellOrders();
            const marketSellOrders = orderBook.getMarketSellOrders();

            expect(buyOrders).to.deep.equal([]);
            expect(sellOrders).to.deep.equal([]);
            expect(marketSellOrders).to.deep.equal([
                { operation: OPERATION.SELL, type: TYPE.MARKET, volume: 5 },
            ]);
        });
    });

    describe("getDump", function () {
        it("should return all market and limit orders", function () {
            const orderBook = new OrderBook();
            orderBook.registerOrder({
                operation: OPERATION.BUY,
                type: TYPE.LIMIT,
                volume: 10,
                value: 20,
            });
            orderBook.registerOrder({
                operation: OPERATION.SELL,
                type: TYPE.LIMIT,
                volume: 10,
                value: 30,
            });
            orderBook.registerOrder({
                operation: OPERATION.BUY,
                type: TYPE.MARKET,
                volume: 5,
            });
            orderBook.registerOrder({
                operation: OPERATION.SELL,
                type: TYPE.MARKET,
                volume: 5,
            });

            const dump = orderBook.getDump();

            expect(dump).to.deep.equal({
                buyOrders: [{ operation: OPERATION.BUY, type: TYPE.LIMIT, volume: 5, value: 20 }],
                marketBuyOrders: [],
                sellOrders: [{ operation: OPERATION.SELL, type: TYPE.LIMIT, volume: 5, value: 30 }],
                marketSellOrders: [],
            });
        });
    });
});
