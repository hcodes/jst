///////////////////////////////////////////////////////////////
//// Простой шаблонизатор на JavaScript для клиента и сервера
///////////////////////////////////////////////////////////////

/**
 * Вызов шаблонизатора
 *
 * @param {string} name - название шаблона
 * @param {...*} var_args
 * @return {string}
*/
var jst = function (name) {
    var f = jst._tmpl[name];
    var obj;
    
    switch(typeof f) {
        case 'function':
            return f.apply(this, Array.prototype.slice.call(arguments, 1));
        break;
        case 'string':
            return f;
        break;
        case 'object':
            obj = f['__jst_constructor'];
            return typeof obj == 'string' ? obj : obj.apply(f, Array.prototype.slice.call(arguments, 1));
        break;
        case 'undefined':
            throw new Error('Вызов несуществующего jst-шаблона "' + name + '".');
        break;
    }
    
    return '';
};

/**
 * Вызов блока
 *
 * @param {string} template - название шаблона
 * @param {string} name - название блока
 * @return {string}
*/
jst.block = function (template, name) {
    var f = jst._tmpl[template];
    if (typeof f == 'object') {
        var obj = f[name];
        var typeObj = typeof obj;
        if (typeObj == 'undefined') {
            throw new Error('Вызов несуществующего jst-блока "' + name + '" шаблон "' + template + '".');
        } else {
            return typeObj == 'string' ? obj : obj.apply(f, Array.prototype.slice.call(arguments, 2));
        }
    } else {
        throw new Error('Вызов несуществующего jst-шаблона "' + template + '".');
    }
    
    return '';
};

/**
 * Цикличный вызов шаблона
 *
 * @param {string} template - название шаблона
 * @param {(Array|Object)} data - данные
 * @param {*} context - контекст
 * @return {string}
*/
jst.forEach = function (template, data, context) {
    var text = [];
    var i, len = data.length;
    context = context || {};
    if (Object.prototype.toString.call(data) === "[object Array]") { // Array.isArray
        for (i = 0; i < len; i++) {
            text.push(jst.call(context, template, data[i], i, data));
        }
    } else {
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                text.push(jst.call(context, template, data[i], i, data));
            }
        }
    }
    
    return text.join('');
};

/**
 * Цикличный вызов блока у шаблона
 *
 * @param {string} template - название шаблона
 * @param {string} blockName - название блока
 * @param {(Array|Object)} data - данные
 * @param {*} context - контекст
 * @return {string}
*/
jst.forEachBlock = function (template, blockName, data, context) {
    var text = [];
    var i, len = data.length;
    context = context || {};
    if (Object.prototype.toString.call(data) === "[object Array]") { // Array.isArray
        for (i = 0; i < len; i++) {
            text.push(jst.block.call(context, template, blockName, data[i], i, data));
        }
    } else {
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                text.push(jst.block.call(context, template, blockName, data[i], i, data));
            }
        }
    }
    
    return text.join('');
};


/**
 * Инициализация шаблона с блоками
 *
 * @param {string} name имя шаблона 
*/
jst._init = function (name) {
    var tmpl = jst._tmpl;
    var buf = jst._tmplExtend[name];
    
    if (!buf.extended) {
        tmpl[name] = new buf;
        buf.extended = true;
    }
};

/**
 * Наследование шаблона
 *
 * @param {string} childName 
 * @param {string} parentName
*/
jst._extend = function (childName, parentName) {
    var f = function (childName, parentName) {
        var tmpl = jst._tmpl;
        var child = jst._tmplExtend[childName];
        var parent = jst._tmplExtend[parentName];
        
        if (typeof child == 'undefined') {
                throw new Error('При наследовании не найден jst-шаблон "' + childName + '".');
                return;
        } else if (typeof parent == 'undefined') {
                throw new Error('При наследовании не найден jst-шаблон "' + parentName + '".');
                return;
        }
        
        if (parent.extend) {
            if (!parent.extended) {
                f(parentName, parent.extend);
            }
        } else  {
            tmpl[parentName] = new parent;
            parent.extended = true;
        }
        
        child.prototype = tmpl[parentName];
        child.extended = true;
        tmpl[childName] = new child;
    };
    
    f(childName, parentName);
};

