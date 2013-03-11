/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */

/* --- template.jst --- */
jst._tmpl['trim'] = '';
jst._tmpl['without-trim'] = ' 123 ';
jst._tmpl['without-trim-delete-spaces'] = '       123      ';
jst._tmpl['trim-with-number'] = function () {
    var filter = jst.filter;
    var __jst = '';
    __jst += '' + filter._undef(1) + '';

    return __jst;
};
jst._tmpl['new-line'] = '      ';
jst._tmpl['undef_null'] = function (param) {
    var filter = jst.filter;
    var __jst = '';
    __jst += '' + filter._undef(1) + '' + filter._undef(param) + '' + filter._undef(2) + '';

    return __jst;
};
jst._tmpl['without-inline-js'] = 'Hello world!';
jst._tmpl['with-inline-js'] = function (a, b, c) {
    var filter = jst.filter;
    var __jst = '';
    __jst += 'Hello' + filter._undef(a) + 'world!';

    return __jst;
};
jst._tmpl['with-4-params'] = function (a, b, c, d) {
    var filter = jst.filter;
    var __jst = '';
    __jst += '' + filter._undef(a) + '' + filter._undef(b) + '';

    return __jst;
};
jst._tmpl['same-template-name'] = function (a) {
    var filter = jst.filter;
    var __jst = '';
    __jst += '' + filter._undef(a) + '';

    return __jst;
};
jst._tmpl['same-template-name'] = function (a) {
    var filter = jst.filter;
    var __jst = '';
    __jst += '' + filter._undef(a + 10) + '';

    return __jst;
};
jst._tmpl['quotes'] = '\'\'\'';
jst._tmpl['quotes-with-slash'] = function (a) {
    var filter = jst.filter;
    var __jst = '';
    __jst += '\\\'\\\'\\\'' + filter._undef(a + '\'') + '\'\'\' \\\'\\\'\\\'';

    return __jst;
};
jst._tmpl['empty-string'] = function () {
    var filter = jst.filter;
    var __jst = '';
    __jst += '';

    return __jst;
};

/* Шаблон автоматически сгенерирован с помощью jst, не редактируйте его. */