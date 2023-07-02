const chalk = require("chalk");
const prompt = require("prompt-sync")({ sigint: true });

const INPUT = ">>";
const OUTPUT = ">>";

class Prompt {
    static input() {
        const message = prompt(chalk.green(INPUT + ": "));
        console.log();
        return message;
    }

    static output(message) {
        console.log(`${chalk.yellow(OUTPUT + ":")} ${message}\n`);
    }
}

module.exports = { Prompt };
