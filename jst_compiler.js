#!/usr/bin/env node

/*
  jst - клиентский и серверный шаблонизатор на JavaScript
  -------------------------------------------------------
    - Наследование
    - Блоки
    - Компиляция шаблонов в js
    - Передача параметров в шаблон
    - Расширяемые фильтры
    - Экранирование HTML по умолчанию
    - Быстрое изучение

    
  Установка
  ---------
  git clone https://github.com/hcodes/jst.git
  cd ./jst
  npm install -g
  
  Быстрый старт
  -------------
  1. Установка в ОС jst.
  2. Создаём файл с расширением .jst - example.jst
  3. Содержание файла:
      <template name="example">
        Hello world!
      </template>
  4. jst_compiler example.jst example.jst.js
  5. Подключаем в странице
      ...
      <!-- Обвязка jst -->
      <script type="text/javascript" src="/js/jst.js"></script>
      
      <!-- Скомпилированные шаблоны -->
      <script type="text/javascript" src="/js/example.jst.js"></script>
      ...
  6. Вызов в js-коде:
    $('#test').jst('example'));
  
  Использование в коммандной строке
  ---------------------------------
  node ./jst_compiler.js -v  - версия компилятора  
  jst_compiler -v  - версия компилятора  

  компиляция одного шаблона в файл -> ./example.jst.js  
  jst_compiler ./example.jst  
  
  компиляция одного шаблона в файл -> ./example.jst.js  
  jst_compiler ./example.jst ./other_example.jst.js
  
  компиляция папки с шаблонами
  jst_compiler ./examples
  
  компиляция папки с шаблонами в один файл
  jst_compiler -a ./examples ./all.jst.js
    
  
  Пример шаблона (example.jst):
  -----------------------------
      <!-- Простейший шаблон -->
      <template name="example">
        Hello world!
      </template>

      <!-- Передача и вставка параметра -->
      <template name="example" params="word">
        Hello <%= word %>!
      </template>

      <!-- Передача и вставка параметра без экранирования -->
      <template name="example" params="word">
        Hello <%! word %>!
      </template>

      <!-- Параметры по умолчанию -->
      <template name="example" params="word = 'world'">
        Hello <%= world %>!
      </template>

      <!--  Инлайн-js -->
      <template name="example" params="word">
        Hello<% var b = word || 'world'; %> <%= b %>!
      </template>
      
      <!-- Комментарии --> 
      <template name="example" params="word">
        Hello <%# мой комментарий %>!
      </template>
      
      <!-- Более подробно -->
      <template name="example" params="x, y, z" trim="false">
        x: <%= x %><br />
        <% if (y > 5) { %>
        y: <%= y %><br />
        <% } %>
        z: <%= z - 10 %>
      </template>

      <!-- Использование фильтра -->
      <template name="example" params="x">
        <%= filter.trim(x) %>
      </template>
      
      <!-- Вызов другого шаблона -->
      <template name="example" params="x">
        <%= template('another_template', x) %>
      </template>

      <!-- Не удалять пробелы между HTML-тегами и тегами шаблонизатора -->
      <!-- В примере, если x=1 и y=2 => '1 2', без + => '12' -->
      <template name="example" params="x">
        <%= filter.trim(x) +%> <%=+ y %>
      </template>      

      <!-- Цикличный шаблон -->
      <template name="another_template" params="element, index, obj">
        <ul>
            <li>
                <%= index + 1 %>. <%= filter.html(element) %>
            </li>
        </ul>
      </template>
      <!-- В js: jst.forEach('example', data); -->
      
      <!-- Вызов цикла внутри шаблона -->
      <template name="example" params="data">
        ...
            <%= forEach('another_template', data) %>
        ...
      </template>
      
      <!-- Блоки -->
      <template name="others">
        <block name="block1" params="a">
            ...
        </block>
        <%= block('block1') %>
      </template>
      
      <!-- Наследование -->
      <template name="others">
        <block name="block1" params="a">
            ...
        </block>
        <%= block('block1');
      </template>
      
      <template name="others2" extend="others">
        <%= block('block1'); %>
      </template>

      <!-- Отладка -->
      <template name="example" params="data">
        ...
            <% console.log(data); %>
        ...
      </template>      
            
      Расширение файла у шаблона - .jst
      example.jst -> example.jst.js
            
      Вызов из js: jst(название шаблона, параметры...);
      jst('example', 1, 2, 3);
      
      
      
      
      
    TODO: 
        - краткая запись фильтров <%= a | trim %>
        - корректная проверка параметров по умолчанию
*/

