var fs = require('fs'),
    assert = require('chai').assert;

require('./templates/all.jst');

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

describe('main', function () {
    it('Base', function() {
        assert.equal(jst.get('trim'), '', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');
        assert.equal(jst.get('without-trim'), ' 123 ', 'trim="false".');
        assert.equal(jst.get('without-trim-delete-spaces'), '       123      ', 'trim="false" + delete-spaces="false".');
        assert.equal(jst('trim-with-number'), '1', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');
        
        assert.equal(jst('new-line'), '      ', 'Перенос строк заменяется на пробел.');
        
        assert.equal(jst('empty-string'), '', 'Вставка ничего даёт пустую строку.');
        
        assert.equal(jst('quotes'), '\'\'\'', 'Одинарные кавычки.');

        assert.equal(jst('quotes-with-slash', '123'), "\\\'\\\'\\\'123&#39;\'\'\' \\\'\\\'\\\'", 'Одинарные кавычки с обратным слешом.');
        
        assert.equal(typeof jst.get('without-inline-js'), 'string', 'Шаблон без вставки значение и инлайн-js компилируется в строку.');
        assert.equal(typeof jst.get('with-inline-js'), 'function', 'Шаблон со вставкой значений или инлайн-js компилируется в функцию.');
        
        assert.equal(jst('same-template-name', 1), '11', 'Два шаблона с одним и тем же названием, срабатывать должен последний объявленный шаблон.');
        
        assert.equal(jst('call-template', 1), '1__11__1', 'Вызов другого шаблона из шаблона.');
        
        assert.equal(jst('comment'), 'Hello!', 'Однострочный комментарий');
        assert.equal(jst('multiline-comment'), 'Hello!', 'Многострочный комментарий');
    });
    
    it('Params', function () {
        assert.equal(jst.get('without-params').length, 0, 'Без параметров, 0 параметров');
        assert.equal(jst('without-params'), '4', 'Без параметров');
        assert.equal(jst.get('with-4-params').length, 4, 'Проверка на количество параметров, 4 параметра.');
        assert.equal(jst('with-4-params', 1, 2, 3, 4), '1234', 'Проверка на количество параметров.');
        assert.equal(jst.get('default-params').length, 3, 'Параметры по умолчанию, строка и число, проверка количества параметров');
        assert.equal(jst('default-params', 1), '1_4_world', 'Параметры по умолчанию, строка и число');
        assert.equal(jst('default-params', 0, 10, 'hey'), '0_12_hey', 'Параметры по умолчанию, строка и число, другие параметры');
        assert.equal(jst('params-x-xx-xxx', 1, 2, 3), '1_2_3', 'Параметры, одинаковые названия');
        assert.equal(jst('default-params-array', 0), '0_3_world', 'Параметры по умолчанию, массив');
        assert.equal(jst('default-params-object', 0), '0_4_world', 'Параметры по умолчанию, объект');
        assert.equal(jst('default-params-some-objects', 0), '0_4_2_a', 'Параметры по умолчанию, массив');
        //equal(jst.has('invalid_params'), false, 'Шаблон с некорректным названием переменных не должен компилироваться');
    });

    it('Filters', function () {
        assert.equal(jst('filter-html', '<div class="test">&&&</div>'), '&lt;div class=&quot;test&quot;&gt;&amp;&amp;&amp;&lt;&#x2F;div&gt;', 'html, string');
        assert.equal(jst('filter-html', 123), '123', 'html, number');
        assert.equal(jst('filter-html', {}), '[object Object]', 'html, object');
        assert.equal(jst('filter-html', ''), '', 'html, ""');
        assert.equal(jst('filter-html', null), '', 'html, null');
        assert.equal(jst('filter-html', undefined), '', 'html, undefined');
        
        assert.equal(jst('filter-unhtml', '&lt;div class=&quot;test&quot;&gt;&amp;&amp;&amp;&lt;/div&gt;'), '<div class="test">&&&</div>', 'unhtml, string');
        assert.equal(jst('filter-unhtml', 123), '123', 'unhtml, number');
        assert.equal(jst('filter-unhtml', {}), '[object Object]', 'unhtml, object');
        assert.equal(jst('filter-unhtml', ''), '', 'unhtml, ""');
        assert.equal(jst('filter-unhtml', null), '', 'unhtml, null');
        assert.equal(jst('filter-unhtml', undefined), '', 'unhtml, undefined');
        assert.equal(jst('filter-stripTags', '<div class="test">&&&</div>'), '&&&', 'stripTags, string');
        assert.equal(jst('filter-stripTags', 123), '123', 'stripTags, number');
        assert.equal(jst('filter-stripTags', {}), '[object Object]', 'stripTags, object');
        assert.equal(jst('filter-stripTags', ''), '', 'stripTags, ""');
        assert.equal(jst('filter-stripTags', null), '', 'stripTags, null');
        assert.equal(jst('filter-stripTags', undefined), '', 'stripTags, undefined');
        assert.equal(jst('filter-uri', 'http://example.ru/?a=1&b=dkoskods&c=1 2&d=тест'), 'http://example.ru/?a=1&b=dkoskods&c=1%202&d=%D1%82%D0%B5%D1%81%D1%82', 'uri, string');
        assert.equal(jst('filter-uri', 123), '123', 'uri, number');
        assert.equal(jst('filter-uri', {}), '[object%20Object]', 'uri, object');
        assert.equal(jst('filter-uri', ''), '', 'uri, ""');
        assert.equal(jst('filter-uri', null), '', 'uri, null');
        assert.equal(jst('filter-uri', undefined), '', 'uri, undefined');
        
        assert.equal(jst('filter-truncate', 'Hello world!', 3), 'Hel', 'truncate, string');
        assert.equal(jst('filter-truncate', 123456, 3), '123', 'truncate, number');
        assert.equal(jst('filter-truncate', {}, 3), '[ob', 'truncate, object');
        assert.equal(jst('filter-truncate', '', 3), '', 'truncate, ""');
        assert.equal(jst('filter-truncate', null, 3), '', 'truncate, null');
        assert.equal(jst('filter-truncate', undefined, 3), '', 'truncate, undefined');
        
        assert.equal(jst('filter-trim', '      Hello world!             '), 'Hello world!', 'trim, string');
        assert.equal(jst('filter-trim', 123456), '123456', 'trim, number');
        assert.equal(jst('filter-trim', {}), '[object Object]', 'trim, object');
        assert.equal(jst('filter-trim', ''), '', 'trim, ""');
        assert.equal(jst('filter-trim', null), '', 'trim, null');
        assert.equal(jst('filter-trim', undefined), '', 'trim, undefined');
        
        assert.equal(jst('filter-first', 'Hello world!'), 'H', 'first, string');
        assert.equal(jst('filter-first', ['first', 'second']), 'first', 'first, array');
        assert.equal(jst('filter-first', true), 'true', 'first, boolean');
        assert.equal(jst('filter-first', 123), '123', 'first, number');
        assert.equal(jst('filter-first', null), '', 'first, null');
        assert.equal(jst('filter-first', undefined), '', 'first, undefined');
        
        assert.equal(jst('filter-last', 'Hello world!'), '!', 'last, string');
        assert.equal(jst('filter-last', ['first', 'second']), 'second', 'last, array');
        assert.equal(jst('filter-last', true), 'true', 'last, boolean');
        assert.equal(jst('filter-last', 123), '123', 'last, number');
        assert.equal(jst('filter-last', null), '', 'last, null');
        assert.equal(jst('filter-last', undefined), '', 'last, undefined');

        assert.equal(jst('filter-ltrim', '      Hello world!'), 'Hello world!', 'ltrim, string');
        assert.equal(jst('filter-ltrim', 123456), '123456', 'ltrim, number');
        assert.equal(jst('filter-ltrim', {}), '[object Object]', 'ltrim, object');
        assert.equal(jst('filter-ltrim', ''), '', 'ltrim, ""');
        assert.equal(jst('filter-ltrim', null), '', 'ltrim, null');
        assert.equal(jst('filter-ltrim', undefined), '', 'ltrim, undefined');

        assert.equal(jst('filter-rtrim', 'Hello world!             '), 'Hello world!', 'rtrim, string');
        assert.equal(jst('filter-rtrim', 123456), '123456', 'rtrim, number');
        assert.equal(jst('filter-rtrim', {}), '[object Object]', 'rtrim, object');
        assert.equal(jst('filter-rtrim', ''), '', 'rtrim, ""');
        assert.equal(jst('filter-rtrim', null), '', 'rtrim, null');
        assert.equal(jst('filter-rtrim', undefined), '', 'rtrim, undefined');
        
        assert.equal(jst('filter-upper', 'hello world!'), 'HELLO WORLD!', 'upper, string');
        assert.equal(jst('filter-upper', 123456), '123456', 'upper, number');
        assert.equal(jst('filter-upper', {}), '[OBJECT OBJECT]', 'upper, object');
        assert.equal(jst('filter-upper', ''), '', 'upper, ""');
        assert.equal(jst('filter-upper', null), '', 'upper, undefined');

        assert.equal(jst('filter-lower', 'HELLO WORLD!'), 'hello world!', 'lower, string');
        assert.equal(jst('filter-lower', 123456), '123456', 'lower, number');
        assert.equal(jst('filter-lower', {}), '[object object]', 'lower, object');
        assert.equal(jst('filter-lower', ''), '', 'lower, ""');
        assert.equal(jst('filter-lower', null), '', 'lower, null');
        assert.equal(jst('filter-lower', undefined), '', 'lower, undefined');

        assert.equal(jst('filter-ucfirst', 'hello world!'), 'Hello world!', 'ucfirst, string');
        assert.equal(jst('filter-ucfirst', 123456), '123456', 'ucfirst, number');
        assert.equal(jst('filter-ucfirst', {}), '[object Object]', 'ucfirst, object');
        assert.equal(jst('filter-ucfirst', ''), '', 'ucfirst, ""');
        assert.equal(jst('filter-ucfirst', null), '', 'ucfirst, null');
        assert.equal(jst('filter-ucfirst', undefined), '', 'ucfirst, undefined');

        assert.equal(jst('filter-lcfirst', 'HELLO WORLD!'), 'hELLO WORLD!', 'lcfirst, string');
        assert.equal(jst('filter-lcfirst', 123456), '123456', 'lcfirst, number');
        assert.equal(jst('filter-lcfirst', {}), '[object Object]', 'lcfirst, object');
        assert.equal(jst('filter-lcfirst', ''), '', 'lcfirst, ""');
        assert.equal(jst('filter-lcfirst', null), '', 'lcfirst, null');
        assert.equal(jst('filter-lcfirst', undefined), '', 'lcfirst, undefined');

        assert.equal(jst('filter-collapse', 'Hello              world!', 3), 'Hello world!', 'collapse, string');
        assert.equal(jst('filter-collapse', 123456), '123456', 'collapse, number');
        assert.equal(jst('filter-collapse', {}), '[object Object]', 'collapse, object');
        assert.equal(jst('filter-collapse', ''), '', 'collapse, ""');
        assert.equal(jst('filter-collapse', null), '', 'collapse, null');
        assert.equal(jst('filter-collapse', undefined), '', 'collapse, undefined');

        assert.equal(jst('filter-repeat', 'Hello world!', 3), 'Hello world!Hello world!Hello world!', 'repeat, string');
        assert.equal(jst('filter-repeat', 123456, 3), '123456123456123456', 'repeat, number');
        assert.equal(jst('filter-repeat', {}, 3), '[object Object][object Object][object Object]', 'repeat, object');
        assert.equal(jst('filter-repeat', '', 3), '', 'repeat, ""');
        assert.equal(jst('filter-repeat', null, 3), '', 'repeat, null');
        assert.equal(jst('filter-repeat', undefined, 3), '', 'repeat, undefined');
            
        assert.equal(jst('filter-remove', 'Hello world!', 'Hello'), ' world!', 'remove, string');
        assert.equal(jst('filter-remove', 123456, '123'), '456', 'remove, number');
        assert.equal(jst('filter-remove', {}, /\[object/), ' Object]', 'remove, object');
        assert.equal(jst('filter-remove', '', ''), '', 'remove, ""');
        assert.equal(jst('filter-remove', null, ''), '', 'remove, null');
        assert.equal(jst('filter-remove', undefined, ''), '', 'remove, undefined');
        
        assert.equal(jst('filter-replace', 'Hello world!', 'world', 'friend'), 'Hello friend!', 'replace, string');
        assert.equal(jst('filter-replace', 123456, '123', '098'), '098456', 'replace, number');
        assert.equal(jst('filter-replace', {}, /\[object/, 'type'), 'type Object]', 'replace, object');
        assert.equal(jst('filter-replace', '', null), '', 'replace, ""');
        assert.equal(jst('filter-replace', null, '123'), '', 'replace, null');
        assert.equal(jst('filter-replace', undefined, 123), '', 'replace, undefined');
        
        assert.equal(jst('filter-_undef', 'Hello world!'), 'Hello world!', '_undef, string');
        assert.equal(jst('filter-_undef', 123456), '123456', '_undef, number');
        assert.equal(jst('filter-_undef', undefined), '', '_undef, undefined');
        assert.equal(jst('filter-_undef', null), '', '_undef, null');

        assert.equal(jst('short-filter-trim', '   <p>123</p>   '), '<p>123</p>', 'Краткая запись фильтра trim');
        assert.equal(jst('short-filter-replace', '  <p>123</p>  '), '  <p>023</p>  ', 'Краткая запись фильтра replace');
        assert.equal(jst('short-filter-trim-replace', '  <p>123</p>  '), '<p>023</p>', 'Краткая запись вложенных фильтров: trim | replace(..., ...)');
        assert.equal(jst('short-filter-trim-replace-trim', '  <p>123</p>  '), '<p> 23</p>', 'Краткая запись вложенных фильтров: trim | replace(..., ...) | trim');

        assert.equal(jst('escape-html-short-filter-trim', '   <p>123</p>   '), '&lt;p&gt;123&lt;&#x2F;p&gt;', 'Экранирование html, краткая запись фильтра trim');
        assert.equal(jst('escape-html-short-filter-replace', '  <p>123</p>  '), '  &lt;p&gt;023&lt;&#x2F;p&gt;  ', 'Экранирование html, краткая запись фильтра replace');
        assert.equal(jst('escape-html-short-filter-trim-replace', '  <p>123</p>  '), '&lt;p&gt;023&lt;&#x2F;p&gt;', 'Экранирование html, краткая запись вложенных фильтров: trim | replace(..., ...)');
        assert.equal(jst('escape-html-short-filter-trim-replace-trim', '  <p>123</p>  '), '&lt;p&gt; 23&lt;&#x2F;p&gt;', 'Экранирование html, краткая запись вложенных фильтров: trim | replace(..., ...) | trim');
        
        assert.equal(jst('filter-className', ['one', 'two', 'three']), 'one two three', 'className, cборка CSS-класса');
        
        assert.equal(jst('filter-void', [1, 2, 3]), '', 'void');
        
        assert.equal(jst('filter-append', '123'), '123456', 'append');
        assert.equal(jst('filter-prepend', '456'), '123456', 'prepend');
    });

    it('Blocks', function () {
        assert.equal(jst('block1x'), 'Blocks:block1x block1<br />block1x block2<br />block1x block3', 'Блоки');
        assert.equal(jst('block2x'), 'Blocks:block1x block1<br />block2x block2<br />block2x block3', 'Наследование 1 уровень вложенности');
        assert.equal(jst('block3x'), 'Blocks:block1x block1<br />block2x block2<br />block3x block3', 'Наследование 2 уровня вложенности');
        assert.equal(jst('block.page'), '123abc101112', 'Наследование 2 уровня вложенности');
        assert.equal(jst('block.page.empty.constructor'), '123abc101112', 'Наследование 2 уровня вложенности, пустой конструктор');
        
        assert.equal(jst('withBlocks'), '123456', 'Шаблон с блоками');
        assert.equal(jst('withoutBlocks'), '123', 'Шаблон без блоков, но с наследованием');
    });

    /*test('jQuery', function () {
        $('body').append('<div id="test-jst"></div>');
        var el = $('#test-jst');
        el.jst('jquery', 123);
        equal(jst('jquery', '123'), el.html(), '$(\'...\').jst()');
        el.jstEach('each', [1, 2, 3]);
        equal(jst.each('each', [1, 2, 3]), el.html(), '$(\'...\').jstEach()');
        $('#test-jst').remove();

        $('body').append('<div id="test-bind"></div>');
        var temp = jst.bind('test-bind', 'jst-bind', 'Hello world!');
        equal($('#test-bind').html(), 'Hello world!', 'jst.bind');
        temp.update('Hello');
        equal($('#test-bind').html(), 'Hello', '.update()');
        $('#test-bind').remove();
    });*/

    it('Methods', function () {
        assert.equal(jst.each('each', [1, 2, 3]), '1,0;2,1;3,2;', 'jst.each');
        assert.equal(jst('each-inside', [1, 2, 3]), '1,0;2,1;3,2;', '<%= each() %>');

        assert.equal(jst.eachBlock('each-block', 'first', [1, 2, 3]), '1,0;2,1;3,2;', 'jst.block()');
        assert.equal(jst('each-block', [1, 2, 3]), '1,0;2,1;3,2;', '<%= eachBlock() %>');
    });

    it('Attrs', function () {
        assert.equal(jst.attr(), '', 'attr()');
        assert.equal(jst.attr(''), '', "attr('')");
        assert.equal(jst.attr(null), '', "attr(null)");
        assert.equal(jst.attr('abc'), '', "attr('abc')");
        assert.equal(jst.attr('abc', 10), ' abc="10"', "attr('abc', 10)");
        assert.equal(jst.attr('abc', {}), ' abc="[object Object]"', "attr('abc', {})");
        assert.equal(jst.attr('abc', 'abc'), ' abc="abc"', "attr('abc', 'abc')");
        assert.equal(jst.attr({a: 1, b: 2}), ' a="1" b="2"', 'attr({a:1, b:2}');
    });
    
});
