require('./kernel');

var fs = require('fs'),
    pth = require('path'),
    vm = require('vm'),
    log = require('./colors').log;
    
var Compiler = {
    defaultNamespace: 'jst._tmpl',
    _tab: '    ',
    // Построение шаблонов
    build: function (text, fileName, prefs) {
        var res = [];
        
        this._sameTemplateName = {};
        
        // Для размещения шаблонов из нескольких файлов в один общий файл
        if (Array.isArray(text)) {
            text.forEach(function (el) {
                this._fileName = el[1];
                res.push(this.fileMark(), this._build(el[0]));
            }, this);
        } else  {
            this._fileName = fileName;
            text += this.fileMark();
            res.push(this._build(text));
        }
        
        res = res.join('');
        
        // Есть шаблоны в виде функций, чтобы не помещать в каждую функцию служебные переменные,
        // вынесим их в одно место через замыкание
        if (res.search(/function/) !== -1) {
            res = '\n(function () {' +
                ['',
                    'var attr = jst.attr;',
                    'var block = jst.block;',
                    'var each = jst.each;',
                    'var filter = jst.filter;',
                    'var template = jst;'
                ].join('\n    ') + res + '\n\n})();';
        }
        
        if (prefs && !prefs.withoutKernel) {
            res = this.includeKernel(res);
        }
        
        return res;
    },
    fileMark: function () {
        return '\n\n/* --- ' + this._fileName  + ' --- */\n';
    },
    _sameTemplateName: {},
    _sameBlockName: {},
    _extend: [],
    _init: [],
    _build: function (text) {
        var inFile = this._inFile();
        
        if (!this.checkOpenCloseTag(text)) {
            return this.templateConsole('Unequal number of open and closed tags <template> ' + inFile);
        }
        
        var buf = [];
        var templates = text.match(/\<template(([\n\r]|.)*?)\<\/template\>/gm);
        
        if (!templates) {
            return this.templateConsole('No jst-templates ' + inFile);
        }

        templates.forEach(function (el, num) {
            var res =  this._template(el, num + 1);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);
        
        this._init.forEach(function (el) {
            buf.push(this._tab + 'jst._init(\'' + el + '\');');
        }, this);
        
        this._init = [];
        
        this._extend.forEach(function (el) {
            buf.push(this._tab + 'jst._extend(\'' + el[0] + '\', \'' + el[1] + '\');');
        }, this);
        
        this._extend = [];
        
        return buf.join('\n');
    },
    templateConsole: function (text) {
        this.error(text);
        
        return 'console.error(\'' + this.quot(text) + '\');';
    },
    // Построение одного шаблона
    template: function (text, num) {
        var res = this._template(text, num),
            text = res.error ?  this.templateConsole(res.error.text) : res.normal;
       
        return '\n' + text;
    },
    _inFile: function () {
        return ', file: ' + this._fileName;
    },
    _template: function (text, num) {
        var buf = text.match(/(?:\<template)(?:.*\>)(([\n\r]|.)*)(?:\<\/template\>)/m);
        
        var params = this.getAttr(text, 'params');
        var name =  this.getAttr(text, 'name');
        var trimm = this.getAttr(text, 'trim');
        var deleteSpaces = this.getAttr(text, 'delete-spaces');
        var concatenation = this.getAttr(text, 'concatenation') === 'array'  ? 'array' : 'string';
        var extend = this.getAttr(text, 'extend');
        var content = ('' + (buf[1] || ''));
        var inFile = this._inFile();

        var hasBlock = this.hasBlock(text);
        if (hasBlock) {
            content = content.replace(/\<block(([\n\r]|.)*?)\<\/block\>/gm, '');
        }
        
        if (!name) {
            return {
                error: {
                    code: 1,
                    text: 'No name of the template # ' + num + inFile
                }
            };
        }
        
        if (typeof this._sameTemplateName[name] !== 'undefined') {
            var files = [this._fileName, this._sameTemplateName[name]];
            log('Warning: multiple templates with the same name "' + name + '". ' + (files[0] == files[1] ? 'File: ' + files[0] : 'Files:' + files.join(', ')), 'warn');
        } else {
            this._sameTemplateName[name] = this._fileName;
        }        
        
        if (!this.checkParams(params)) {
            return {
                error: {
                    code: 2,
                    text: 'Incorrect parameter name from template "' + name + '" - "' + params + '"' + inFile
                }
            };
        }
        
        if (this.isOn(trimm)) {
            content = content.trim();
        }
        
        if (this.isOn(deleteSpaces)) {
            content = this.deleteSpaces(content);
        }        
        var f = this.transform({
            name: name,
            template: name,
            namespace: this.defaultNamespace,
            params: params,
            concatenation: concatenation,
            content: content,
            extend: extend,
            hasBlock: hasBlock
        });
        
        try {
            eval(f.test);
        } catch(e) {
            log(e.toString(), 'error');
            log(f.test, 'error')
            return {
                error: {
                    code: 4,
                    text: 'Compilation error jst-template "' + name + '"' + inFile
                }
            };
        }
        
        if (hasBlock || extend) {
                var tab = this._tab,
                    bufBlock = '(function () {\n';
                    
                bufBlock += tab  + 'var f = function () {\n';
                bufBlock += tab + tab + 'this[\'__jst_constructor\'] = ' + f.withoutNamespace + ';\n';
                if (hasBlock) {
                    bufBlock += this.blocks(text, name);
                }
                bufBlock += tab + '};\n\n';
                bufBlock += tab + this.defaultNamespace + 'Extend[\'' + this.quot(name) + '\'] = f;\n';
                bufBlock += tab + 'f.extend  = \'' + this.quot(extend) + '\';\n';
                bufBlock += '})();\n';
                
                if (extend) {
                    this._extend.push([name, extend]);
                }
                
                if (hasBlock && !extend) {
                    this._init.push(name);
                }
                
                return bufBlock;
        }
        
        return f.normal;
    },
    hasBlock: function (text) {
        return text.search(/(?:\<block)(?:.*\>)(([\n\r]|.)*)(?:\<\/block\>)/) != -1;
    },
    blocks: function (text, template) {
        var buf = [],
            blocks = text.match(/\<block(([\n\r]|.)*?)\<\/block\>/gm);
        
        this._sameBlockName = {};
        blocks.forEach(function (el, num) {
            var res =  this._block(el, num + 1, template);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);
    
        return '\n' + buf.join('\n') + '\n';
    },
    _block: function (text, num, template) {
        var buf = text.match(/(?:\<block)(?:.*\>)(([\n\r]|.)*)(?:\<\/block\>)/m),
            params = this.getAttr(text, 'params', true),
            name =  this.getAttr(text, 'name', true),
            trimm = this.getAttr(text, 'trim', true),
            deleteSpaces = this.getAttr(text, 'delete-spaces', true),
            concatenation = this.getAttr(text, 'concatenation', true) == 'array'  ? 'array' : 'string',
            content = ('' + (buf[1] || '')),
            inFile = this._inFile(),
            tab = this._tab;
        
        if (!name) {
            return {
                error: {
                    code: 10,
                    text: 'No name of block num. ' + num + ' in the template ' + template + inFile
                }
            };
        }
        
        if (typeof this._sameBlockName[name] !== 'undefined') {
            var files = [this._fileName, this._sameBlockName[name]];
            log('Warning: several blocks with the same name "' + name + '" in the template "' + template + '". ' + (files[0] == files[1] ? 'The file: ' + files[0] : 'Files:' + files.join(', ')), 'warn');
        } else {
            this._sameBlockName[name] = this._fileName;
        }        
        
        if (!this.checkParams(params)) {
            return {
                error: {
                    code: 12,
                    text: 'Incorrect parameter name the block "' + name + '" in the template "' + template + '" - "' + params + '"' + inFile
                }
            };
        }
        
        if (this.isOn(trimm)) {
            content = content.trim();
        }
        
        if (this.isOn(deleteSpaces)) {
            content = this.deleteSpaces(content);
        }        
        
        var f = this.transform({
            name: name,
            template: template,
            namespace: this.defaultNamespace,
            params: params,
            concatenation: concatenation,
            content: content,
            hasBlock: true
        });
        
        try {
            eval(f.test);
        } catch(e) {
            log(e.toString(), 'error');
            log(f.test, 'error');
            return {
                error: {
                    code: 14,
                    text: 'Compilation error jst-block "' + name + '" in the template "' + template + '" ' + inFile
                }
            };
        }
        
        return tab + tab + 'this[\'' + this.quot(name) + '\'] = ' + f.withoutNamespace + ';';
    },
    // Получить значение атрибута
    getAttr: function (text, attr, isBlock) {
        var attr = isBlock ? text.match('(?:\<block)(?:.*)(?:' + attr + '=")(.*?)(?:")') : text.match('(?:\<template)(?:.*)(?:' + attr + '=")(.*?)(?:")');
        attr = attr ? attr[1] : '';
        
        return ('' + (attr || '')).trim();
    },
    // Проверка атрибута на включение
    isOn: function (t) {
        return !!(t !== 'no' && t !== 'none' && t !== 'false' && t !== 'off');
    },
    // Проверка на корректность названия переменной в js
    isCorrectNameVariable: function (name) {
        var re  = /^[a-z$_][\w$_]*$/i;
        
        return re.test(name);
    },
    // Вывод ошибки
    error: function (text) {
        log('Error: ' + text + '\n', 'error');
    },
    // Построение шаблона в строку или js-функцию
    transform: function (data) {
        if (data.content.search(/\<\%/) === -1) {
            return this.withoutInlineJS(data);
        } else {
            return this.withInlineJS(data);
        }
    },
    // Построение из шаблона строки (без логики и вставки переменных)
    withoutInlineJS: function (data) {
        var text = '\'' + this._fixLineEnd(this.fixQuotes(data.content)).replace(/[\r\t\n]/g, " ") + '\'';
        var code = data.namespace + '[\'' + this.quot(data.name) + '\'] = ' + text + ';';
        
        return {
            test: 'var jst = {};\n' + data.namespace + ' = {};\n' + code,
            normal: code,
            withoutNamespace: text
        }    
    },
    // Построение из шаблона js-функцию
    withInlineJS: function (data) {
        var that = this,
            tab = this._tab,
            con = {
                init: "''",
                push: "__jst += '",
                above: "' + __jst-empty-quotes__ filter._undef($1) + '",
                aboveHTML: "' + __jst-empty-quotes__ filter.html($1) + '",
                close: "' __jst-empty-quotes__;",
                ret: "__jst"
            },
            js = this.defaultValues(data.params) + tab + "var __jst = " + con.init + ";\n";
        
        if (data.hasBlock || data.extend) {
            js += 'var __jst_template = \'' + this.quot(data.template) + '\';\n';
            js += 'var __jst_this = this;\n';
            js += 'var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; \n';
            js += 'var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; \n';
        }
        
        var content = this._fixLineEnd(this.fixQuotes(data.content));
        content = content
            .replace(/[\n\t]/g, ' ')
            .replace(/\s+(<%[^=!\+])/g, '$1') // удаление пробелов между HTML-тегами и тегами шаблонизатора
            .replace(/\s+(<%=[^\+])/g, '$1') // удаление пробелов перед jst-тегами - <%=-
            .replace(/\s+(<%![^\+])/g, '$1') // удаление пробелов перед jst-тегами - <%!-
            .replace(/([^\+]%>) +/g, '$1') // удаление пробелов после jst-тегов - -%>
            .replace(/<%(=|!)?(\+|-)/g, '<%$1') // удаление режима пробелов в начале jst-тега
            .replace(/(\+|-)%>/g, '%>') // удаление режима пробелов в конце jst-тега
            .replace(/(<%)\s+/g, '$1 ') // удаление пробелов в начале внутри jst-тегов шаблонизатора
            .replace(/\s+(%>)/g, '$1')// удаление пробелов в конце внутри jst-тегов шаблонизатора
            .replace(/<%#.*?%>/g, '') // удаление комментариев
            .replace(/<%(=|!)? *?%>/g, '') // удаление пустых тегов <% %>, <%= %>, <%! %>
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
             // короткая форма фильтров
            .replace(/\t! ?(.*?)%>/g, function () { 
                return con.above.replace(/\$1/, that.addShortFilters(arguments[1]))
            })
            .replace(/\t= ?(.*?)%>/g, function () {
                return con.aboveHTML.replace(/\$1/, that.addShortFilters(arguments[1]));
            })
            .split("\t").join("';\n")
            .split("%>").join('\n' + tab + con.push)
            .split("\r").join("'");
        
        js += tab + con.push + content + con.close + "\n\n" + tab + "return " + con.ret + ";";
            
        js = js.replace(/\+ \'\' \+ __jst-empty-quotes__ /g, '+ ');
        js = js.replace(/= \'\' \+ __jst-empty-quotes__ /g, '= ');
        js = js.replace(/\! \'\' \+ __jst-empty-quotes__ /g, '= ');
        js = js.replace(/ \+ '' __jst-empty-quotes__;/g, ';');
        js = js.replace(/ __jst-empty-quotes__/g, '');
        js = js.replace(/    __jst \+= '';/g, '');
            
        var text = 'function (' + this.params(data.params) + ') {\n';
        text += js;
        text += '\n}';
        
        var code = data.namespace + '[\'' + this.quot(data.name) + '\'] = ' + text + ';'; 
        return {
            test: 'var jst = {};\n' + data.namespace + ' = {};\n' + code,
            normal: code,
            withoutNamespace: text
        }
    },
    // Приводим к одному виду окончания строк
    _fixLineEnd: function (text) {
        text = text.replace(/\r\n/g, '\n'); // фикс для Windows
        text = text.replace(/$\r|\r[^n]/mg, '\n'); // фикс для MacOS
        
        return text;
    },
    // Экранирование одинарной кавычки
    quot: function (text) {
        return ('' + text).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    },
    // Экранирование одинарной кавычки в шаблоне
    fixQuotes: function (text) {
        var buf = text.split('<%'),
            newBuf = [];
            
        buf.forEach(function (el) {
            if (el.search(/%>/) !== -1) {
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
    // Добавить фильтры
    addShortFilters: function (str) {
        var res = '',
            buf = str.split(/(?:[^|])\|(?!\|)/);
            
        // Если нет фильтров, то возвращаем строку как есть
        if (buf.length < 2) {
            return str;
        }
        
        buf.forEach(function (el, i) {
            var textParams = '';
            
            // Первый элемент не может быть фильтром
            if (!i) {
                res = el;
            } else {
                var f = el.split('(');
                var params = [];
                
                // Копируем параметры
                f.forEach(function (el, i) {
                    if (i) {
                        params.push(el);
                    }
                });
                
                // Удаляем из строки последнюю скобку
                if (params.length) {
                    params[params.length - 1] = params[params.length - 1].trim().replace(/\)$/, '');
                    textParams = params.join('(');
                }
                
                var filter = f[0].trim();
                // Если в фильтре не должно быть параметров, а в коде шаблона указаны, значит удаляем параметры
                if (jst.filter[filter] && jst.filter[filter].length < 2) {
                    textParams = '';
                }
                
                res = 'filter.' + filter + '(' + res + (textParams ? ',' + textParams : '') + ')';
            }
        });
        
        return res;
    },
    // Удаление пробелов между тегами
    deleteSpaces: function (text) {
        text = text.replace(/[\n\r\t]/g, ' ');
        text = text.replace(/ {2,}/g, ' ');
        
        return text;
    },
    // Проверка на корректность названия параметров у шаблона и значений по умолчанию
    checkParams: function (params) {
        var isError = false;
        if (params) {
            try {
                eval('var ' + params + ';');
            } catch(e) {
                isError = true;
            }
        }
        
        return !isError;
    },
    // Построение параметров у шаблона
    params: function (params) {
        var res = [],
            resWithIndex = [],
            sandbox = {},
            script,
            buf,
            len = 0,
            that = this;
        
        // Позиция параметра в параметрах - params="a, b, c"
        var getPosition = function (params, name) {
            var buf = params.split(',');
            
            buf = buf.map(function (el) {
                return ('' + el.split('=')[0]).trim();
            });
            
            buf = buf.filter(function (el) {
                    return that.isCorrectNameVariable(el);
            }, this);
            
            return buf.indexOf(name);
        };
        
        if (params) {
            // Если есть параметры по умолчанию, честно разбираем их
            if (params.search('=') !== -1) {
                script = vm.createScript('var ' + params);
                script.runInNewContext(sandbox);
                for (var i in sandbox) {
                    if (sandbox.hasOwnProperty(i)) {
                        len++;
                        resWithIndex.push({name: i, index: getPosition(params, i)});
                    }
                }
                
                if (len > 1) {
                    resWithIndex.sort(function (a, b) {
                        return a.index > b.index;
                    });
                }
                
                resWithIndex.forEach(function (el) {
                    res.push(el.name);
                });
            } else {
                var buf = params.split(',');
                buf.forEach(function (el) {
                    res.push(('' + el).trim());
                });
            }
        }
        
        return res.join(', ');
    },
    // Построение значений по умолчанию у параметров шаблона
    defaultValues: function (params) {
        var res = '',
            tab = this._tab,
            sandbox = {},
            script;
        
        if (params.search('=') !== -1) {
            script = vm.createScript('var ' + params);
            script.runInNewContext(sandbox);
            for (var i in sandbox) {
                if (sandbox.hasOwnProperty(i) && sandbox[i] !== undefined) {
                    res += tab + i + ' = typeof ' + i + ' === "undefined" ? ' + JSON.stringify(sandbox[i]) + ' : ' + i + ';\n';
                }
            }
        }
            
        return res;
    },
    // Проверка на одинаковое количество открытых и закрытых тегов <template>
    checkOpenCloseTag: function (text) {
        var isError = false,
            open = text.match(/<template/g),
            close = text.match(/<\/template>/g);
        
        if (!open || !close) {
            isError = true;
        }
        
        if (open && close && open.length !== close.length) {
            isError = true;
        }
        
        return !isError;
    },
    includeKernel: function (text) {
        return fs.readFileSync(__dirname + '/kernel.js') + '\n\n' + (text || '');
    }
};

module.exports = {
    compileFiles: function (files, prefs) {
        var res = [];            
        if (typeof files === 'string') {
            files = [files];
        }
        
        files.forEach(function (el) {
            res.push([fs.readFileSync(el, 'utf-8'), el]);
        });

        return Compiler.build(res, '', prefs);
    },
    compileText: function (text, prefs) {
        return Compiler.build(text, '', prefs);
    }
};
