
(function() {
    var attr = jst.attr;
    var block = jst.block;
    var each = jst.each;
    var filter = jst.filter;
    var template = jst;

/* --- ./template/block.jst --- */
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

})();