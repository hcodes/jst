
(function() {
    var attr = jst.attr;
    var block = jst.block;
    var each = jst.each;
    var filter = jst.filter;
    var template = jst;

/* --- template\block.jst.html --- */
(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'block1x';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
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

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'block2x';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += 'Blocks:' + filter.html(block('block1')) + '<br />' + filter.html(block('block2')) + '<br />' + filter.html(block('block3'));

    return __jst;
};

        this['block2'] = 'block2x block2';
        this['block3'] = 'block2x block3';
    };

    jst._tmplExtend['block2x'] = f;
    f.extend  = 'block1x';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'block3x';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += 'Blocks:' + filter.html(block('block1')) + '<br />' + filter.html(block('block2')) + '<br />' + filter.html(block('block3'));

    return __jst;
};

        this['block3'] = 'block3x block3';
    };

    jst._tmplExtend['block3x'] = f;
    f.extend  = 'block2x';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'foreach-block';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(forEachBlock('block1', [1,2,3])) + filter.html(forEachBlock('block2', [1,2,3]));

    return __jst;
};

        this['block1'] = '1';
        this['block2'] = function(name) {
    var __jst = '';
var __jst_template = 'foreach-block';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(name);

    return __jst;
};
    };

    jst._tmplExtend['foreach-block'] = f;
    f.extend  = '';
})();

jst._tmpl['nnn'] = '1 2 3 4 999';
(function() {
    var f = function() {
        this['__jstConstructor'] = '';

        this['head'] = '123';
        this['footer'] = '101112';
        this['main'] = function() {
    var __jst = '';
var __jst_template = 'page';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('head')) + filter.html(block('content')) + filter.html(block('footer'));

    return __jst;
};
    };

    jst._tmplExtend['page'] = f;
    f.extend  = '';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'block.page';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('main'));

    return __jst;
};

        this['content'] = 'abc';
    };

    jst._tmplExtend['block.page'] = f;
    f.extend  = 'page';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'page.constructor';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('head')) + filter.html(block('content')) + filter.html(block('footer'));

    return __jst;
};

        this['head'] = '123';
        this['footer'] = '101112';
    };

    jst._tmplExtend['page.constructor'] = f;
    f.extend  = '';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = '';

        this['content'] = 'abc';
    };

    jst._tmplExtend['block.page.empty.constructor'] = f;
    f.extend  = 'page.constructor';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'withBlocks';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(block('block1')) + filter.html(block('block2'));

    return __jst;
};

        this['block1'] = '123';
        this['block2'] = '456';
    };

    jst._tmplExtend['withBlocks'] = f;
    f.extend  = '';
})();

(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jst_template = 'withoutBlocks';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
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

/* --- template\filter.jst.html --- */
jst._tmpl['filter-html'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.html(a));

    return __jst;
};
jst._tmpl['filter-unhtml'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.unhtml(a));

    return __jst;
};
jst._tmpl['filter-stripTags'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.stripTags(a));

    return __jst;
};
jst._tmpl['filter-uri'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.uri(a));

    return __jst;
};
jst._tmpl['filter-truncate'] = function(text, length) {
    var __jst = '';
    __jst += filter.html(filter.truncate(text, length));

    return __jst;
};
jst._tmpl['filter-trim'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.trim(a));

    return __jst;
};
jst._tmpl['filter-ltrim'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.ltrim(a));

    return __jst;
};
jst._tmpl['filter-rtrim'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.rtrim(a));

    return __jst;
};
jst._tmpl['filter-upper'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.upper(a));

    return __jst;
};
jst._tmpl['filter-lower'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.lower(a));

    return __jst;
};
jst._tmpl['filter-ucfirst'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.ucfirst(a));

    return __jst;
};
jst._tmpl['filter-lcfirst'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.lcfirst(a));

    return __jst;
};
jst._tmpl['filter-collapse'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.collapse(a));

    return __jst;
};
jst._tmpl['filter-repeat'] = function(text, length) {
    var __jst = '';
    __jst += filter.html(filter.repeat(text, length));

    return __jst;
};
jst._tmpl['filter-remove'] = function(text, search) {
    var __jst = '';
    __jst += filter.html(filter.remove(text, search));

    return __jst;
};
jst._tmpl['filter-replace'] = function(text, search, replace) {
    var __jst = '';
    __jst += filter.html(filter.replace(text, search, replace));

    return __jst;
};
jst._tmpl['filter-first'] = function(text) {
    var __jst = '';
    __jst += filter.html(filter.first(text));

    return __jst;
};
jst._tmpl['filter-last'] = function(text) {
    var __jst = '';
    __jst += filter.html(filter.last(text));

    return __jst;
};
jst._tmpl['filter-_undef'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter._undef(a));

    return __jst;
};
jst._tmpl['short-filter-trim'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.trim(a));

    return __jst;
};
jst._tmpl['short-filter-replace'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.replace(a,'1', '0'));

    return __jst;
};
jst._tmpl['short-filter-trim-replace'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.replace(filter.trim(a),'1', '0'));

    return __jst;
};
jst._tmpl['short-filter-trim-replace-trim'] = function(a) {
    var __jst = '';
    __jst += filter._undef(filter.trim(filter.replace(filter.trim(a),'1', ' ')));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.trim(a));

    return __jst;
};
jst._tmpl['escape-html-short-filter-replace'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.replace(a,'1', '0'));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim-replace'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.replace(filter.trim(a),'1', '0'));

    return __jst;
};
jst._tmpl['escape-html-short-filter-trim-replace-trim'] = function(a) {
    var __jst = '';
    __jst += filter.html(filter.trim(filter.replace(filter.trim(a),'1', ' ')));

    return __jst;
};
jst._tmpl['filter-className'] = function(cl) {
    var __jst = '';
    __jst += filter.html(filter.className(cl));

    return __jst;
};
jst._tmpl['filter-void'] = function(data) {
    var __jst = '';
    __jst += filter.html(filter.void(data));

    return __jst;
};
jst._tmpl['filter-append'] = function(data) {
    var __jst = '';
    __jst += filter.html(filter.append(data,'456'));

    return __jst;
};
jst._tmpl['filter-prepend'] = function(data) {
    var __jst = '';
    __jst += filter.html(filter.prepend(data,'123'));

    return __jst;
};

