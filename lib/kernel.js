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
 * Template call.
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
        throw new Error('Calling a non-existent jst-template "' + name + '".');
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
 * Block call.
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
            throw new Error('Calling a non-existent jst-block"' + blockName + '", template "' + templateName + '".');
        } else {
            return typeObj === 'string' ? obj : obj.apply(f, slice.call(arguments, 2));
        }
    } else {
        throw new Error('Calling a non-existent jst-template "' + templateName + '".');
    }

    return '';
};

/**
 * Cyclic call template.
 *
 * @param {string} templateName
 * @param {Array|Object} data
 * @param {*} params
 * @return {string}
*/
jst.each = function(templateName, data, params) {
    if(!data) {
        return '';
    }

    var text = [],
        len = data.length,
        i;

    if(isArray(data)) {
        for(i = 0; i < len; i++) {
            text.push(jst(templateName, data[i], i, data, params));
        }
    } else if(typeof data === 'object') {
        for(i in data) {
            if(data.hasOwnProperty(i)) {
                text.push(jst(templateName, data[i], i, data, params));
            }
        }
    }

    return text.join('');
};

/**
 * Cyclic block call from a template.
 *
 * @param {string} templateName
 * @param {string} blockName
 * @param {(Array|Object)} data 
 * @param {*} params
 * @return {string}
*/
jst.eachBlock = function(templateName, blockName, data, params) {
    if(!data) {
        return '';
    }

    var text = [],
        i,
        len = data.length;

    if(isArray(data)) {
        for(i = 0; i < len; i++) {
            text.push(jst.block(templateName, blockName, data[i], i, data, params));
        }
    } else {
        for(i in data) {
            if(data.hasOwnProperty(i)) {
                text.push(jst.block(templateName, blockName, data[i], i, data, params));
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
 * Generates HTML-code for the attribute or attributes.
 *
 * @param {string|Object} attrName - Attribute name or hash with attributes.
 * @param {string} attrValue
 * @return {string}
*/
jst.attr = function(attrName, attrValue) {
    var buf = [];
    if(isPlainObject(attrName)) {
        for(var i in attrName) {
            if(attrName.hasOwnProperty(i)) {
                buf.push(attr(i, attrName[i]));
            }
        }

        return buf.join('');
    } else {
        return attr(attrName, attrValue);
    }
};

/**
 * Initialization templates with blocks.
 *
 * @param {Array} templates
*/
jst._init = function(templates) {
    var tmpl = jst._tmpl;

    for(var i = 0; i < templates.length; i++) {
        var name = templates[i],
            Buf = jst._tmplExtend[name];

        if(!Buf.extended) {
            tmpl[name] = new Buf();
            Buf.extended = true;
        }
    }
};

/**
 * Inheritance template.
 *
 * @param {Array} data
*/
jst._extend = function(data) {
    var f = function(childName, parentName) {
        var tmpl = jst._tmpl,
            Child = jst._tmplExtend[childName],
            Parent = jst._tmplExtend[parentName],
            warning = function(template) {
                return 'Not found jst-pattern for inheritance "' + childName + '".';
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

    for(var i = 0; i < data.length; i++) {
        f(data[i][0], data[i][1]);
    }
};

/**
 * Binding template data to the DOM node.
 *
 * @param {string|DOMNode} container
 * @param {string} templateName
 * @return {Object}
*/
jst.bind = function(container, templateName) {
    var elem = typeof container === 'string' ? document.getElementById(container) : container,
        params = slice.call(arguments, 2);

    if(elem && templateName) {
        var jstParams = [templateName];
        if(params.length) {
            jstParams = jstParams.concat(params);
        }

        elem.innerHTML = jst.apply(this, jstParams);
    }

    return {
        update: function() {
            var bufJstParams = [templateName];
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
 * Filters
 * @namespace
*/
jst.filter = {
    /**
     * Remove HTML tags.
     *
     * @param {string} str
     * @return {string}
    */
    stripTags: function(str) {
        return  this._undef(str).replace(/<\/?[^>]+>/g, '');
    },
    
    /**
     * Escape url.
     *
     * @param {string} str
     * @return {string}
    */
    uri: function(str) {
        return glob.encodeURI(this._undef(str)).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },
    
    /**
     * Truncate text.
     *
     * @param {string} str
     * @param {number} len
     * @return {string}
    */
    truncate: function(str, len) {
        str = this._undef(str);
        if(!str || str.length <= len) {
            return str;
        }

       return str.substr(0, len);
    },
    
    /**
     * The first element of the array, the first character of a string.
     *
     * @param {Array|string} obj
     * @return {string}
    */
    first: function(obj) {
        if(isArray(obj) || typeof obj === 'string') {
            return this._undef(obj[0]);
        }

        return this._undef(obj);
    },
    
    /**
     * The last element of the array, the last character of a string.
     *
     * @param {Array|string} obj
     * @return {string}
    */
    last: function(obj) {
        if(isArray(obj) || typeof obj === 'string') {
            return obj[obj.length - 1];
        }

        return this._undef(obj);
    },

    /**
     * Convert characters to uppercase.
     *
     * @param {string} str
     * @return {string}
    */
    upper: function(str) {
        return this._undef(str).toUpperCase();
    },

    /**
     * Convert characters to lowercase.
     *
     * @param {string} str
     * @return {string}
    */
    lower: function(str) {
        return this._undef(str).toLowerCase();
    },

    /**
     * The first character to uppercase.
     *
     * @param {string} str
     * @return {string}
    */
    ucfirst: function(str) {
        str = this._undef(str);

        return str.substr(0, 1).toUpperCase() + str.substr(1);
    },

    /**
     * The first character to lowercase.
     *
     * @param {string} str
     * @return {string}
    */
    lcfirst: function(str) {
        str = this._undef(str);

        return str.substr(0, 1).toLowerCase() + str.substr(1);
    },

    /**
     * Remove duplicate spaces.
     *
     * @param {string} str
     * @return {string}
    */
    collapse: function(str) {
        return this._undef(str).replace(/\s{2,}/g, ' ').trim();
    },

    /**
     * Repeat text.
     *
     * @param {string} str
     * @param {number} num
     * @return {string}
    */
    repeat: function(str, num) {
        num = num || 1;
        num++;

        return new Array(num).join(this._undef(str));
    },

    /**
     * Delete text.
     *
     * @param {string} str
     * @param {string|RegExp} search
     * @return {string}
    */
    remove: function(str, search) {
        return this._undef(str).split(search).join('');
    },

    /**
     * Replace text.
     *
     * @param {string} str
     * @param {string|RegExp} search
     * @param {string} replace
     * @return {string}
    */
    replace: function(str, search, replace) {
        return this._undef(str).split(search).join(replace);
    },

    /**
     * Remove spaces from the beginning and end of the line.
     *
     * @param {string} str
     * @return {string}
    */
    trim: function(str) {
        return this._trim(this._undef(str));
    },

    /**
     * Remove spaces at the beginning of the text.
     *
     * @param {string} str
     * @return {string}
    */
    ltrim: function(str) {
        return this._undef(str).replace(/^\s+/g, '');
    },
    /**
     * Remove spaces at the end of the text.
     *
     * @param {string} str
     * @return {string}
    */
    rtrim: function(str) {
        return this._undef(str).replace(/\s+$/g, '');
    },

    /**
     * Add text before inserting text.
     *
     * @param {string} str
     * @param {string} text
     * @return {string}
    */
    prepend: function(str, text) {
        return this._undef(text) + this._undef(str);
    },

    /**
     * Add text after inserting text.
     *
     * @param {string} str
     * @param {string} text
     * @return {string}
    */
    append: function(str, text) {
        return this._undef(str) + this._undef(text);
    },

    /**
     * Join a array on separator.
     *
     * @param {Array} obj
     * @param {string} separator
     * @return {string}
    */
    join: function(obj, separator) {
        if(isArray(obj)) {
            return obj.join(separator);
        }

        return this._undef(obj);
    },

    /**
     * Print the void (for debugging)
    */
    'void': function() {},

    /**
     * Building a CSS-class for HTML.
     *
     * @param {Array|string} arr
     * @return {string}
    */
    className: function(arr) {
        return isArray(arr) ? arr.join(' ') : this._undef(arr);
    },

    /**
     * Replacing undefined or null to an empty string (for internal use).
     *
     * @param {*} str
     * @return {string}
    */
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
    },
    unEntityMap = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': '\'',
        '&#x2F;': '/'
    };

/**
 * Escape html.
 *
 * @param {string} str
 * @return {string}
*/
jst.filter.html = function(str) {
    return this._undef(str).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
};

/**
 * Unescape html.
 *
 * @param {string} str
 * @return {string}
*/
jst.filter.unhtml = function(str) {
    return this._undef(str).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;/g, function(s) {
        return unEntityMap[s];
    });
};

/**
 * Remove spaces from the beginning and end of the line.
 *
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
 * Place templates (function or string)
 * @namespace
*/
jst._tmpl = {};

/**
 * Place templates for inheritance
 * @namespace
*/
jst._tmplExtend = {};

glob.jst = jst;

if(!hasGlobal) {
    /**
     * jst-helpers for jQuery
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
