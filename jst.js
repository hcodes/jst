///////////////////////////////////////////////////////////////
//// jst - клиентский и серверный шаблонизатор на JavaScript 
//// Лицензия: MIT
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
            f._name = name;
            return f.apply(f, Array.prototype.slice.call(arguments, 1));
        break;
        case 'string':
            return f;
        break;
        case 'object':
            obj = f['__jst_constructor'];
            f._name = name;
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
        f._name = template;
        var obj = f[name];
        var typeObj = typeof obj;
        if (typeObj == 'undefined') {
            throw new Error('Вызов несуществующего jst-блока "' + name + '" у шаблона "' + template + '".');
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
jst.each = function (template, data, context) {
    if (!data) {
        return '';
    }
    
    var text = [],
        len = data.length,
        i;
        
    context = context || {};
    if (jst.isArray(data)) {
        for (i = 0; i < len; i++) {
            text.push(jst.call(context, template, data[i], i, data));
        }
    } else if (typeof data == 'object') {
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
jst.eachBlock = function (template, blockName, data, context) {
    var text = [];
    var i, len = data.length;
    context = context || {};
    if (jst.isArray(data)) {
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
 * Для удобной вставки атрибута в HTML
 *
 * @param {string} name - название атрибута
 * @param {string} name - значение атрибута
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

        if (!tmpl[childName]['__jst_constructor']  && tmpl[parentName]['__jst_constructor']) {
            tmpl[childName]['__jst_constructor'] = tmpl[parentName]['__jst_constructor'];
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
    var elem = typeof container == 'string' ? document.getElementById(container) : container;
    var params = Array.prototype.slice.call(arguments, 2);
    
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
                bufJstParams = bufJstParams.concat(Array.prototype.slice.call(arguments));
                jstParams = bufJstParams;
            } else {
                bufJstParams = jstParams;
            }
            
            elem.innerHTML = jst.apply(this, bufJstParams);
        }
    };
};

/**
 * Фильтры шаблонизатора (расширяемые)
 * @namespace 
*/
jst.filter = {
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
    // Первый элемент для массива, для строки первый символ
    first: function (obj) {
        if (jst.isArray(obj) || typeof obj == 'string') {
            return obj[0];
        }
        
        return this._undef(obj);
    },
    // Последний элемент для массива, для строки последний символ
    last: function (obj) {
        if (jst.isArray(obj) || typeof obj == 'string') {
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
    return Object.prototype.toString.call(obj) === "[object Array]";
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
 * jst-хелпер для jQuery
 * @param {string} template - название шаблона
 * @param {...*} var_args
*/
if (typeof jQuery != 'undefined') {
    jQuery.fn.jst = function () {
        this.html(jst.apply(this, arguments));
        return this;
    };
    
    jQuery.fn.jstEach = function () {
        this.html(jst.each.apply(this, arguments));
        
    };
    
    jQuery.fn.jstEachBlock = function () {
        this.html(jst.eachBlock.apply(this, arguments));
    };    
}

// Для работы в nodejs
if (typeof global != 'undefined') {
    global.jst = jst;
}