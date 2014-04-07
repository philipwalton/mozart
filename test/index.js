var test = require('tape');
var ctor = require('../');

function getFunctionName(fn) {
  return fn.toString().match(/^function\s*([^\s(]*)/)[1];
}

test('It accepts a function and returns a constructor.', function(t) {

  t.plan(1);

  var Ctor = ctor(function() {});
  t.equal(Ctor.prototype.constructor, Ctor);
});

test('It accepts a name and a function and returns a constructor'
  + ' named accordingly', function(t) {

  t.plan(2);

  var Ctor = ctor('Foo', function() {});
  t.equal(Ctor.prototype.constructor, Ctor);
  t.equal(getFunctionName(Ctor), 'Foo');
});