/* --- template\jquery.jst.html --- */
jst._tmpl['jquery'] = function(content) {
    var __jst = '';
    __jst += filter.html(content);

    return __jst;
};
jst._tmpl['jst-bind'] = function(content) {
    var __jst = '';
    __jst += filter.html(content);

    return __jst;
};

/* --- template\main.jst.html --- */
jst._tmpl['trim'] = '';
jst._tmpl['without-trim'] = ' 123 ';
jst._tmpl['without-trim-delete-spaces'] = '       123      ';
jst._tmpl['trim-with-number'] = function() {
    var __jst = '';
    __jst += filter.html(1);

    return __jst;
};
jst._tmpl['qqq'] = function() {
    var __jst = '';

 q


    return __jst;
};
jst._tmpl['new-line'] = '      ';
jst._tmpl['without-inline-js'] = 'Hello world!';
jst._tmpl['with-inline-js'] = function(a, b, c) {
    var __jst = '';
    __jst += 'Hello';
 if (a) {
    __jst += filter.html(a) + '';
 }
    __jst += 'world!';

    return __jst;
};
jst._tmpl['same-template-name'] = function(a) {
    var __jst = '';
    __jst += filter.html(a);

    return __jst;
};
jst._tmpl['same-template-name'] = function(a) {
    var __jst = '';
    __jst += filter.html(a + 10);

    return __jst;
};
jst._tmpl['quotes'] = '\'\'\'';
jst._tmpl['quotes-with-slash'] = function(a) {
    var __jst = '';
    __jst += '\\\'\\\'\\\'' + filter.html(a + '\'') + '\'\'\' \\\'\\\'\\\'';

    return __jst;
};
jst._tmpl['empty-string'] = function() {
    var __jst = '';


    return __jst;
};
jst._tmpl['call-template'] = function(a) {
    var __jst = '';
    __jst += filter.html(a) + '__' + filter.html(template('call-template2', 1)) + '__' + filter.html(a);

    return __jst;
};
jst._tmpl['call-template2'] = function(a) {
    var __jst = '';
    __jst += filter.html(a + 10);

    return __jst;
};
jst._tmpl['multiline-comment'] = function() {
    var __jst = '';
    __jst += 'Hello!';

    return __jst;
};
jst._tmpl['comment'] = function() {
    var __jst = '';
    __jst += 'Hello!';

    return __jst;
};

/* --- template\method.jst.html --- */
jst._tmpl['attr'] = function() {
    var __jst = '';
    __jst += '<p' + filter._undef(attr('id', 'content')) + '></p>';

    return __jst;
};
jst._tmpl['each'] = function(element, index) {
    var __jst = '';
    __jst += filter.html(element) + ',' + filter.html(index) + ';';

    return __jst;
};
jst._tmpl['each-inside'] = function(data) {
    var __jst = '';
    __jst += filter.html(each('each', data));

    return __jst;
};
(function() {
    var f = function() {
        this['__jstConstructor'] = function(data) {
    var __jst = '';
var __jst_template = 'each-block';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(eachBlock('first', data));

    return __jst;
};

        this['first'] = function(element, index) {
    var __jst = '';
var __jst_template = 'each-block';
var __jst_this = this;
var block = function(name) { return jst.block.apply(__jst_this, [__jst_this._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jst_template, blockName, data, params); }; 
    __jst += filter.html(element) + ',' + filter.html(index) + ';';

    return __jst;
};
    };

    jst._tmplExtend['each-block'] = f;
    f.extend  = '';
})();

    jst._init('each-block');

/* --- template\params.jst.html --- */
jst._tmpl['without-params'] = function() {
    var __jst = '';
    __jst += filter.html(2 + 2);

    return __jst;
};
jst._tmpl['params-x-xx-xxx'] = function(x, xx, xxx) {
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(xx) + '_' + filter.html(xxx);

    return __jst;
};
jst._tmpl['with-4-params'] = function(a, b, c, d) {
    var __jst = '';
    __jst += filter.html(a) + filter.html(b) + filter.html(c) + filter.html(d);

    return __jst;
};
jst._tmpl['default-params'] = function(x, y, z) {
    y = typeof y === "undefined" ? 2 : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y + 2) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-array'] = function(x, y, z) {
    y = typeof y === "undefined" ? [1,3,4] : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y[1]) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-object'] = function(x, y, z) {
    y = typeof y === "undefined" ? {"x":1,"y":3,"z":4} : y;
    z = typeof z === "undefined" ? "world" : z;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z);

    return __jst;
};
jst._tmpl['default-params-some-objects'] = function(x, y, z, w) {
    y = typeof y === "undefined" ? {"x":1,"y":3,"z":4} : y;
    z = typeof z === "undefined" ? {"x":2,"y":4,"z":5} : z;
    w = typeof w === "undefined" ? {"x":"a","y":{"a":1}} : w;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z.x) + '_' + filter.html(w.x);

    return __jst;
};

})();