/**
 * Привязка шаблона с данными к DOM ноде
 *
 * @param {string|DOMNode} - id или DOM нода вставки результаты выполнения шаблона
 * @param {string} - название шаблона
 * @return {Object}
*/
jst.bind = function (container, name) {
    var elem = typeof container == 'string' ? document.getElementById(containter) : container;
    var result = undefined;
    var params = Array.prototype.slice(arguments, 2);
    if (!params.length) {
        params = undefined;
    }
    
    if (elem && name) {
        var jstParams = [name];
        if (params) {
            jstParams = jstParams.concat(params);
        }
        
        result = jst.apply(this, jstParams);
        elem.innerHTML = result;
    }

    var obj = {
        name: name,
        container: container,
        elem: elem,
        params: params,
        result: result,
        guid: jst.guid(),
        block: function (name) {
            //findBlock
        },
        update: function () {
            var params;
            var jstParams = [obj.name];
            if (arguments.length) {
                jstParams = jstParams.concat(arguments);
            }
            
            obj.params = params;
            obj.result = jst.apply(this, jstParams);
            if (obj.elem) {
                obj.elem.innerHTML = obj.result;
            }
        }
    };
    
    return obj;
};

/**
 * Идентификатор для шаблона
 *
 * @return {number}
*/
jst.guid = function () {
    return jst._guid++;
};

jst._guid = 0;

/**
 * Фильтры шаблонизатора (расширяемые)
 * @namespace 
*/
jst.filter = {
    // Экранирование HTML
    html: function (str) {
        return this._undef(str).replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');    
    },    
    // Разэкранирование HTML
    unhtml: function (str) {
        return this._undef(str).replace(/\&quot;/g, '"')
            .replace(/\&gt;/g, '>')
            .replace(/\&lt;/g, '<')
            .replace(/\&amp;/g, '&');
    },
    // Удаление HTML-тегов
    stripTags: function (str) {
        return  this._undef(str).replace(/<\/?[^>]+>/g, '');
    },
    // Экранирование урла
    uri: function (str) {
        return encodeURI(this._undef(str)).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },
    // Обрезание строки нужной длины
    truncate: function (str, length) {
        str = this._undef(str);
        if (!str || str.length <= length) { return str; }
        
       return str.substr(0, length);    
    },
    // Удаление пробелов с начала и конца строки
    trim: function (str) {
        return this._undef(str).trim();
    },
    // Перевод символов в верхний регистр
    upper: function (str) {
        return this._undef(str).toUpperCase();
    },
    // Перевод символов в нижний регистр
    lower: function (str) {
        return this._undef(str).toLowerCase();
    },
    // Первый символ в верхний регистр
    ucfirst: function (str) {
        str = this._undef(str);
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    // Первый символ в нижний регистр
    lcfirst: function (str) {
        str = this._undef(str);
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    },
    // Удаление повторяющихся пробелов 
    collapse: function (str) {
        return this._undef(str).replace(/\s{2,}/g, ' ').trim();
    },
    // Повторить строку нужное количество раз
    repeat: function (str, num) {
        num = num || 1;
        num++;
        
        return new Array(num).join(this._undef(str));
    },
    // К переносам строки добавляем нужный отступ
    indent: function (str, pre) {
        str = this._undef(str).replace(/\r\n/g, '\n');
        pre = '' + pre;
        
        if (!str) {
            return str;
        }
        
        return pre + str.split(/\n|\r/).join('\n' + pre);
    },
    // Удаление текста по рег. выражению 
    remove: function (str, search) {
        return this._undef(str).split(search).join('');
    },
    // Замена текста по рег. выражению 
    replace: function (str, search, replace) {
        return this._undef(str).split(search).join(replace);
    },
    // Замена undefined или null на пустую строку (для служебного использования)
    _undef: function (str) {
        return typeof str === 'undefined' || str === null ? '' : '' + str;
    }
};

/**
 * Место хранения шаблонов (функций или строк)
 * @namespace 
*/
jst._tmpl = {};

/**
 * Место хранения шаблонов для наследования
 * @namespace 
*/
jst._tmplExtend = {};

/**
 * Добавление шаблона (функции или строки) в пространство jst
 * @param {string} name - имя шаблона
 * @param {string|function} template - шаблона
*/
jst.add = function (name, template) {
    jst._tmpl[name] = template;
};

/**
 * Удаление шаблона из пространства jst
 * @param {string} name - имя шаблона
*/
jst.remove = function (name) {
    delete jst._tmpl[name];
};

/**
 * Получить шаблон из пространства jst
 * @param {string} name - имя шаблона
 * @return {string|function} - шаблон
*/
jst.get = function (name) {
    return jst._tmpl[name];
};

/**
 * Проверка наличия шаблона в пространстве jst
 * @param {string} name - имя шаблона
 * @return {boolean}
*/
jst.has = function (name) {
    return !!jst.get(name);
};

/**
 * jst-хелпер для jQuery
 * @param {string} template - название шаблона
 * @param {...*} var_args
*/
if (typeof jQuery != 'undefined') {
    jQuery.fn.jst = function () {
        this.html(jst.apply(this, arguments));
        return this;
    };
}

// Для работы в nodejs
if (typeof global != 'undefined') {
    global.jst = jst;
}

// Хелпер для BEMHTML
jst.bem = function (block, params) {
    params = params || {};
    params.block = block;
    return BEMHTML.apply(BEM.JSON.build(params));
};

/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */
(function () {
    var forEach = jst.forEach;
    var filter = jst.filter;
    var block = jst.block;
    var template = jst;

/* --- block.jst --- */
(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'block1x';
var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; 
    __jst += 'Blocks:' + filter.html(block('block1')) + '<br />' + filter.html(block('block2')) + '<br />' + filter.html(block('block3'));

    return __jst;
};

        this['block1'] = 'block1x block1';
        this['block2'] = 'block1x block2';
        this['block3'] = 'block1x block3';
    };

    jst._tmplExtend['block1x'] = f;
    f.extend  = '';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'block2x';
var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; 
    __jst += 'Blocks:' + filter.html(block('block1')) + '<br />' + filter.html(block('block2')) + '<br />' + filter.html(block('block3'));

    return __jst;
};

        this['block2'] = 'block2x block2';
        this['block3'] = 'block2x block3';
    };

    jst._tmplExtend['block2x'] = f;
    f.extend  = 'block1x';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'block3x';
