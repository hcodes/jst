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
 * @param {(Array|Object)} data - данные по которым происходит перебор
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

/* --- ./templates/filter.jst --- */
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

})();

/* The template automatically generated by jst, not edit it. */