var vm = require('vm');

var Compiler = {
    version: '1.7.3',
    defaultNamespace: 'jst._tmpl',
    _tab: '    ',
    // Построение шаблонов
    build: function (text, fileName) {
        var res = [];
        
        // Для размещения шаблонов из нескольких файлов в один общий файл
        if (Array.isArray(text)) {
            text.forEach(function (el) {
                this._fileName = el[1];
                res.push(this.fileMark());
                res.push(this._build(el[0]));
            }, this);
        } else  {
            this._fileName = fileName;
            text += this.fileMark();
            res.push(this._build(text));
        }
        
        res = res.join('');
        
        // Есть шаблоны в виде функций, чтобы не помещать в каждую функцию служебные переменные,
        // вынесим их в одно место через замыкание
        if (res.search(/function/) != -1) {
            res = '\n(function () {' +
                ['', 'var forEach = jst.forEach;',
                    'var filter = jst.filter;',
                    'var block = jst.block;',
                    'var template = jst;'].join('\n    ') + res + '\n\n})();';
        }
        
        return this.autoGen(res);
    },
    fileMark: function () {
        return '\n\n/* --- ' + this._fileName  + ' --- */\n';
    },
    _sameTemplateName: {},
    _sameBlockName: {},
    _extend: [],
    _build: function (text) {
        var inFile = this._inFile();
        
        if (!this.checkOpenCloseTag(text)) {
            return this.templateConsole('Неравное количество открытых и закрытых тегов <template>' + inFile);
        }
        
        var buf = [];
        var templates = text.match(/\<template(([\n\r]|.)*?)\<\/template\>/gm);
        
        if (!templates) {
            return this.templateConsole('Нет jst-шаблонов' + inFile);
        }

        templates.forEach(function (el, num) {
            var res =  this._template(el, num + 1);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);
        
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
        var res = this._template(text, num);
        var text = '';
        if (res.error) {
            text = this.templateConsole(res.error.text);
        } else {
            text = res.normal;
        }
        
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
        var concatenation = this.getAttr(text, 'concatenation') == 'array'  ? 'array' : 'string';
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
                    text: 'Нет имени (name) у шаблона № ' + num + inFile
                }
            };
        }
        
        if (typeof this._sameTemplateName[name] != 'undefined') {
            var files = [this._fileName, this._sameTemplateName[name]];
            console.log('Предупреждение: несколько шаблонов с одинаковым именем (name) "' + name + '". ' + (files[0] == files[1] ? 'Файл: ' + files[0] : 'Файлы:' + files.join(', ')));
        } else {
            this._sameTemplateName[name] = this._fileName;
        }        
        
        if (!this.checkParams(params)) {
            return {
                error: {
                    code: 2,
                    text: 'Некорректное название параметра (params) у шаблона "' + name + '" - "' + params + '"' + inFile
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
            hasBlock: hasBlock
        });
        
        try {
            eval(f.test);
        } catch(e) {
            console.log(e.toString());
            console.log(f.test)
            return {
                error: {
                    code: 4,
                    text: 'Ошибка компиляции jst-шаблона "' + name + '"' + inFile
                }
            };
        }
        
        if (hasBlock) {
                var tab = this._tab;
                var bufBlock = '(function () {\n';
                bufBlock += tab  + 'var f = function () {\n';
                bufBlock += tab + tab + 'this[\'__jst_constructor\'] = ' + f.withoutNamespace + ';\n';
                bufBlock += this.blocks(text, name);
                bufBlock += tab + '};\n\n';
                bufBlock += tab + this.defaultNamespace + 'Extend[\'' + this.quot(name) + '\'] = f;\n';
                bufBlock += tab + 'f.extend  = \'' + this.quot(extend) + '\';\n';
                bufBlock += '})();\n';
                if (extend) {
                    this._extend.push([name, extend]);
                }
                
                return bufBlock;
        }
        
        return f.normal;
    },
    hasBlock: function (text) {
        return text.search(/(?:\<block)(?:.*\>)(([\n\r]|.)*)(?:\<\/block\>)/) != -1;
    },
    blocks: function (text, template) {
        var buf = [];
        var blocks = text.match(/\<block(([\n\r]|.)*?)\<\/block\>/gm);
        
        this._sameBlockName = {};
        blocks.forEach(function (el, num) {
            var res =  this._block(el, num + 1, template);
            buf.push(res.error ? this.templateConsole(res.error.text) : res);
        }, this);
    
        return '\n' + buf.join('\n') + '\n';
    },
    _block: function (text, num, template) {
        var buf = text.match(/(?:\<block)(?:.*\>)(([\n\r]|.)*)(?:\<\/block\>)/m);
        var params = this.getAttr(text, 'params', true);
        var name =  this.getAttr(text, 'name', true);
        var trimm = this.getAttr(text, 'trim', true);
        var deleteSpaces = this.getAttr(text, 'delete-spaces', true);
        var concatenation = this.getAttr(text, 'concatenation', true) == 'array'  ? 'array' : 'string';
        var content = ('' + (buf[1] || ''));
        var inFile = this._inFile();
        var tab = this._tab;
        
        if (!name) {
            return {
                error: {
                    code: 10,
                    text: 'Нет имени (name) у блока № ' + num + ' в шаблоне ' + template + inFile
                }
            };
        }
        
        if (typeof this._sameBlockName[name] != 'undefined') {
            var files = [this._fileName, this._sameBlockName[name]];
            console.log('Предупреждение: несколько блоков с одинаковым именем (name) "' + name + '" в шаблоне "' + template + '". ' + (files[0] == files[1] ? 'Файл: ' + files[0] : 'Файлы:' + files.join(', ')));
        } else {
            this._sameBlockName[name] = this._fileName;
        }        
        
        if (!this.checkParams(params)) {
            return {
                error: {
                    code: 12,
                    text: 'Некорректное название параметра (params) у блока ' + name + ' в шаблоне "' + template + '" - "' + params + '"' + inFile
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
            console.log(e.toString());
            console.log(f.test)
            return {
                error: {
                    code: 14,
                    text: 'Ошибка компиляции jst-блока "' + name + '" в шаблоне "' + template + '" ' + inFile
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
        return !!(t != 'no' && t != 'none' && t !== 'false' && t != 'off');
    },
    // Проверка на корректность названия переменной в js
    isCorrectNameVariable: function (name) {
        var re  = /^[a-z$_][\w$_]*$/i;
        return re.test(name);
    },
    // Вывод ошибки
    error: function (text) {
        console.log('Error: ' + text + '\n');
    },
    // Построение шаблона в строку или js-функцию
    transform: function (data) {
        if (data.content.search(/\<\%/) == -1) {
            return this.withoutInlineJS(data);
        } else {
            return this.withInlineJS(data);
        }
    },
    // Построение из шаблона строки (без логики и вставки переменных)
    withoutInlineJS: function (data) {
        var text = '\'' + this.fixQuotes(data.content)
            .replace(/\r\n/g, "\n")
            .replace(/[\r\t\n]/g, " ") + '\'';
        var code = data.namespace + '[\'' + this.quot(data.name) + '\'] = ' + text + ';';
        
        return {
            test: 'var jst = {};\n' + data.namespace + ' = {};\n' + code,
            normal: code,
            withoutNamespace: text
        }    
    },
    // Построение из шаблона js-фунцию
    withInlineJS: function (data) {
        var tab = this._tab;
        var js = this.defaultValues(data.params);
        var content = this.fixQuotes(data.content);
        var concatenation = {
            'string': {
                init: "''",
                push: "__jst += '",
                above: "' + __jst-empty-quotes__ filter._undef($1) + '",
                aboveHTML: "' + __jst-empty-quotes__ filter.html($1) + '",
                close: "' __jst-empty-quotes__;",
                ret: "__jst"
            },
            'array': {
                init: "[]",
                push: "__jst.push('",
                above: "', filter._undef($1), '",
                aboveHTML: "', filter.html($1), '",
                close: "');",
                ret: "__jst.join('')"
            }
        };
        
        var con = concatenation['string'];
        js += tab + "var __jst = " + con.init + ";\n";
        
        if (data.hasBlock) {
            js += 'var __jst_template = \'' + this.quot(data.template) + '\';\n';
            js += 'var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; \n';
        }
        
        js += tab + con.push + content
              .replace(/\r\n/g, "\n")
              .replace(/[\t\n]/g, " ") // замена переносов строки и таба на пробелы
              .replace(/ +(<%[^=!\+])/g, '$1') // удаление пробелов между HTML-тегами и тегами шаблонизатора
              .replace(/ +(<%=[^\+])/g, '$1')
              .replace(/ +(<%![^\+])/g, '$1')
              .replace(/([^\+]%>) +/g, '$1')
              .replace(/<%(=|!)?(\+|-)/g, '<%$1')
              .replace(/(\+|-)%>/g, '%>')
              .replace(/(<%) {1,}/g, '$1 ') // удаление пробелов в начале тегов шаблонизатора
              .replace(/ {1,}(%>)/g, '$1')// удаление пробелов в конце тегов шаблонизатора
              .replace(/<%#.*?%>/g, '') // удаление комментариев
              .replace(/<%(=|!)? *?%>/g, '') // удаление пустых тегов <% %>, <%= %>, <%! %>
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t! ?(.*?)%>/g, con.above)
              .replace(/\t= ?(.*?)%>/g, con.aboveHTML)
              .split("\t").join("';\n")
              .split("%>").join(tab + con.push)
              .split("\r").join("'")
            + con.close + "\n\n" + tab + "return " + con.ret + ";";
            
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
    // Экранирование одинарной кавычки
    quot: function (text) {
        return ('' + text).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    },
    // Экранирование одинарной кавычки в шаблоне
    fixQuotes: function (text) {
        var buf = text.split('<%'),
            newBuf = [];
            
        buf.forEach(function (el) {
            if (el.search(/%>/) != -1) {
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
        var res = [];
        var sandbox = {};
        var script;
        var buf;
        if (params) {
            // Если есть параметры по умолчанию, честно разбираем их
            if (params.search('=') != -1) {
                script = vm.createScript('var ' + params);
                script.runInNewContext(sandbox);
                for (var i in sandbox) {
                    if (sandbox.hasOwnProperty(i)) {
                        res.push(i);
                    }
                }
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
        var res = '';
        var tab = this._tab;
        var sandbox = {};
        var script;
        
        if (params.search('=') != -1) {
            script = vm.createScript('var ' + params);
            script.runInNewContext(sandbox);
            for (var i in sandbox) {
                if (sandbox.hasOwnProperty(i) && sandbox[i] != undefined) {
                    res += tab + i + ' = typeof ' + i + ' == "undefined" ? ' + JSON.stringify(sandbox[i]) + ' : ' + i + ';\n';
                }
            }
        }
            
        return res;
    },
    // Проверка на равенство количество открытых и закрытых тегов <template>
    checkOpenCloseTag: function (text) {
        var isError = false;
        var open = text.match(/<template/g);
        var close = text.match(/<\/template>/g);
        
        if (!open || !close) {
            isError = true;
        }
        
        if (open && close && open.length != close.length) {
            isError = true;
        }
        
        return !isError;
    },
    autoGen: function (text) {
        var auto = '/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */';
        
        return auto + text + '\n\n' + auto;
    }
};

var fs = require('fs'),
    vm = require('vm'),
    pth = require('path'),
    flag = process.argv[2],
    fileArgv = 2,
    fileIn = process.argv[fileArgv],
    fileOut = process.argv[fileArgv + 1],
    files = [],
    isAll = false,
    isFind = false,
    isDebug = false,
    isPasteJst = false,
    isDir = function (path) {
        return fs.statSync(path).isDirectory();
    },
    buildTemplate = function (fileIn) {
        var template = fs.readFileSync(fileIn, 'utf-8');
        return Compiler.build(template, fileIn);
    },
    buildTemplates = function (files) {
        var res = [];
        files.forEach(function (el) {
            res.push([fs.readFileSync(el, 'utf-8'), el]);
        });
        
        return Compiler.build(res);
    },
    buildTemplateInFile = function (fileIn, fileOut) {
        if (!fileOut) {
            fileOut = fileIn + '.js';
        }
        
        var fd = fs.openSync(fileOut, 'w+');
        fs.writeSync(fd, buildTemplate(fileIn));
        fs.closeSync(fd);
    },
    buildTemplatesInFile = function (filesIn, fileOut) {
        fileOut = fileOut || './all.jst.js';
        
        var fd = fs.openSync(fileOut, 'w+');
        var jst = isPasteJst ? fs.readFileSync(__dirname + '/jst.js') + '\n\n' : '';
        fs.writeSync(fd, jst + buildTemplates(filesIn));
        fs.closeSync(fd);
    },
    findTemplates = function (path) {
        var res = [];
        var find = function (path) {
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
        
        find(path);
        
        return res;
    };
    
if (flag == '-d' || flag == '--debug') {
    isDebug = true;
    flag = process.argv[3];
    fileArgv++;
    fileIn = process.argv[fileArgv];
    fileOut = process.argv[fileArgv + 1];
}

switch (flag) {
    case '-v': // Версия компилятора
    case '--version':
        console.log('jst v' + Compiler.version);
        process.exit(0);
    break;
    case '-f': // Поиск jst-шаблонов
    case '--find':
        fileIn = process.argv[fileArgv + 1];
        fileOut = process.argv[fileArgv + 2];
        isFind = true;
    break;
    case '-a': // Сохранение скомпилированных шаблонов в один файл
    case '--all':
        var buf = process.argv[fileArgv + 1];
        fileArgv++;
        if (buf == '--paste' || buf == '-p') {
            isPasteJst = true;
            fileArgv++;
        }
        
        fileIn = process.argv[fileArgv];
        fileOut = process.argv[fileArgv + 1];
        
        isAll = true;
    break;
    case '-h': // Вывод справки
    case '--help':
        var help = 'Использование:\n\
\tnode jst_compiler.js [options] <directory-or-file> [directory-or-file, ...]\n\
Опции:\n\
\t--help\t\tПоказать эту помощь.\n\n\
\t--version\tВерсия компилятора.\n\n\
\t--version\tВерсия компилятора.\n\n\
\t--find\t\tНайти и вывести jst-шаблоны, node jst_compiler.js --find ./my_dir\n\n\
\t--all\t\tВсе шаблоны скомпилировать в один файл, node jst_compiler.js --all ./my_dir ./all.js.st\n\n\
\t--paste\t\tВставка обвязки для jst к скомпилированным шаблонам, работает только с использованием флага --all, node jst_compiler.js --all --paste ./my_dir ./all.js.st\n\n\
\t--debug\t\tРежим отладки\
';
    console.log(help);
    break;
}

if (!fileIn) {
    console.log('Не указан файл шаблона.\nПример: node jst_compiler.js ./example.jst');
    process.exit(1);
}

if (!fs.existsSync(fileIn)) {
    console.log('Файл или папка с шаблонами "' + fileIn + '" не найдены.');
    process.exit(1);
}    

if (isDir(fileIn)) {
    files = findTemplates(fileIn);
    if (!isFind) {
        if (isAll) {
            buildTemplatesInFile(files, fileOut);
        } else {
            files.forEach(function (el) {
                buildTemplateInFile(el);
            });
        }
     }
} else {
    files.push(fileIn);
    buildTemplateInFile(fileIn, fileOut);
}

if (files.length) {
    if (isDebug || isFind) {
        console.log('Всего шаблонов: ' + files.length + '\n------------------\n' + files.join('\n'));
    }
} else {
    console.log('Файлы с шаблонами (*.jst) не найдены.');
}

process.exit(0);