var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; 
    __jst += 'Blocks:' + filter.html(block('block1')) + '<br />' + filter.html(block('block2')) + '<br />' + filter.html(block('block3'));

    return __jst;
};

        this['block3'] = 'block3x block3';
    };

    jst._tmplExtend['block3x'] = f;
    f.extend  = 'block2x';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'foreach-block';
var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; 
    __jst += filter.html(forEachBlock('block1', [1,2,3])) + filter.html(forEachBlock('block2', [1,2,3]));

    return __jst;
};

        this['block1'] = '1';
        this['block2'] = function (name) {
    var __jst = '';
var __jst_template = 'foreach-block';
var block = function (name) { return jst.block.apply(this, [__jst_template].concat(Array.prototype.slice.call(arguments)));}; 
    __jst += filter.html(name);

    return __jst;
};
    };

    jst._tmplExtend['foreach-block'] = f;
    f.extend  = '';
})();

jst._tmpl['nnn'] = function (a) {
    var __jst = '';
    __jst += filter.html(a) + '1' + filter.html(a) + '1 1' + filter.html(a);

    return __jst;
};
    jst._extend('block2x', 'block1x');
    jst._extend('block3x', 'block2x');

/* --- filter.jst --- */
jst._tmpl['filter-html'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.html(a));

    return __jst;
};
jst._tmpl['filter-unhtml'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.unhtml(a));

    return __jst;
};
jst._tmpl['filter-stripTags'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.stripTags(a));

    return __jst;
};
jst._tmpl['filter-uri'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.uri(a));

    return __jst;
};
jst._tmpl['filter-truncate'] = function (text, length) {
    var __jst = '';
    __jst += filter.html(filter.truncate(text, length));

    return __jst;
};
jst._tmpl['filter-trim'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.trim(a));

    return __jst;
};
jst._tmpl['filter-upper'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.upper(a));

    return __jst;
};
jst._tmpl['filter-lower'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.lower(a));

    return __jst;
};
jst._tmpl['filter-ucfirst'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.ucfirst(a));

    return __jst;
};
jst._tmpl['filter-lcfirst'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.lcfirst(a));

    return __jst;
};
jst._tmpl['filter-collapse'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.collapse(a));

    return __jst;
};
jst._tmpl['filter-repeat'] = function (text, length) {
    var __jst = '';
    __jst += filter.html(filter.repeat(text, length));

    return __jst;
};
jst._tmpl['filter-indent'] = function (text, pre) {
    var __jst = '';
    __jst += filter.html(filter.indent(text, pre));

    return __jst;
};
jst._tmpl['filter-remove'] = function (text, search) {
    var __jst = '';
    __jst += filter.html(filter.remove(text, search));

    return __jst;
};
jst._tmpl['filter-replace'] = function (text, search, replace) {
    var __jst = '';
    __jst += filter.html(filter.replace(text, search, replace));

    return __jst;
};
jst._tmpl['filter-_undef'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter._undef(a));

    return __jst;
};
jst._tmpl['short-filter-trim'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.trim(a));

    return __jst;
};
jst._tmpl['short-filter-replace'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.replace(a,'1', '0'));

    return __jst;
};
jst._tmpl['short-filter-trim-replace'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.replace(filter.trim(a),'1', '0'));

    return __jst;
};
jst._tmpl['short-filter-trim-replace-trim'] = function (a) {
    var __jst = '';
    __jst += filter._undef(filter.trim(filter.replace(filter.trim(a),'1', ' ')));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.trim(a));

    return __jst;
};
jst._tmpl['escape-html-short-filter-replace'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.replace(a,'1', '0'));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim-replace'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.replace(filter.trim(a),'1', '0'));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim-replace-trim'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.trim(filter.replace(filter.trim(a),'1', ' ')));

    return __jst;
};

