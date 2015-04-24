var chalk = require('chalk');

function log(color, text) {
    console.log(chalk[color](text));
}

function logger(text) {
    console.log(text);
}

logger.debug = log.bind(this, 'blue'); 
logger.error = log.bind(this, 'red'); 
logger.warn = log.bind(this, 'yellow'); 

module.exports = logger;
