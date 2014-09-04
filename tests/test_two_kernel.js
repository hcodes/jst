test('2 kernels together', function () {
    equal(jst.has('filter-html'), true, 'Availability template filter.jst.js');
    equal(jst.has('block3x'), true, 'Availability template block.jst.js');
});
