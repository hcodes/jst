jst.add = function (name, template) {
    jst._tmpl[name] = template;
};

jst.remove = function (name) {
    delete jst._tmpl[name];
};

jst.get = function (name) {
    return jst._tmpl[name];
};

jst.has = function (name) {
    return !!jst.get(name);
};
