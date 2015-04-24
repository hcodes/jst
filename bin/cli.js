#!/usr/bin/env node

var fs = require('fs'),
    pth = require('path'),
    program = require('commander'),
    compiler = require('../lib/compiler'),
    log = require('../lib/logger'),
    isDir = function(path) {
        return fs.statSync(path).isDirectory();
    },
    buildTemplates = function(filesIn, fileOut, withoutKernel) {
        fileOut = fileOut || (filesIn.length === 1 ? filesIn[0] + '.js' : './all.jst.js');

        var fd = fs.openSync(fileOut, 'w+');
        fs.writeSync(fd, compiler.compileFiles(filesIn, {withoutKernel: withoutKernel}));
        fs.closeSync(fd);
    },
    findTemplates = function(files) {
        var res = [],
            find = function(path) {
                var files = fs.readdirSync(path);
                files.forEach(function(el) {
                    var file = pth.join(path, el);
                    if(isDir(file)) {
                        find(file);
                    } else if(file.search(/\.jst$/) !== -1) {
                        res.push(file);
                    }
                });
            };

        files.forEach(function(el) {
            if(isDir(el)) {
                find(el);
            } else {
                res.push(el);
            }
        });

        return res;
    };

program
    .version(require('../package.json').version)
    .usage('[options] <directory-or-file> [directory-or-file, ...]')
    .option('-d, --debug', 'debugging mode')
    .option('-w, --without-kernel', 'Compilation without jst-kernel')
    .parse(process.argv);

if(!program.args.length) {
    program.help();
}

var fileIn = [],
    fileOut = program.args[1],
    timeA = Date.now();

(program.args[0] || '').split(':').forEach(function(el) {
    el = el.trim();

    if(el) {
        fileIn.push(el);
    }
});

if(!fileIn.length) {
    log.warn('Not specified template file.\nExample: jst_compiler ./example.jst');
    process.exit(1);
}

fileIn.forEach(function(el) {
    if(!fs.existsSync(el)) {
        log.warn('File or templates folder "' + el + '" not found.');
        process.exit(1);
    }
});

var files = findTemplates(fileIn);
buildTemplates(files, fileOut, program.withoutKernel);

if(files.length) {
    if(program.debug) {
        var buf = '';
        files.forEach(function(el, i) {
            buf += (i + 1) + '. ' + el + '\n';
        });

        log.debug(buf);
        log.debug('Completed in ' + (Date.now() - timeA) + ' ms.');
    }
} else {
    log.warn('Files with templates (*.jst) not found.');
}

process.exit(0);
