(function() {

'use strict';

var hasGlobal = typeof global !== 'undefined',
    glob = hasGlobal ? global : window,
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    isArray = Array.isArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    },
    isPlainObject = function(obj) {
        return toString.call(obj) === '[object Object]';
    },
    JST_CONSTR = '__jstConstructor';

if(typeof glob.jst === 'function') {
    return;
}

/**
 * Вызов шаблонизатора
 *
 * @param {...*} name
 *
 * @return {string}
*/
var jst = function(name) {
    var f = jst._tmpl[name],
        tf = typeof f,
        res = '';

    if(tf === 'undefined') {
        throw new Error('Вызов несуществующего jst-шаблона "' + name + '".');
    }
    
    switch(tf) {
        case 'function':
            f._name = name;
            res = f.apply(f, slice.call(arguments, 1));
        break;
        case 'string':
            res = f;
        break;
        case 'object':
            var obj = f[JST_CONSTR];
            f._name = name;
            res = typeof obj === 'string' ? obj : obj.apply(f, slice.call(arguments, 1));
        break;
    }

    return res;
};

/**
 * Вызов блока
 *
 * @param {string} templateName
 * @param {string} blockName
 * @return {string}
*/
jst.block = function(templateName, blockName) {
    var f = jst._tmpl[templateName];
    if(typeof f === 'object') {
        f._name = templateName;

        var obj = f[blockName],
            typeObj = typeof obj;

        if(typeObj === 'undefined') {
            throw new Error('Вызов несуществующего jst-блока "' + blockName + '" у шаблона "' + templateName + '".');
        } else {
            return typeObj === 'string' ? obj : obj.apply(f, slice.call(arguments, 2));
        }
    } else {
        throw new Error('Вызов несуществующего jst-шаблона "' + templateName + '".');
    }

    return '';
};

/**
 * Цикличный вызов шаблона
 *
 * @param {string} templateName
 * @param {(Array|Object)} data
 * @param {*} templateParams
 * @return {string}
*/
jst.each = function(templateName, data, templateParams) {
    if(!data) {
        return '';
    }

    var text = [],
        len = data.length,
        i;

    if(isArray(data)) {
        for(i = 0; i < len; i++) {
            text.push(jst(templateName, data[i], i, data, templateParams));
        }
    } else if(typeof data === 'object') {
        for(i in data) {
            if(data.hasOwnProperty(i)) {
                text.push(jst(templateName, data[i], i, data, templateParams));
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
 * @param {(Array|Object)} data - данные для перебора
 * @param {*} params - параметры
 * @return {string}
*/
jst.eachBlock = function(template, blockName, data, params) {
    if(!data) {
        return '';
    }

    var text = [],
        i,
        len = data.length;

    if(isArray(data)) {
        for(i = 0; i < len; i++) {
            text.push(jst.block(template, blockName, data[i], i, data, params));
        }
    } else {
        for(i in data) {
            if(data.hasOwnProperty(i)) {
                text.push(jst.block(template, blockName, data[i], i, data, params));
            }
        }
    }

    return text.join('');
};

var attr = function(name, value) {
    var n = jst.filter._undef(name),
        v = jst.filter._undef(value);

    if(n && v) {
        v = isArray(v) ? v.join(' ') : v;
        return ' ' + jst.filter.html(n) + '="' + jst.filter.html(v) + '"';
    } else {
        return '';
    }
};

/**
 * Генерирует HTML-код для атрибута или атрибутов
 *
 * @param {string|Object} name - название атрибута или хеш с атрибутами
 * @param {string} value - значение атрибута
 * @return {string}
*/
jst.attr = function(name, value) {
    var buf = [];
    if(isPlainObject(name)) {
        for(var i in name) {
            if(name.hasOwnProperty(i)) {
                buf.push(attr(i, name[i]));
            }
        }

        return buf.join('');
    } else {
        return attr(name, value);
    }
};

/**
 * Инициализация шаблона с блоками
 *
 * @param {string} name - имя шаблона
*/
jst._init = function(name) {
    var tmpl = jst._tmpl;
    var Buf = jst._tmplExtend[name];

    if(!Buf.extended) {
        tmpl[name] = new Buf();
        Buf.extended = true;
    }
};

/**
 * Наследование шаблона
 *
 * @param {string} childName
 * @param {string} parentName
*/
jst._extend = function(childName, parentName) {
    var f = function(childName, parentName) {
        var tmpl = jst._tmpl,
            Child = jst._tmplExtend[childName],
            Parent = jst._tmplExtend[parentName],
            warning = function(template) {
                return 'При наследовании не найден jst-шаблон "' + childName + '".';
            };

        if(typeof Child === 'undefined') {
            throw new Error(warning(childName));
        } else if(typeof Parent === 'undefined') {
            throw new Error(warning(parentName));
        }

        if(Parent.extend) {
            if(!Parent.extended) {
                f(parentName, Parent.extend);
            }
        } else {
            tmpl[parentName] = new Parent();
            Parent.extended = true;
        }

        Child.prototype = tmpl[parentName];
        Child.extended = true;
        tmpl[childName] = new Child();

        if(!tmpl[childName][JST_CONSTR] && tmpl[parentName][JST_CONSTR]) {
            tmpl[childName][JST_CONSTR] = tmpl[parentName][JST_CONSTR];
        }
    };

    f(childName, parentName);
};

/**
 * Привязка шаблона с данными к DOM ноде и последующим обновлением по методу update()
 *
 * @param {string|DOMNode} container - id или DOM нода вставки результаты выполнения шаблона
 * @param {string} name - название шаблона
 * @return {Object}
*/
jst.bind = function(container, name) {
    var elem = typeof container === 'string' ? document.getElementById(container) : container,
        params = slice.call(arguments, 2);

    if(elem && name) {
        var jstParams = [name];
        if(params.length) {
            jstParams = jstParams.concat(params);
        }

        elem.innerHTML = jst.apply(this, jstParams);
    }

    return {
        update: function() {
            var bufJstParams = [name];
            if(arguments.length) {
                bufJstParams = bufJstParams.concat(slice.call(arguments));
                jstParams = bufJstParams;
            } else {
                bufJstParams = jstParams;
            }

            elem.innerHTML = jst.apply(this, bufJstParams);
        }
    };
};

/**
 * Фильтры шаблонизатора
 * @namespace
*/
jst.filter = {
    // Удаление HTML-тегов
    stripTags: function(str) {
        return  this._undef(str).replace(/<\/?[^>]+>/g, '');
    },
    // Экранирование урла
    uri: function(str) {
        return glob.encodeURI(this._undef(str)).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },
    // Обрезание строки нужной длины
    truncate: function(str, length) {
        str = this._undef(str);
        if(!str || str.length <= length) {
            return str;
        }

       return str.substr(0, length);
    },
    // Первый элемент для массива, для строки первый символ
    first: function(obj) {
        if(isArray(obj) || typeof obj === 'string') {
            return obj[0];
        }

        return this._undef(obj);
    },
    // Последний элемент для массива, для строки последний символ
    last: function(obj) {
        if(isArray(obj) || typeof obj === 'string') {
            return obj[obj.length - 1];
        }

        return this._undef(obj);
    },
    // Перевод символов в верхний регистр
    upper: function(str) {
        return this._undef(str).toUpperCase();
    },
    // Перевод символов в нижний регистр
    lower: function(str) {
        return this._undef(str).toLowerCase();
    },
    // Первый символ в верхний регистр
    ucfirst: function(str) {
        str = this._undef(str);

        return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    // Первый символ в нижний регистр
    lcfirst: function(str) {
        str = this._undef(str);

        return str.substr(0, 1).toLowerCase() + str.substr(1);
    },
    // Удаление повторяющихся пробелов
    collapse: function(str) {
        return this._undef(str).replace(/\s{2,}/g, ' ').trim();
    },
    // Повторить строку нужное количество раз
    repeat: function(str, num) {
        num = num || 1;
        num++;

        return new Array(num).join(this._undef(str));
    },
    // Удаление текста по рег. выражению
    remove: function(str, search) {
        return this._undef(str).split(search).join('');
    },
    // Замена текста по рег. выражению
    replace: function(str, search, replace) {
        return this._undef(str).split(search).join(replace);
    },
    // Удаление пробелов с начала и конца строки
    trim: function(str) {
        return this._trim(this._undef(str));
    },
    // Удаление пробелов с начала
    ltrim: function(str) {
        return this._undef(str).replace(/^\s+/g, '');
    },
    // Удаление пробелов c конца строки
    rtrim: function(str) {
        return this._undef(str).replace(/\s+$/g, '');
    },
    // Добавить текст перед вставкой текста
    prepend: function(str, text) {
        return this._undef(text) + this._undef(str);
    },
    // Добавить текст после вставкой текста
    append: function(str, text) {
        return this._undef(str) + this._undef(text);
    },
    // Сгруппировать массив по разделителю
    join: function(obj, separator) {
        if(isArray(obj)) {
            return obj.join(separator);
        }

        return this._undef(obj);
    },
    // Вывод пустоты (для отладки)
    'void': function() {
        return;
    },
    // Построение CSS-класса для HTML-атрибута class
    className: function(arr) {
        return isArray(arr) ? arr.join(' ') : arr;
    },
    // Замена undefined или null на пустую строку (для служебного использования)
    _undef: function(str) {
        return typeof str === 'undefined' || str === null ? '' : '' + str;
    }
};

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
};

var unEntityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': '\'',
    '&#x2F;': '/'
};

// Экранирование HTML
jst.filter.html = function(str) {
    return this._undef(str).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
};

// Разэкранирование HTML
jst.filter.unhtml = function(str) {
    return this._undef(str).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, function(s) {
        return unEntityMap[s];
    });
};

/**
 * Удаление пробелов с начала и конца строки
 * @param {string} str
 * @return {string}
*/
jst.filter._trim = String.prototype.trim ? function(str) {
    return str.trim();
} : function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

jst.isArray = isArray;

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

glob.jst = jst;

if(!hasGlobal) {
    /**
     * jst-хелпер для jQuery
     * @param {string} template - название шаблона
     * @param {...*} var_args
    */
    if(typeof jQuery !== 'undefined') {
        var fn = window.jQuery.fn;

        fn.jst = function() {
            this.html(jst.apply(this, arguments));

            return this;
        };

        fn.jstBlock = function() {
            this.html(jst.block.apply(this, arguments));

            return this;
        };

        fn.jstEach = function() {
            this.html(jst.each.apply(this, arguments));

            return this;
        };

        fn.jstEachBlock = function() {
            this.html(jst.eachBlock.apply(this, arguments));

            return this;
        };
    }
}

})();
