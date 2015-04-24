jst.get = function(name) {
    return jst._tmpl[name];
};

jst.has = function(name) {
    return !!jst.get(name);
};
