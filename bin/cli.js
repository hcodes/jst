#!/usr/bin/env node

var fs = require('fs'),
    pth = require('path'),
    program = require('commander'),
    compiler = require('../lib/compiler'),
    log = require('../lib/colors').log,
    isDir = function (path) {
        return fs.statSync(path).isDirectory();
    },
    buildTemplates = function (filesIn, fileOut, withoutKernel) {
        fileOut = fileOut || (filesIn.length === 1 ? filesIn[0] + '.js' : './all.jst.js');
        
        var fd = fs.openSync(fileOut, 'w+'),
            texts = [];
        
        fs.writeSync(fd, compiler.compileFiles(filesIn, {withoutKernel: withoutKernel}));
        fs.closeSync(fd);
    },
    findTemplates = function (files) {
        var res = [],
            find = function (path) {
                var files = fs.readdirSync(path);
                files.forEach(function (el) {
                    var file = pth.join(path, el);
                    if (isDir(file)) {
                        find(file);
                    } else if (file.search(/\.jst$/) !== -1) {
                        res.push(file);
                    }
                });
            };
        
        files.forEach(function (el) {
            if (isDir(el)) {
                find(el);
            } else {
                res.push(el);
            }
        });
        
        return res;
    };

program
    .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version)
    .usage('[options] <directory-or-file> [directory-or-file, ...]')
    .option('-d, --debug', 'debugging mode')
    .option('-w, --without-kernel', 'Compilation without jst-kernel')
    .parse(process.argv);
    
var fileIn = [],
    fileOut = program.args[1],
    timeA = Date.now();

(program.args[0] || '').split(':').forEach(function (el) {
    el = el.trim();
    
    if (el) {
        fileIn.push(el);
    }
});

if (!fileIn.length) {
    log('Not specified template file.\nExample: jst_compiler ./example.jst', 'warn');
    process.exit(1);
}

fileIn.forEach(function (el) {
    if (!fs.existsSync(el)) {
        log('File or templates folder "' + el + '" not found.', 'warn');
        process.exit(1);
    }
});

var files = findTemplates(fileIn);
buildTemplates(files, fileOut, program.withoutKernel);

if (files.length) {
    if (program.debug) {
        var buf = '';
        files.forEach(function (el, i) {
            buf += (i + 1) + '. ' + el + '\n';
        });
        
        log(buf, 'debug');
        log('Completed in ' + (Date.now() - timeA) + ' ms.', 'debug');
    }
} else {
    log('Files with templates (*.jst) not found.', 'warn');
}

process.exit(0);
