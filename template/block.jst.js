
(function() {
    var attr = jst.attr,
        block = jst.block,
        each = jst.each,
        filter = jst.filter,
        template = jst;

/* --- ./template/block.jst.html --- */
(function() {
    var f = function() {
        this['__jstConstructor'] = function() {
    var __jst = '';
var __jstTemplate = 'block1x';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'block2x';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'block3x';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'foreach-block';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
    __jst += filter.html(forEachBlock('block1', [1,2,3])) + filter.html(forEachBlock('block2', [1,2,3]));

    return __jst;
};

        this['block1'] = '1';
        this['block2'] = function(name) {
    var __jst = '';
var __jstTemplate = 'foreach-block';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'page';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'block.page';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'page.constructor';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'withBlocks';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
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
var __jstTemplate = 'withoutBlocks';
var __jstThis = this;
var block = function(name) { return jst.block.apply(__jstThis, [__jstThis._name].concat(Array.prototype.slice.call(arguments)));}; 
var eachBlock = function(blockName, data, params) { return jst.eachBlock(__jstTemplate, blockName, data, params); }; 
    __jst += filter.html(block('block1'));

    return __jst;
};
    };

    jst._tmplExtend['withoutBlocks'] = f;
    f.extend  = 'withBlocks';
})();

    jst._init(['block1x', 'foreach-block', 'page', 'page.constructor', 'withBlocks']);
    jst._extend([['block2x', 'block1x'], ['block3x', 'block2x'], ['block.page', 'page'], ['block.page.empty.constructor', 'page.constructor'], ['withoutBlocks', 'withBlocks']]);

})();