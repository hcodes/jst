test('2 ядра вместе', function () {
    equal(jst.has('filter-html'), true, 'Наличие шаблона в filter.jst.js');
    equal(jst.has('block3x'), true, 'Наличие шаблона в block.jst.js');
});