/* --- main.jst --- */
jst._tmpl['trim'] = '';
jst._tmpl['without-trim'] = ' 123 ';
jst._tmpl['without-trim-delete-spaces'] = '       123      ';
jst._tmpl['trim-with-number'] = function () {
    var __jst = '';
    __jst += filter.html(1);

    return __jst;
};
jst._tmpl['qqq'] = function () {
    var __jst = '';

 q


    return __jst;
};
jst._tmpl['new-line'] = '      ';
jst._tmpl['without-inline-js'] = 'Hello world!';
jst._tmpl['with-inline-js'] = function (a, b, c) {
    var __jst = '';
    __jst += 'Hello';
 if (a) {
    __jst += filter.html(a) + '';
 }
    __jst += 'world!';

    return __jst;
};
jst._tmpl['same-template-name'] = function (a) {
    var __jst = '';
    __jst += filter.html(a);

    return __jst;
};
jst._tmpl['same-template-name'] = function (a) {
    var __jst = '';
    __jst += filter.html(a + 10);

    return __jst;
};
jst._tmpl['quotes'] = '\'\'\'';
jst._tmpl['quotes-with-slash'] = function (a) {
    var __jst = '';
    __jst += '\\\'\\\'\\\'' + filter.html(a + '\'') + '\'\'\' \\\'\\\'\\\'';

    return __jst;
};
jst._tmpl['empty-string'] = function () {
    var __jst = '';


    return __jst;
};
jst._tmpl['call-template'] = function (a) {
    var __jst = '';
    __jst += filter.html(a) + '__' + filter.html(template('call-template2', 1)) + '__' + filter.html(a);

    return __jst;
};
jst._tmpl['call-template2'] = function (a) {
    var __jst = '';
    __jst += filter.html(a + 10);

    return __jst;
};

/* --- params.jst --- */
jst._tmpl['without-params'] = function () {
    var __jst = '';
    __jst += filter.html(2 + 2);

    return __jst;
};
jst._tmpl['params-x-xx-xxx'] = function (x, xx, xxx) {
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(xx) + '_' + filter.html(xxx);

    return __jst;
};
jst._tmpl['with-4-params'] = function (a, b, c, d) {
    var __jst = '';
    __jst += filter.html(a) + filter.html(b) + filter.html(c) + filter.html(d);

    return __jst;
};
jst._tmpl['default-params'] = function (x, y, z) {
    z = typeof z == "undefined" ? "world" : z;
    y = typeof y == "undefined" ? 2 : y;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y + 2) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-array'] = function (x, y, z) {
    z = typeof z == "undefined" ? "world" : z;
    y = typeof y == "undefined" ? [1,3,4] : y;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y[1]) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-object'] = function (x, y, z) {
    z = typeof z == "undefined" ? "world" : z;
    y = typeof y == "undefined" ? {"x":1,"y":3,"z":4} : y;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-some-objects'] = function (x, y, z, w) {
    z = typeof z == "undefined" ? {"x":2,"y":4,"z":5} : z;
    y = typeof y == "undefined" ? {"x":1,"y":3,"z":4} : y;
    w = typeof w == "undefined" ? {"x":"a","y":{"a":1}} : w;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z.x) + '_' + filter.html(w.x);

    return __jst;
};

})();

/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */