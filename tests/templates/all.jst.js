///////////////////////////////////////////////////////////////
//// jst - клиентский и серверный шаблонизатор на JavaScript 
//// Лицензия: MIT
///////////////////////////////////////////////////////////////

(function () {

'use strict';

var hasGlobal = typeof global !== 'undefined',
    glob =  hasGlobal ? global : window,
    slice = Array.prototype.slice,
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
        
    if (jst.isArray(data)) {
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
        
    if (jst.isArray(data)) {
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

/**
 * Для удобной вставки атрибута в HTML
 *
 * @param {string} name - название атрибута
 * @param {string} value - значение атрибута
 * @return {string}
*/
jst.attr = function (name, value) {
    if (name && value) {
        return ' ' + jst.filter.html(name) + '="' + jst.filter.html(value) + '" ';
    } else {
        return ' ';
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

        if (!tmpl[childName][JST_CONSTR]  && tmpl[parentName][JST_CONSTR]) {
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
        if (jst.isArray(obj) || typeof obj === 'string') {
            return obj[0];
        }
        
        return this._undef(obj);
    },
    // Последний элемент для массива, для строки последний символ
    last: function (obj) {
        if (jst.isArray(obj) || typeof obj === 'string') {
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
        if (jst.isArray(obj)) {
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
        return jst.isArray(arr) ? arr.join(' ') : arr;
    },
    // Замена undefined или null на пустую строку (для служебного использования)
    _undef: function (str) {
        return typeof str === 'undefined' || str === null ? '' : '' + str;
    }
};

(function () {
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
})();

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

/**
 * Проверка на массив
 * @param {*} obj
 * @param {boolean}
*/
jst.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
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

/* The template automatically generated by jst, not edit it. */
(function () {
    var attr = jst.attr;
    var block = jst.block;
    var each = jst.each;
    var filter = jst.filter;
    var template = jst;

/* --- templates\block.jst --- */
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

/* --- templates\filter.jst --- */
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
jst._tmpl['filter-ltrim'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.ltrim(a));

    return __jst;
};
jst._tmpl['filter-rtrim'] = function (a) {
    var __jst = '';
    __jst += filter.html(filter.rtrim(a));

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
jst._tmpl['filter-first'] = function (text) {
    var __jst = '';
    __jst += filter.html(filter.first(text));

    return __jst;
};
jst._tmpl['filter-last'] = function (text) {
    var __jst = '';
    __jst += filter.html(filter.last(text));

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
jst._tmpl['filter-className'] = function (cl) {
    var __jst = '';
    __jst += filter.html(filter.className(cl));

    return __jst;
};
jst._tmpl['filter-void'] = function (data) {
    var __jst = '';
    __jst += filter.html(filter.void(data));

    return __jst;
};
jst._tmpl['filter-append'] = function (data) {
    var __jst = '';
    __jst += filter.html(filter.append(data,'456'));

    return __jst;
};
jst._tmpl['filter-prepend'] = function (data) {
    var __jst = '';
    __jst += filter.html(filter.prepend(data,'123'));

    return __jst;
};

/* --- templates\jquery.jst --- */
jst._tmpl['jquery'] = function (content) {
    var __jst = '';
    __jst += filter.html(content);

    return __jst;
};
jst._tmpl['jst-bind'] = function (content) {
    var __jst = '';
    __jst += filter.html(content);

    return __jst;
};

/* --- templates\main.jst --- */
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
jst._tmpl['multiline-comment'] = function () {
    var __jst = '';
    __jst += 'Hello!';

    return __jst;
};
jst._tmpl['comment'] = function () {
    var __jst = '';
    __jst += 'Hello!';

    return __jst;
};

/* --- templates\method.jst --- */
jst._tmpl['attr'] = function () {
    var __jst = '';
    __jst += '<p' + filter._undef(attr('id', 'content')) + '></p>';

    return __jst;
};
jst._tmpl['each'] = function (element, index) {
    var __jst = '';
    __jst += filter.html(element) + ',' + filter.html(index) + ';';

    return __jst;
};
jst._tmpl['each-inside'] = function (data) {
    var __jst = '';
    __jst += filter.html(each('each', data));

    return __jst;
};
(function () {
    var f = function () {
        this['__jst_constructor'] = function (data) {
    var __jst = '';
var __jst_template = 'each-block';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(eachBlock('first', data));

    return __jst;
};

        this['first'] = function (element, index) {
    var __jst = '';
var __jst_template = 'each-block';
var __jst_this = this;
var block = function (name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function (blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(element) + ',' + filter.html(index) + ';';

    return __jst;
};
    };

    jst._tmplExtend['each-block'] = f;
    f.extend  = '';
})();

    jst._init('each-block');

/* --- templates\params.jst --- */
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
    y = typeof y === "undefined" ? 2 : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y + 2) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-array'] = function (x, y, z) {
    y = typeof y === "undefined" ? [1,3,4] : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y[1]) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-object'] = function (x, y, z) {
    y = typeof y === "undefined" ? {"x":1,"y":3,"z":4} : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-some-objects'] = function (x, y, z, w) {
    y = typeof y === "undefined" ? {"x":1,"y":3,"z":4} : y;
    w = typeof w === "undefined" ? {"x":"a","y":{"a":1}} : w;
    z = typeof z === "undefined" ? {"x":2,"y":4,"z":5} : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z.x) + '_' + filter.html(w.x);

    return __jst;
};

})();

/* The template automatically generated by jst, not edit it. */