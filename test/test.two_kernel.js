var assert = require('chai').assert;

require('../lib/kernel');
require('../lib/helper');

require('../template/block.jst.js');
require('../template/filter.jst.js');

describe('2 kernels together', function() {
    assert.equal(jst.has('filter-html'), true, 'Availability template filter.jst.js');
    assert.equal(jst.has('block3x'), true, 'Availability template block.jst.js');
});
