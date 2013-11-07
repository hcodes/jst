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
    if (jst.isArray(data)) {
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
    // Вывод JSON
    json: function (obj) {
        if (typeof JSON !== 'undefined') {
            return JSON.stringify(obj);
        }
        
        return obj;
    },
    // Логирование
    log: function (obj) {
        if (typeof console !== 'undefined') {
            console.log(arguments);
        }
        
        return obj;
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

// Хелпер для BEMHTML
jst.bem = function (bemjson) {
    return BEMHTML.apply(BEM.JSON.build(bemjson));
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
    
    jQuery.fn.jstForEach = jst.forEach;
}

// Для работы в nodejs
if (typeof global != 'undefined') {
    global.jst = jst;
}