
(function() {
    var attr = jst.attr;
    var block = jst.block;
    var each = jst.each;
    var filter = jst.filter;
    var template = jst;

/* --- ./template/filter.jst.html --- */
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

})();