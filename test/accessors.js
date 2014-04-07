var test = require('tape');
var ctor = require('../');

test('Constructor prototypes can dynamically add getters methods to themselves'
  + ' that get protected instance properties.', function(t) {

  t.plan(2);

  var Ctor = ctor(function(proto, _) {
    this.addGetters('foo', 'bar');
    proto.init = function(foo, bar) {
      _(this).foo = foo;
      _(this).bar = bar;
    };
  });

  var inst = new Ctor('FOO', 'BAR');
  t.equal(inst.getFoo(), 'FOO');
  t.equal(inst.getBar(), 'BAR');
});

test('Constructor prototypes can dynamically add setter methods to themselves'
  + ' that set protected instance properties.', function(t) {

  t.plan(2);

  var Ctor = ctor(function(proto, _) {
    this.addSetters('foo', 'bar');
    proto.getFoo = function() {
      return _(this).foo;
    };
    proto.getBar = function() {
      return _(this).bar;
    };
  });

  var inst = new Ctor();
  inst.setFoo('FOO');
  inst.setBar('BAR');
  t.equal(inst.getFoo(), 'FOO');
  t.equal(inst.getBar(), 'BAR');
});

test('Constructor prototypes can dynamically add accessor methods to themselves'
  + ' that get and set protected instance properties.', function(t) {

  t.plan(2);

  var Ctor = ctor(function() {
    this.addAccessors('foo', 'bar');
  });

  var inst = new Ctor();
  inst.setFoo('FOO');
  inst.setBar('BAR');
  t.equal(inst.getFoo(), 'FOO');
  t.equal(inst.getBar(), 'BAR');
});
