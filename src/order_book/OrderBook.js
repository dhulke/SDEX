"use strict";

class OrderBook {
    #buyOrders = [];
    #marketBuyOrders = [];
    #sellOrders = [];
    #marketSellOrders = [];

    constructor() {}

    limitBuy(volume, value) {
        const remainingBuyVolumeAfterMarketSell = this.#takeMarketSellOrders(volume);
        const remainingBuyVolume = this.#takeLimitSellOrders(
            remainingBuyVolumeAfterMarketSell,
            value,
        );

        if (remainingBuyVolume) {
            this.#buyOrders.push({
                operation: OPERATION.BUY,
                type: TYPE.LIMIT,
                volume: remainingBuyVolume,
                value,
            });
        }

        this.#buyOrders.sort((a, b) => b.value - a.value);
    }

    marketBuy(volume) {
        const remainingBuyVolume = this.#takeLimitSellOrders(volume, Number.MAX_SAFE_INTEGER);

        if (remainingBuyVolume) {
            this.#marketBuyOrders.push({
                operation: OPERATION.BUY,
                type: TYPE.MARKET,
                volume: remainingBuyVolume,
            });
        }
    }

    limitSell(volume, value) {
        const remainingSellVolumeAfterMarketBuy = this.#takeMarketBuyOrders(volume);
        const remainingSellVolume = this.#takeLimitBuyOrders(
            remainingSellVolumeAfterMarketBuy,
            value,
        );

        if (remainingSellVolume) {
            this.#sellOrders.push({
                operation: OPERATION.SELL,
                type: TYPE.LIMIT,
                volume: remainingSellVolume,
                value,
            });
        }

        this.#sellOrders.sort((a, b) => a.value - b.value);
    }

    marketSell(volume) {
        const remainingSellVolume = this.#takeLimitBuyOrders(volume, 0);

        if (remainingSellVolume) {
            this.#marketSellOrders.push({
                operation: OPERATION.SELL,
                type: TYPE.MARKET,
                volume: remainingSellVolume,
            });
        }
    }

    registerOrder(order) {
        if (order.operation === OPERATION.BUY) {
            if (order.type === TYPE.LIMIT) {
                this.limitBuy(order.volume, order.value);
            } else {
                this.marketBuy(order.volume);
            }
        } else {
            if (order.type === TYPE.LIMIT) {
                this.limitSell(order.volume, order.value);
            } else {
                this.marketSell(order.volume);
            }
        }
    }

    getBuyOrders() {
        return this.#buyOrders;
    }

    getMarketBuyOrders() {
        return this.#marketBuyOrders;
    }

    getSellOrders() {
        return this.#sellOrders;
    }

    getMarketSellOrders() {
        return this.#marketSellOrders;
    }

    getDump() {
        return {
            buyOrders: this.getBuyOrders(),
            marketBuyOrders: this.getMarketBuyOrders(),
            sellOrders: this.getSellOrders(),
            marketSellOrders: this.getMarketSellOrders(),
        };
    }

    loadDump(dump) {
        this.#buyOrders = dump.buyOrders;
        this.#marketBuyOrders = dump.marketBuyOrders;
        this.#sellOrders = dump.sellOrders;
        this.#marketSellOrders = dump.marketSellOrders;
    }

    #takeLimitSellOrders(volume, value) {
        let remainingBuyVolume = volume,
            remainingSellVolume;

        this.#sellOrders = this.#sellOrders.filter((order) => {
            if (remainingBuyVolume === 0) {
                return true;
            }

            if (value >= order.value) {
                if (remainingBuyVolume >= order.volume) {
                    remainingBuyVolume -= order.volume;
                    return false;
                } else {
                    remainingSellVolume = order.volume - remainingBuyVolume;
                    remainingBuyVolume = 0;
                    return true;
                }
            }
            return true;
        });

        if (remainingSellVolume) {
            this.#sellOrders[0].volume = remainingSellVolume;
        }

        return remainingBuyVolume;
    }

    #takeMarketSellOrders(volume) {
        let remainingBuyVolume = volume,
            remainingSellVolume;

        this.#marketSellOrders = this.#marketSellOrders.filter((order) => {
            if (remainingBuyVolume === 0) {
                return true;
            }

            if (remainingBuyVolume >= order.volume) {
                remainingBuyVolume -= order.volume;
                return false;
            } else {
                remainingSellVolume = order.volume - remainingBuyVolume;
                remainingBuyVolume = 0;
                return true;
            }
        });

        if (remainingSellVolume) {
            this.#marketSellOrders[0].volume = remainingSellVolume;
        }

        return remainingBuyVolume;
    }

    #takeLimitBuyOrders(volume, value) {
        let remainingSellVolume = volume,
            remainingBuyVolume;

        this.#buyOrders = this.#buyOrders.filter((order) => {
            if (remainingSellVolume === 0) {
                return true;
            }

            if (value <= order.value) {
                if (remainingSellVolume >= order.volume) {
                    remainingSellVolume -= order.volume;
                    return false;
                } else {
                    remainingBuyVolume = order.volume - remainingSellVolume;
                    remainingSellVolume = 0;
                    return true;
                }
            }
            return true;
        });

        if (remainingBuyVolume) {
            this.#buyOrders[0].volume = remainingBuyVolume;
        }

        return remainingSellVolume;
    }

    #takeMarketBuyOrders(volume) {
        let remainingSellVolume = volume,
            remainingBuyVolume;

        this.#marketBuyOrders = this.#marketBuyOrders.filter((order) => {
            if (remainingSellVolume === 0) {
                return true;
            }

            if (remainingSellVolume >= order.volume) {
                remainingSellVolume -= order.volume;
                return false;
            } else {
                remainingBuyVolume = order.volume - remainingSellVolume;
                remainingSellVolume = 0;
                return true;
            }
        });

        if (remainingBuyVolume) {
            this.#marketBuyOrders[0].volume = remainingBuyVolume;
        }

        return remainingSellVolume;
    }
}

const OPERATION = {
    BUY: "buy",
    SELL: "sell",
};

const TYPE = {
    LIMIT: "limit",
    MARKET: "market",
};

module.exports = { OrderBook, OPERATION, TYPE };
