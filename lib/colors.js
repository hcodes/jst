module.exports = {
    log: function(str, type) {
        var item = {
            'debug': ['\x1B[35m', '\x1B[39m'], // blue
            'info': ['\x1B[32m', '\x1B[39m'], // green
            'error': ['\x1B[31m', '\x1B[39m'], // red 
            'warn': ['\x1B[33m', '\x1B[39m'] // yellow
        }[type];

        return console.log(item[0] + str + item[1]);
    }
};
