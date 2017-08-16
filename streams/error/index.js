const chalk = require('chalk');

module.exports.streamError = (err) => {
    console.log(chalk.red(err));
};
