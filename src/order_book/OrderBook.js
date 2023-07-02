class OrderBook {
    #marketBuyOrders = [];
    #buyOrders = [];
    #marketSellOrders = [];
    #sellOrders = [];

    constructor() {}

    limitBuy(volume, value) {
        const [remainingBuyVolume, [remainingSellVolume, remainingSellValue]] = this.#takeSell(
            volume,
            value,
        );

        if (remainingBuyVolume) {
            this.#buyOrders.push({
                operation: OPERATION.BUY,
                type: TYPE.LIMIT,
                volume: remainingBuyVolume,
                value,
            });
        } else if (remainingSellVolume && remainingSellValue) {
            this.#sellOrders.unshift({
                operation: OPERATION.SELL,
                type: TYPE.LIMIT,
                volume: remainingSellVolume,
                value: remainingSellValue,
            });
        }

        this.#buyOrders.sort((a, b) => b.value - a.value);
    }

    marketBuy(volume) {
        const [remainingBuyVolume, [remainingSellVolume, remainingSellValue]] = this.#takeSell(
            volume,
            Number.MAX_SAFE_INTEGER,
        );

        if (remainingBuyVolume) {
            this.#marketBuyOrders.push({
                operation: OPERATION.BUY,
                type: TYPE.MARKET,
                volume: remainingBuyVolume,
            });
        }
    }

    limitSell(volume, value) {
        const [remainingSellVolume, [remainingBuyVolume, remainingBuyValue]] = this.#takeBuy(
            volume,
            value,
        );

        if (remainingSellVolume) {
            this.#sellOrders.push({
                operation: OPERATION.SELL,
                type: TYPE.LIMIT,
                volume: remainingSellVolume,
                value,
            });
        } else if (remainingBuyVolume && remainingBuyValue) {
            this.#buyOrders.unshift({
                operation: OPERATION.BUY,
                type: TYPE.LIMIT,
                volume: remainingBuyVolume,
                value: remainingBuyValue,
            });
        }

        this.#sellOrders.sort((a, b) => a.value - b.value);
    }

    marketSell(volume) {
        const [remainingSellVolume, [remainingBuyVolume, remainingBuyValue]] = this.#takeBuy(
            volume,
            0,
        );

        if (remainingSellVolume) {
            this.#marketSellOrders.push({
                operation: OPERATION.SELL,
                type: TYPE.MARKET,
                volume: remainingSellVolume,
            });
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

    #takeSell(volume, value) {
        let remainingBuyVolume = volume,
            remainingSellVolume,
            remainingSellValue;

        this.#sellOrders = this.#sellOrders.filter((order) => {
            if (remainingBuyVolume === 0) {
                return true;
            }

            if (value >= order.value) {
                if (remainingBuyVolume >= order.volume) {
                    remainingBuyVolume -= order.volume;
                } else {
                    remainingSellVolume = order.volume - remainingBuyVolume;
                    remainingSellValue = order.value;
                    remainingBuyVolume = 0;
                }
                return false;
            }
            return true;
        });

        return [remainingBuyVolume, [remainingSellVolume, remainingSellValue]];
    }

    #takeBuy(volume, value) {
        let remainingSellVolume = volume,
            remainingBuyVolume,
            remainingBuyValue;

        this.#buyOrders = this.#buyOrders.filter((order) => {
            if (remainingSellVolume === 0) {
                return true;
            }

            if (value <= order.value) {
                if (remainingSellVolume >= order.volume) {
                    remainingSellVolume -= order.volume;
                } else {
                    remainingBuyVolume = order.volume - remainingSellVolume;
                    remainingBuyValue = order.value;
                    remainingSellVolume = 0;
                }
                return false;
            }
            return true;
        });

        return [remainingSellVolume, [remainingBuyVolume, remainingBuyValue]];
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
