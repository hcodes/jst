test('Основное', function () {
    equal(jst.has('invalid_params'), false, 'Шаблон с некорректным названием переменных не должен компилироваться');
    
    equal(jst.get('trim'), '', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');    
    equal(jst.get('without-trim'), ' 123 ', 'trim="false".');    
    equal(jst.get('without-trim-delete-spaces'), '       123      ', 'trim="false" + delete-spaces="false".');
    equal(jst('trim-with-number'), '1', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');    
    
    equal(jst('new-line'), '      ', 'Перенос строк заменяется на пробел.');
    
    equal(jst('empty-string'), '', 'Вставка ничего даёт пустую строку.');
    
    equal(jst('quotes'), '\'\'\'', 'Одинарные кавычки.');
    equal(jst('quotes-with-slash', '123'), '\\\'\\\'\\\'123\'\'\'\' \\\'\\\'\\\'', 'Одинарные кавычки с обратным слешом.');
    
    equal(typeof jst.get('without-inline-js'), 'string', 'Шаблон без вставки значение и инлайн-js компилируется в строку.');
    equal(typeof jst.get('with-inline-js'), 'function', 'Шаблон со вставкой значений или инлайн-js компилируется в функцию.');
    
    equal(jst.get('with-4-params').length, 4, 'Проверка на количество параметров.');
    
    equal(jst('same-template-name', 1), '11', 'Два шаблона с одним и тем же названием, срабатывать должен последний объявленный шаблон.');    
    
    equal(jst('call-template', 1), '1__11__1', 'Вызов другого шаблона из шаблона.');
});

test('Фильтры', function () {
    equal(jst('filter-html', '<div class="test">&&&</div>'), '&lt;div class=&quot;test&quot;&gt;&amp;&amp;&amp;&lt;/div&gt;', 'html, string');    
    equal(jst('filter-html', 123), '123', 'html, number');    
    equal(jst('filter-html', {}), '[object Object]', 'html, object');    
    equal(jst('filter-html', ''), '', 'html, ""');    
    
    equal(jst('filter-unhtml', '&lt;div class=&quot;test&quot;&gt;&amp;&amp;&amp;&lt;/div&gt;'), '<div class="test">&&&</div>', 'unhtml, string');    
    equal(jst('filter-unhtml', 123), '123', 'unhtml, number');    
    equal(jst('filter-unhtml', {}), '[object Object]', 'unhtml, object');    
    equal(jst('filter-unhtml', ''), '', 'unhtml, ""');    
    
    equal(jst('filter-stripTags', '<div class="test">&&&</div>'), '&&&', 'stripTags, string');    
    equal(jst('filter-stripTags', 123), '123', 'stripTags, number');    
    equal(jst('filter-stripTags', {}), '[object Object]', 'stripTags, object');    
    equal(jst('filter-stripTags', ''), '', 'stripTags, ""');    
    
    equal(jst('filter-uri', 'http://example.ru/?a=1&b=dkoskods&c=1 2&d=тест'), 'http://example.ru/?a=1&b=dkoskods&c=1%202&d=%D1%82%D0%B5%D1%81%D1%82', 'uri, string');    
    equal(jst('filter-uri', 123), '123', 'uri, number');    
    equal(jst('filter-uri', {}), '[object%20Object]', 'uri, object');    
    equal(jst('filter-uri', ''), '', 'uri, ""');    
    
    equal(jst('filter-truncate', 'Hello world!', 3), 'Hel', 'truncate, string');    
    equal(jst('filter-truncate', 123456, 3), '123', 'truncate, number');    
    equal(jst('filter-truncate', {}, 3), '[ob', 'truncate, object');    
    equal(jst('filter-truncate', '', 3), '', 'truncate, ""');    
    
    equal(jst('filter-trim', '      Hello world!             '), 'Hello world!', 'trim, string');    
    equal(jst('filter-trim', 123456), '123456', 'trim, number');    
    equal(jst('filter-trim', {}), '[object Object]', 'trim, object');    
    equal(jst('filter-trim', ''), '', 'trim, ""');    
    
    equal(jst('filter-upper', 'hello world!'), 'HELLO WORLD!', 'upper, string');    
    equal(jst('filter-upper', 123456), '123456', 'upper, number');    
    equal(jst('filter-upper', {}), '[OBJECT OBJECT]', 'upper, object');    
    equal(jst('filter-upper', ''), '', 'upper, ""');

    equal(jst('filter-lower', 'HELLO WORLD!'), 'hello world!', 'lower, string');    
    equal(jst('filter-lower', 123456), '123456', 'lower, number');    
    equal(jst('filter-lower', {}), '[object object]', 'lower, object');    
    equal(jst('filter-lower', ''), '', 'lower, ""');

    equal(jst('filter-ucfirst', 'hello world!'), 'Hello world!', 'ucfirst, string');    
    equal(jst('filter-ucfirst', 123456), '123456', 'ucfirst, number');    
    equal(jst('filter-ucfirst', {}), '[object Object]', 'ucfirst, object');    
    equal(jst('filter-ucfirst', ''), '', 'ucfirst, ""');

    equal(jst('filter-lcfirst', 'HELLO WORLD!'), 'hELLO WORLD!', 'lcfirst, string');    
    equal(jst('filter-lcfirst', 123456), '123456', 'lcfirst, number');    
    equal(jst('filter-lcfirst', {}), '[object Object]', 'lcfirst, object');    
    equal(jst('filter-lcfirst', ''), '', 'lcfirst, ""');

    equal(jst('filter-collapse', 'Hello              world!', 3), 'Hello world!', 'collapse, string');    
    equal(jst('filter-collapse', 123456), '123456', 'collapse, number');    
    equal(jst('filter-collapse', {}), '[object Object]', 'collapse, object');    
    equal(jst('filter-collapse', ''), '', 'collapse, ""');

    equal(jst('filter-repeat', 'Hello world!', 3), 'Hello world!Hello world!Hello world!', 'repeat, string');    
    equal(jst('filter-repeat', 123456, 3), '123456123456123456', 'repeat, number');    
    equal(jst('filter-repeat', {}, 3), '[object Object][object Object][object Object]', 'repeat, object');    
    equal(jst('filter-repeat', '', 3), '', 'repeat, ""');
    
    equal(jst('filter-indent', 'Hello world!\nHello world!\nHello world!', '- '), '- Hello world!\n- Hello world!\n- Hello world!', 'indent, string');    
    equal(jst('filter-indent', 123456, '- '), '- 123456', 'indent, number');    
    equal(jst('filter-indent', {}, '- '), '- [object Object]', 'indent, object');    
    equal(jst('filter-indent', '', '- '), '', 'indent, ""');
    
    equal(jst('filter-remove', 'Hello world!', 'Hello'), ' world!', 'remove, string');    
    equal(jst('filter-remove', 123456, '123'), '456', 'remove, number');    
    equal(jst('filter-remove', {}, /\[object/), ' Object]', 'remove, object');    
    equal(jst('filter-remove', '', ''), '', 'remove, ""');
    
    equal(jst('filter-replace', 'Hello world!', 'world', 'friend'), 'Hello friend!', 'replace, string');    
    equal(jst('filter-replace', 123456, '123', '098'), '098456', 'replace, number');    
    equal(jst('filter-replace', {}, /\[object/, 'type'), 'type Object]', 'replace, object');    
    equal(jst('filter-replace', '', null), '', 'replace, ""');
    
    equal(jst('filter-_undef', 'Hello world!'), 'Hello world!', '_undef, string');    
    equal(jst('filter-_undef', 123456), '123456', '_undef, number');    
    equal(jst('filter-_undef', undefined), '', '_undef, undefined');    
    equal(jst('filter-_undef', null), '', '_undef, null');    
    
    equal(jst('filter-_undefHtml', '<div class="test">&&&</div>'), '&lt;div class=&quot;test&quot;&gt;&amp;&amp;&amp;&lt;/div&gt;', '_undefHtml, string');    
    equal(jst('filter-_undefHtml', 'Hello world!'), 'Hello world!', '_undefHtml, string');    
    equal(jst('filter-_undefHtml', 123456), '123456', '_undefHtml, number');    
    equal(jst('filter-_undefHtml', undefined), '', '_undefHtml, undefined');    
    equal(jst('filter-_undefHtml', null), '', '_undefHtml, null');        
    equal(jst('filter-_undefHtml', ''), '', '_undefHtml, ""');    
});