////////////////////////////////////////////////
//// Простой клиентский js-шаблонизатор
///////////////////////////////////////////////

/**
 * Вызов шаблонизатора
 *
 * @param {string} name - название шаблона
 * @param {...*} var_args
 * @return {string}
*/
var jst = function (name) {
    var f = jst._tmpl[name];
    var cnt = jst._cnt;
    if (typeof f == 'function') {
        cnt[name] = (cnt[name] || 0) + 1;
        return f.apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof f == 'string') {
        cnt[name] = (cnt[name] || 0) + 1;
        return f;
    } else if (typeof f == 'undefined') {
        throw new Error('Вызов несуществующего шаблона "' + name + '"');
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
    var i;
    context = context || {};
    if (Object.prototype.toString.call(data) === "[object Array]") { // Array.isArray
        for (i = 0, len = data.length; i < len; i++) {
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
        return ('' + str).replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');    
    },    
    // Разэкранирование HTML
    unhtml: function (str) {
        return ('' + str).replace(/\&quot;/g, '"')
            .replace(/\&gt;/g, '>')
            .replace(/\&lt;/g, '<')
            .replace(/\&amp;/g, '&');
    },
    // Удаление HTML-тегов
    stripTags: function (str) {
        return  ('' + str).replace(/<\/?[^>]+>/g, '');
    },
    // Экранирование урла
    uri: function (str) {
        return encodeURI('' + str).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },
    // Обрезание строки нужной длины
    truncate: function (str, length) {
        str = '' + str;
        if (!str || str.length <= length) { return str; }
        
       return str.substr(0, length - 1);    
    },
    // Удаление пробелов с начала и конца строки
    trim: function (str) {
        return ('' + str).trim();
    },
    // Перевод символов в верхний регистр
    upper: function (str) {
        return ('' + str).toUpperCase();
    },
    // Перевод символов в нижний регистр
    lower: function (str) {
        return ('' + str).toLowerCase();
    },
    // Первый символ в верхний регистр
    ucfirst: function (str) {
        str = '' + str;
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    // Первый символ в нижний регистр
    lcfirst: function (str) {
        str = '' + str;
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    },
    // Удаление повторяющихся пробелов 
    collapse: function (str) {
        return ('' + str).replace(/\s{2,}/g, ' ').trim();
    },
    // Повторить строку нужное количество раз
    repeat: function (str, num) {
        return new Array(num || 1).join('' + str);
    },
    // К переносам строки добавляем нужный отступ
    indent: function (str) {
        str = ('' + str).replace(/\r/g, '');
        return str.split('\n').join('\n' + str);
    },
    // Удаление текста по рег. выражению 
    remove: function (str) {
        str = '' + str;
        return str.split(str).join('');
    },
    // Замена текста по рег. выражению 
    replace: function (str, search, replace) {
        return ('' + str).split(search).join(replace);
    },
    // Замена undefined или null на пустую строку (для служебного использования)
    _undef: function (str) {
        return typeof str == 'undefined' || str === null ? '' : '' + str;
    },
    // Замена undefined или null на пустую строку + экранирование HTML (для служебного использования)
    _undefHtml: function (str) {
        if (typeof str == 'undefined' || str === null) {
            return '';
        }
        
        return ('' + str).replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');    
    }    
};

/**
 * Место хранения шаблонов (функций или строк)
 * @namespace 
*/
jst._tmpl = {};

/**
 * Место хранения счётчиков вызова шаблонов
 * @namespace 
*/
jst._cnt = {};

/**
 * Сколько раз выполнялся шаблон
 * @param {string} name - имя шаблона
 * @return {number} - число раз
*/
jst.count = function (name) {
    return jst._cnt[name];
};

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
    delete jst._cnt[name];
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