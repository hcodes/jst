test('Основы', function () {
    equal(jst.has('invalid_params'), false, 'Шаблон с некорректным названием переменных не должен компилироваться');
    
    equal(jst.get('trim'), '', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');    
    equal(jst.get('without-trim'), ' 123 ', 'trim="false".');    
    equal(jst.get('without-trim-delete-spaces'), '       123      ', 'trim="false" + delete-spaces="false".');
    equal(jst('trim-with-number'), '1', 'Шаблон с пробелами, табуляцией и переносами строк должен компилироваться в пустую строку.');    
    
    equal(jst('new-line'), '      ', 'Перенос строк заменяется на пробел.');
    
    equal(jst('undef_null', undefined), '12', 'Вставка переменных со значением null заменяются на пустую строку.');
    equal(jst('undef_null', null), '12', 'Вставка переменных со значением null заменяются на пустую строку.');
    
    equal(jst('empty-string'), '', 'Вставка ничего даёт пустую строку.');
    
    equal(jst('quotes'), '\'\'\'', 'Одинарные кавычки.');
    equal(jst('quotes-with-slash', '123'), '\\\'\\\'\\\'123\'\'\'\' \\\'\\\'\\\'', 'Одинарные кавычки с обратным слешом.');
    
    equal(typeof jst.get('without-inline-js'), 'string', 'Шаблон без вставки значение и инлайн-js компилируется в строку.');
    equal(typeof jst.get('with-inline-js'), 'function', 'Шаблон со вставкой значений или инлайн-js компилируется в функцию.');
    
    equal(jst.get('with-4-params').length, 4, 'Проверка на количество параметров.');
    
    equal(jst('same-template-name', 1), '11', 'Два шаблона с одним и тем же названием, срабатывать должен последний объявленный шаблон.');
    
    equal(jst('call-template', 1), '1__11__1', 'Вызов другого шаблона из шаблона.');
});

//test('Фильтры', function () {
//});