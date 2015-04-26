// jshint maxlen: 256
require('./kernel');

var fs = require('fs'),
    vm = require('vm'),
    log = require('./logger');

var Compiler = {
    build: function(text, fileName, prefs) {
        var res = [];

        this._sameTemplateName = {};

        if(Array.isArray(text)) {
            text.forEach(function(el) {
                this._fileName = el[1];
                res.push(this.fileMark(), this._build(el[0]));
            }, this);
        } else {
            this._fileName = fileName;
            text += this.fileMark();
            res.push(this._build(text));
        }

        res = res.join('');

        if(res.search(/function/) !== -1) {
            res = '\n(function() {' +
                ['',
                    'var attr = jst.attr,',
                    '    block = jst.block,',
                    '    each = jst.each,',
                    '    filter = jst.filter,',
                    '    template = jst;'
                ].join('\n    ') + res + '\n\n})();';
        }

        if(prefs && !prefs.withoutKernel) {
            res = this.includeKernel(res);
        }

        return res;
    },
    _build: function(text) {
        var inFile = this._inFile();

        if(!this.checkOpenCloseTag(text)) {
            return this.templateConsole('Unequal number of open and closed tags <template> ' + inFile);
        }

        var buf = [];
        var templates = text.match(/<template(([\n\r]|.)*?)<\/template>/gm);

        if(!templates) {
            return this.templateConsole('No jst-templates ' + inFile);
        }

        templates.forEach(function(el, num) {
            var res =  this._template(el, num + 1);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);

        if(this._init.length) {
            buf.push(this._tab + 'jst._init([\'' + this._init.join('\', \'') + '\']);');
            this._init = [];
        }

        var bufExtend = [];
        if(this._extend.length) {
            this._extend.forEach(function(el) {
                bufExtend.push('[\'' + el[0] + '\', \'' + el[1] + '\']');
            }, this);

            buf.push(this._tab + 'jst._extend([' + bufExtend.join(', ') + ']);');
            this._extend = [];
        }

        return buf.join('\n');
    },
    fileMark: function() {
        return '\n\n/* --- ' + this._fileName + ' --- */\n';
    },
    templateConsole: function(text) {
        log.error('Error: ' + text + '\n');

        return 'console.error(\'' + this.quot(text) + '\');';
    },
    template: function(text, num) {
        var res = this._template(text, num);

        return '\n' + (res.error ?  this.templateConsole(res.error.text) : res.normal);
    },
    _inFile: function() {
        return ', file: ' + this._fileName;
    },
    _template: function(text, num) {
        var buf = text.match(/(?:<template)(?:.*>)(([\n\r]|.)*)(?:<\/template>)/m);

        var params = this.getAttr(text, 'params');
        var name =  this.getAttr(text, 'name');
        var trimm = this.getAttr(text, 'trim');
        var deleteSpaces = this.getAttr(text, 'delete-spaces');
        var concatenation = this.getAttr(text, 'concatenation') === 'array'  ? 'array' : 'string';
        var extend = this.getAttr(text, 'extend');
        var content = ('' + (buf[1] || ''));
        var inFile = this._inFile();

        var hasBlock = this.hasBlock(text);
        if(hasBlock) {
            content = content.replace(/<block(([\n\r]|.)*?)<\/block>/gm, '');
        }

        if(!name) {
            return {
                error: {
                    code: 1,
                    text: 'No name of the template # ' + num + inFile
                }
            };
        }

        if(typeof this._sameTemplateName[name] !== 'undefined') {
            var files = [this._fileName, this._sameTemplateName[name]];
            log.warn('Warning: multiple templates with the same name "' + name + '". ' + (files[0] === files[1] ? 'File: ' + files[0] : 'Files:' + files.join(', ')));
        } else {
            this._sameTemplateName[name] = this._fileName;
        }

        if(!this.checkParams(params)) {
            return {
                error: {
                    code: 2,
                    text: 'Incorrect parameter name from template "' + name + '" - "' + params + '"' + inFile
                }
            };
        }

        if(this.isOn(trimm)) {
            content = content.trim();
        }

        if(this.isOn(deleteSpaces)) {
            content = this.deleteSpaces(content);
        }

        var f = this.transform({
            name: name,
            template: name,
            namespace: this._defaultNamespace,
            params: params,
            concatenation: concatenation,
            content: content,
            extend: extend,
            hasBlock: hasBlock
        });

        try {
            eval(f.test);
        } catch(e) {
            log.error(e.toString());
            log.error(f.test);
            return {
                error: {
                    code: 4,
                    text: 'Compilation error jst-template "' + name + '"' + inFile
                }
            };
        }

        if(hasBlock || extend) {
                var tab = this._tab,
                    bufBlock = '(function() {\n';

                bufBlock += tab  + 'var f = function() {\n';
                bufBlock += tab + tab + 'this[\'__jstConstructor\'] = ' + f.withoutNamespace + ';\n';
                if(hasBlock) {
                    bufBlock += this.block(text, name);
                }
                bufBlock += tab + '};\n\n';
                bufBlock += tab + this._defaultNamespace + 'Extend[\'' + this.quot(name) + '\'] = f;\n';
                bufBlock += tab + 'f.extend  = \'' + this.quot(extend) + '\';\n';
                bufBlock += '})();\n';

                if(extend) {
                    this._extend.push([name, extend]);
                }

                if(hasBlock && !extend) {
                    this._init.push(name);
                }

                return bufBlock;
        }

        return f.normal;
    },
    hasBlock: function(text) {
        return text.search(/(?:<block)(?:.*>)(([\n\r]|.)*)(?:<\/block>)/) !== -1;
    },
    block: function(text, template) {
        var buf = [],
            blocks = text.match(/<block(([\n\r]|.)*?)<\/block>/gm);

        this._sameBlockName = {};
        blocks.forEach(function(el, num) {
            var res =  this._block(el, num + 1, template);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);

        return '\n' + buf.join('\n') + '\n';
    },
    _block: function(text, num, template) {
        var buf = text.match(/(?:<block)(?:.*>)(([\n\r]|.)*)(?:<\/block>)/m),
            params = this.getAttr(text, 'params', true),
            name =  this.getAttr(text, 'name', true),
            trimm = this.getAttr(text, 'trim', true),
            deleteSpaces = this.getAttr(text, 'delete-spaces', true),
            concatenation = this.getAttr(text, 'concatenation', true) === 'array'  ? 'array' : 'string',
            content = ('' + (buf[1] || '')),
            inFile = this._inFile(),
            tab = this._tab;

        if(!name) {
            return {
                error: {
                    code: 10,
                    text: 'No name of block num. ' + num + ' in the template ' + template + inFile
                }
            };
        }

        if(typeof this._sameBlockName[name] !== 'undefined') {
            var files = [this._fileName, this._sameBlockName[name]];
            log.warn('Warning: several blocks with the same name "' + name + '" in the template "' +
                template + '". ' +
                (files[0] === files[1] ? 'The file: ' + files[0] : 'Files:' + files.join(', ')));
        } else {
            this._sameBlockName[name] = this._fileName;
        }

        if(!this.checkParams(params)) {
            return {
                error: {
                    code: 12,
                    text: 'Incorrect parameter name the block "' + name + '" in the template "' + template + '" - "' + params + '"' + inFile
                }
            };
        }

        if(this.isOn(trimm)) {
            content = content.trim();
        }

        if(this.isOn(deleteSpaces)) {
            content = this.deleteSpaces(content);
        }

        var f = this.transform({
            name: name,
            template: template,
            namespace: this._defaultNamespace,
            params: params,
            concatenation: concatenation,
            content: content,
            hasBlock: true
        });

        try {
            eval(f.test);
        } catch(e) {
            log.error(e.toString());
            log.error(f.test);
            return {
                error: {
                    code: 14,
                    text: 'Compilation error jst-block "' + name + '" in the template "' + template + '" ' + inFile
                }
            };
        }

        return tab + tab + 'this[\'' + this.quot(name) + '\'] = ' + f.withoutNamespace + ';';
    },
    getAttr: function(text, attr, isBlock) {
        var res = isBlock ? text.match('(?:\<block)(?:.*)(?:' + attr + '=")(.*?)(?:")') : text.match('(?:\<template)(?:.*)(?:' + attr + '=")(.*?)(?:")');
        res = res ? res[1] : '';

        return ('' + (res || '')).trim();
    },
    isOn: function(t) {
        return !!(t !== 'no' && t !== 'none' && t !== 'false' && t !== 'off');
    },
    isCorrectNameVariable: function(name) {
        var re  = /^[a-z$_][\w$_]*$/i;

        return re.test(name);
    },
    transform: function(data) {
        if(data.content.search(/<\%/) === -1) {
            return this.withoutInlineJS(data);
        } else {
            return this.withInlineJS(data);
        }
    },
    withoutInlineJS: function(data) {
        var text = '\'' + this._fixLineEnd(this.fixQuotes(data.content)).replace(/[\r\t\n]/g, ' ') + '\'';
        var code = data.namespace + '[\'' + this.quot(data.name) + '\'] = ' + text + ';';

        return {
            test: 'var jst = {};\n' + data.namespace + ' = {};\n' + code,
            normal: code,
            withoutNamespace: text
        };
    },
    withInlineJS: function(data) {
        var that = this,
            tab = this._tab,
            con = {
                init: '\'\'',
                push: '__jst += \'',
                above: '\' + __jst-empty-quotes__ filter._undef($1) + \'',
                aboveHTML: '\' + __jst-empty-quotes__ filter.html($1) + \'',
                close: '\' __jst-empty-quotes__;',
                ret: '__jst'
            },
            js = this.defaultValues(data.params) + tab + 'var __jst = ' + con.init + ';\n';

        if(data.hasBlock || data.extend) {
            js += 'var __jstTemplate = \'' + this.quot(data.template) + '\';\n';
            js += 'var __jstThis = this;\n';
            js += 'var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; \n';
            js += 'var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; \n';
        }

        var content = this._fixLineEnd(this.fixQuotes(data.content));
        content = content
            .replace(/[\n\t]/g, ' ')
            .replace(/\s+(<%[^=!\+])/g, '$1') // Remove spaces between jst and HTML tags
            .replace(/\s+(<%=[^\+])/g, '$1') // Remove spaces before jst tags - <%=-
            .replace(/\s+(<%![^\+])/g, '$1') // Remove spaces before jst tags - <%!-
            .replace(/([^\+]%>) +/g, '$1') // Remove spaces after jst - -%>
            .replace(/<%(=|!)?(\+|-)/g, '<%$1') // Remove mode spaces at the start jst-tag
            .replace(/(\+|-)%>/g, '%>') // Remove mode spaces at the end jst-tag
            .replace(/(<%)\s+/g, '$1 ') // Remove spaces at the beginning inside jst-templating tags
            .replace(/\s+(%>)/g, '$1')// Remove spaces at the end inside jst-tags
            .replace(/<%#.*?%>/g, '') // Removing comments
            .replace(/<%(=|!)? *?%>/g, '') // Removing empty tags <% %>, <%= %>, <%! %>
            .split('<%').join('\t')
            .replace(/((^|%>)[^\t]*)'/g, '$1\r')
             // Short form filters
            .replace(/\t! ?(.*?)%>/g, function() {
                return con.above.replace(/\$1/, that.addShortFilters(arguments[1]));
            })
            .replace(/\t= ?(.*?)%>/g, function() {
                return con.aboveHTML.replace(/\$1/, that.addShortFilters(arguments[1]));
            })
            .split('\t').join('\';\n')
            .split('%>').join('\n' + tab + con.push)
            .split('\r').join('\'');

        js += tab + con.push + content + con.close + '\n\n' + tab + 'return ' + con.ret + ';';

        js = js
            .replace(/\+ \'\' \+ __jst-empty-quotes__ /g, '+ ')
            .replace(/= \'\' \+ __jst-empty-quotes__ /g, '= ')
            .replace(/\! \'\' \+ __jst-empty-quotes__ /g, '= ')
            .replace(/ \+ '' __jst-empty-quotes__;/g, ';')
            .replace(/ __jst-empty-quotes__/g, '')
            .replace(/    __jst \+= '';/g, '');

        var text = 'function(' + this.params(data.params) + ') {\n';
        text += js;
        text += '\n}';

        var code = data.namespace + '[\'' + this.quot(data.name) + '\'] = ' + text + ';';
        return {
            test: 'var jst = {};\n' + data.namespace + ' = {};\n' + code,
            normal: code,
            withoutNamespace: text
        };
    },
    _fixLineEnd: function(text) {
        text = text.replace(/\r\n/g, '\n'); // Windows
        text = text.replace(/$\r|\r[^n]/mg, '\n'); // MacOS

        return text;
    },
    quot: function(text) {
        return ('' + text).replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    },
    fixQuotes: function(text) {
        var buf = text.split('<%'),
            newBuf = [];

        buf.forEach(function(el) {
            if(el.search(/%>/) !== -1) {
                var buf2 = el.split('%>');
                buf2[1] = this.quot(buf2[1]);
                el = buf2.join('%>');
            } else {
                el = this.quot(el);
            }

            newBuf.push(el);
        }, this);

        return newBuf.join('<%');
    },
    addShortFilters: function(str) {
        var res = '',
            buf = str.split(/(?:[^|])\|(?!\|)/);

        if(buf.length < 2) {
            return str;
        }

        buf.forEach(function(el, i) {
            var textParams = '';

            if(!i) {
                res = el;
            } else {
                var f = el.split('(');
                var params = [];

                f.forEach(function(el, i) {
                    if(i) {
                        params.push(el);
                    }
                });

                if(params.length) {
                    params[params.length - 1] = params[params.length - 1].trim().replace(/\)$/, '');
                    textParams = params.join('(');
                }

                var filter = f[0].trim();
                if(jst.filter[filter] && jst.filter[filter].length < 2) {
                    textParams = '';
                }

                res = 'filter.' + filter + '(' + res + (textParams ? ',' + textParams : '') + ')';
            }
        });

        return res;
    },
    deleteSpaces: function(text) {
        return text.replace(/[\n\r\t]/g, ' ').replace(/ {2,}/g, ' ');
    },
    checkParams: function(params) {
        var isError = false;
        if(params) {
            try {
                eval('var ' + params + ';');
            } catch(e) {
                isError = true;
            }
        }

        return !isError;
    },
    params: function(params) {
        var res = [],
            resWithIndex = [],
            sandbox = {},
            script,
            len = 0,
            that = this;

        var getPosition = function(params, name) {
            var p = params.split(',');

            p = p.map(function(el) {
                return ('' + el.split('=')[0]).trim();
            });

            p = p.filter(function(el) {
                    return that.isCorrectNameVariable(el);
            }, this);

            return p.indexOf(name);
        };

        if(params) {
            if(params.search('=') !== -1) {
                script = vm.createScript('var ' + params);
                script.runInNewContext(sandbox);
                for(var i in sandbox) {
                    if(sandbox.hasOwnProperty(i)) {
                        len++;
                        resWithIndex.push({name: i, index: getPosition(params, i)});
                    }
                }

                if(len > 1) {
                    resWithIndex.sort(function(a, b) {
                        return a.index > b.index;
                    });
                }

                resWithIndex.forEach(function(el) {
                    res.push(el.name);
                });
            } else {
                params.split(',').forEach(function(el) {
                    res.push(('' + el).trim());
                });
            }
        }

        return res.join(', ');
    },
    defaultValues: function(params) {
        var res = '',
            tab = this._tab,
            sandbox = {},
            script;

        if(params.search('=') !== -1) {
            script = vm.createScript('var ' + params);
            script.runInNewContext(sandbox);
            for(var i in sandbox) {
                if(sandbox.hasOwnProperty(i) && sandbox[i] !== undefined) {
                    res += tab + i + ' = typeof ' + i + ' === "undefined" ? ' +
                        JSON.stringify(sandbox[i]) + ' : ' + i + ';\n';
                }
            }
        }

        return res;
    },
    checkOpenCloseTag: function(text) {
        var isError = false,
            open = text.match(/<template/g),
            close = text.match(/<\/template>/g);

        if(!open || !close) {
            isError = true;
        }

        if(open && close && open.length !== close.length) {
            isError = true;
        }

        return !isError;
    },
    includeKernel: function(text) {
        return fs.readFileSync(__dirname + '/kernel.js') + '\n\n' + (text || '');
    },
    _defaultNamespace: 'jst._tmpl',
    _tab: '    ',
    _sameTemplateName: {},
    _sameBlockName: {},
    _extend: [],
    _init: [],
};

module.exports = {
    /**
     * Compile files.
     *
     * @param {Array|string} files
     * @param {Object} settings
     * @return {string}
    */
    compileFiles: function(files, settings) {
        var res = [];
        if(typeof files === 'string') {
            files = [files];
        }

        files.forEach(function(el) {
            res.push([fs.readFileSync(el, 'utf-8'), el]);
        });

        return Compiler.build(res, '', settings);
    },
    /**
     * Compile text.
     *
     * @param {string} text
     * @param {Object} settings
     * @return {string}
    */
    compileText: function(text, settings) {
        return Compiler.build(text, '', settings);
    }
};
