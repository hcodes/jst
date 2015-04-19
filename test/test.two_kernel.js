var assert = require('chai').assert;

require('./templates/block.jst.js');
require('./templates/filter.jst.js');

describe('2 kernels together', function () {
    assert.equal(jst.has('filter-html'), true, 'Availability template filter.jst.js');
    assert.equal(jst.has('block3x'), true, 'Availability template block.jst.js');
});
