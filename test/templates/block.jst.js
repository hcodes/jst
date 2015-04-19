(function () {

'use strict';

var hasGlobal = typeof global !== 'undefined',
    glob = hasGlobal ? global : window,
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    isArray = Array.isArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    },
    isPlainObject = function(obj) {
        return toString.call(obj) === '[object Object]';
    },
    JST_CONSTR = '__jst_constructor';

if (typeof glob.jst === 'function') {
    return;
}

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
            f._name = name;
            return f.apply(f, slice.call(arguments, 1));
        break;
        case 'string':
            return f;
        break;
        case 'object':
            obj = f[JST_CONSTR];
            f._name = name;
            return typeof obj === 'string' ? obj : obj.apply(f, slice.call(arguments, 1));
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
    if (typeof f === 'object') {
        f._name = template;
        
        var obj = f[name],
            typeObj = typeof obj;
            
        if (typeObj === 'undefined') {
            throw new Error('Вызов несуществующего jst-блока "' + name + '" у шаблона "' + template + '".');
        } else {
            return typeObj === 'string' ? obj : obj.apply(f, slice.call(arguments, 2));
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
 * @param {(Array|Object)} data - данные по которым происходит перебор
 * @param {*} params - параметры
 * @return {string}
*/
jst.each = function (template, data, params) {
    if (!data) {
        return '';
    }
    
    var text = [],
        len = data.length,
        i;
        
    if (isArray(data)) {
        for (i = 0; i < len; i++) {
            text.push(jst(template, data[i], i, data, params));
        }
    } else if (typeof data === 'object') {
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                text.push(jst(template, data[i], i, data, params));
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
jst.eachBlock = function (template, blockName, data, params) {
    if (!data) {
        return '';
    }
    
    var text = [],
        i,
        len = data.length;
        
    if (isArray(data)) {
        for (i = 0; i < len; i++) {
            text.push(jst.block(template, blockName, data[i], i, data, params));
        }
    } else {
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                text.push(jst.block(template, blockName, data[i], i, data, params));
            }
        }
    }
    
    return text.join('');
};

var attr = function (name, value) {
    var n = jst.filter._undef(name),
        v = jst.filter._undef(value);

    if (n && v) {
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
jst.attr = function (name, value) {
    var buf = [];
    if (isPlainObject(name)) {
        for(var i in name) {
            if (name.hasOwnProperty(i)) { 
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
        var tmpl = jst._tmpl,
            child = jst._tmplExtend[childName],
            parent = jst._tmplExtend[parentName],
            warning = function(template) {
                return 'При наследовании не найден jst-шаблон "' + childName + '".';
            };
        
        if (typeof child === 'undefined') {
            throw new Error(warning(childName));

            return;
        } else if (typeof parent === 'undefined') {
            throw new Error(warning(parentName));

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

        if (!tmpl[childName][JST_CONSTR] && tmpl[parentName][JST_CONSTR]) {
            tmpl[childName][JST_CONSTR] = tmpl[parentName][JST_CONSTR];
        }
    };
    
    f(childName, parentName);
};

/**
 * Привязка шаблона с данными к DOM ноде и последующим обновлением по методу update()
 *
 * @param {string|DOMNode} - id или DOM нода вставки результаты выполнения шаблона
 * @param {string} - название шаблона
 * @return {Object}
*/
jst.bind = function (container, name) {
    var elem = typeof container === 'string' ? document.getElementById(container) : container,
        params = slice.call(arguments, 2);
    
    if (elem && name) {
        var jstParams = [name];
        if (params.length) {
            jstParams = jstParams.concat(params);
        }
        
        elem.innerHTML = jst.apply(this, jstParams);
    }

    return {
        update: function () {
            var bufJstParams = [name];
            if (arguments.length) {
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
    stripTags: function (str) {
        return  this._undef(str).replace(/<\/?[^>]+>/g, '');
    },
    // Экранирование урла
    uri: function (str) {
        return glob.encodeURI(this._undef(str)).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },
    // Обрезание строки нужной длины
    truncate: function (str, length) {
        str = this._undef(str);
        if (!str || str.length <= length) {
            return str;
        }
        
       return str.substr(0, length);
    },
    // Первый элемент для массива, для строки первый символ
    first: function (obj) {
        if (isArray(obj) || typeof obj === 'string') {
            return obj[0];
        }
        
        return this._undef(obj);
    },
    // Последний элемент для массива, для строки последний символ
    last: function (obj) {
        if (isArray(obj) || typeof obj === 'string') {
            return obj[obj.length - 1];
        }
        
        return this._undef(obj);
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
    // Удаление текста по рег. выражению 
    remove: function (str, search) {
        return this._undef(str).split(search).join('');
    },
    // Замена текста по рег. выражению 
    replace: function (str, search, replace) {
        return this._undef(str).split(search).join(replace);
    },
    // Удаление пробелов с начала и конца строки
    trim: function (str) {
        return this._trim(this._undef(str));
    },
    // Удаление пробелов с начала
    ltrim: function (str) {
        return this._undef(str).replace(/^\s+/g, '');
    },
    // Удаление пробелов c конца строки
    rtrim: function (str) {
        return this._undef(str).replace(/\s+$/g, '');
    },
    // Добавить текст перед вставкой текста
    prepend: function (str, text) {
        return this._undef(text) + this._undef(str);
    },
    // Добавить текст после вставкой текста
    append: function (str, text) {
        return this._undef(str) + this._undef(text);
    },
    // Сгруппировать массив по разделителю
    join: function (obj, separator) {
        if (isArray(obj)) {
            return obj.join(separator);
        }
        
        return this._undef(obj);
    },
    // Вывод пустоты (для отладки)
    'void': function () {
        return;
    },
    // Построение CSS-класса для HTML-атрибута class
    className: function (arr) {
        return isArray(arr) ? arr.join(' ') : arr;
    },
    // Замена undefined или null на пустую строку (для служебного использования)
    _undef: function (str) {
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
jst.filter.html = function (str) {
    return this._undef(str).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
};

// Разэкранирование HTML
jst.filter.unhtml = function (str) {
    return this._undef(str).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, function (s) {
        return unEntityMap[s];
    });
};

/**
 * Удаление пробелов с начала и конца строки
 * @param {string} str 
 * @param {boolean}
*/
jst.filter._trim = String.prototype.trim ? function (str) {
    return str.trim();
} : function (str) {
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

if (!hasGlobal) {
    /**
     * jst-хелпер для jQuery
     * @param {string} template - название шаблона
     * @param {...*} var_args
    */
    if (typeof jQuery !== 'undefined') {
        var fn = window.jQuery.fn;
        
        fn.jst = function () {
            this.html(jst.apply(this, arguments));
            
            return this;
        };
        
        fn.jstBlock = function () {
            this.html(jst.block.apply(this, arguments));
            
            return this;
        };
        
        fn.jstEach = function () {
            this.html(jst.each.apply(this, arguments));
            
            return this;
        };
        
        fn.jstEachBlock = function () {
            this.html(jst.eachBlock.apply(this, arguments));
            
            return this;
        };
    }
}

})();



(function () {
    var attr = jst.attr;
    var block = jst.block;
    var each = jst.each;
    var filter = jst.filter;
    var template = jst;

/* --- block.jst --- */
(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'block1x';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
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
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
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
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
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
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(forEachBlock('block1', [1,2,3])) + filter.html(forEachBlock('block2', [1,2,3]));

    return __jst;
};

        this['block1'] = '1';
        this['block2'] = function (name) {
    var __jst = '';
var __jst_template = 'foreach-block';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(name);

    return __jst;
};
    };

    jst._tmplExtend['foreach-block'] = f;
    f.extend  = '';
})();

jst._tmpl['nnn'] = '1 2 3 4 999';
(function () {
    var f = function () {
        this['__jst_constructor'] = '';

        this['head'] = '123';
        this['footer'] = '101112';
        this['main'] = function () {
    var __jst = '';
var __jst_template = 'page';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('head')) + filter.html(block('content')) + filter.html(block('footer'));

    return __jst;
};
    };

    jst._tmplExtend['page'] = f;
    f.extend  = '';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'block.page';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('main'));

    return __jst;
};

        this['content'] = 'abc';
    };

    jst._tmplExtend['block.page'] = f;
    f.extend  = 'page';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'page.constructor';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('head')) + filter.html(block('content')) + filter.html(block('footer'));

    return __jst;
};

        this['head'] = '123';
        this['footer'] = '101112';
    };

    jst._tmplExtend['page.constructor'] = f;
    f.extend  = '';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = '';

        this['content'] = 'abc';
    };

    jst._tmplExtend['block.page.empty.constructor'] = f;
    f.extend  = 'page.constructor';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'withBlocks';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('block1')) + filter.html(block('block2'));

    return __jst;
};

        this['block1'] = '123';
        this['block2'] = '456';
    };

    jst._tmplExtend['withBlocks'] = f;
    f.extend  = '';
})();

(function () {
    var f = function () {
        this['__jst_constructor'] = function () {
    var __jst = '';
var __jst_template = 'withoutBlocks';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('block1'));

    return __jst;
};
    };

    jst._tmplExtend['withoutBlocks'] = f;
    f.extend  = 'withBlocks';
})();

    jst._init('block1x');
    jst._init('foreach-block');
    jst._init('page');
    jst._init('page.constructor');
    jst._init('withBlocks');
    jst._extend('block2x', 'block1x');
    jst._extend('block3x', 'block2x');
    jst._extend('block.page', 'page');
    jst._extend('block.page.empty.constructor', 'page.constructor');
    jst._extend('withoutBlocks', 'withBlocks');

})();