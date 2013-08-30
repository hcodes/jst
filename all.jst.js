/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */
(function () {
    var forEach = jst.forEach;
    var filter = jst.filter;
    var block = jst.block;
    var template = jst;

/* --- tests\block.jst --- */
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

    jst._extend('block2x', 'block1x');
    jst._extend('block3x', 'block2x');

/* --- tests\filter.jst --- */
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

/* --- tests\main.jst --- */
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

/* --- tests\params.jst --- */
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
    w = typeof w == "undefined" ? {"x":"a","y":{"a":1}} : w;
    z = typeof z == "undefined" ? {"x":2,"y":4,"z":5} : z;
    y = typeof y == "undefined" ? {"x":1,"y":3,"z":4} : y;
    var __jst = '';
    __jst += filter.html(x) + '_' + filter.html(y.z) + '_' + filter.html(z.x) + '_' + filter.html(w.x);

    return __jst;
};

})();

/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */