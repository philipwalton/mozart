var test = require('tape');
var sinon = require('sinon');
var Class = require('../lib/class');

function getFunctionName(fn) {
  return fn.toString().match(/^function\s*([^\s(]*)/)[1];
}

test('Class#constructor'
  + ' accepts no parameters.', function(t) {

  t.plan(3);

  var cls = new Class();

  t.notOk(getFunctionName(cls.Ctor));
  t.notOk(cls.definition);
  t.notOk(cls.parent);

});

test('Class#constructor'
  + ' accepts a definition as its only parameter.', function(t) {

  t.plan(3);

  var definition = function() {};
  var cls = new Class(definition);

  t.notOk(getFunctionName(cls.Ctor));
  t.equal(cls.definition, definition);
  t.notOk(cls.parent);
});

test('Class#constructor'
  + ' accepts a name and a definition.', function(t) {

  t.plan(3);

  var definition = function() {};
  var cls = new Class('Foo', definition);

  t.equal(getFunctionName(cls.Ctor), 'Foo');
  t.equal(cls.definition, definition);
  t.notOk(cls.parent);
});

test('Class#constructor'
  + ' accepts a definition and parent Class.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parent = new Class(function() {});
  var cls = new Class(definition, parent);

  t.notOk(getFunctionName(cls.Ctor));
  t.equal(cls.definition, definition);
  t.equal(cls.parent, parent);
});

test('Class#constructor'
  + ' accepts a name, definition, and parent Class.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parent = new Class(function() {});
  var cls = new Class('Bar', definition, parent);

  t.equal(getFunctionName(cls.Ctor), 'Bar');
  t.equal(cls.definition, definition);
  t.equal(cls.parent, parent);
});

test('Class#constructor'
  + ' creates a constructor.', function(t) {

  t.plan(1);

  var cls = new Class(function() {});

  t.ok(cls.Ctor);
});

test('Class#constructor'
  + ' sets up the inheritance chain when given a parent Class.', function(t) {

  t.plan(4);

  var parent = new Class(function() {});
  var cls = new Class(function() {}, parent);

  t.equal(cls.parent, parent);
  t.equal(cls.Ctor.super_, parent.Ctor); // Node style `super_`.
  t.equal(cls.Ctor.prototype.super, parent.Ctor.prototype);
  t.equal(cls.protectedMethods.super, parent.protectedMethods);
});

test('Class#constructor'
  + ' creates the protected and private key and method objects', function(t) {

  t.plan(4);

  var cls = new Class(function() {});

  t.ok(cls.protectedKey);
  t.ok(cls.protectedMethods);
  t.ok(cls.privateKey);
  t.ok(cls.privateMethods);
});

test('Class#constructor'
  + ' creates protected keys that are shared within class heirachies, but not'
  + ' unrelated class instances.', function(t) {

  t.plan(3);

  var parent = new Class(function() {});
  var cls = new Class(function() {}, parent);
  var unrelated = new Class(function() {});

  t.equal(cls.protectedKey, parent.protectedKey);
  t.notEqual(cls.protectedKey, unrelated.protectedKey);
  t.notEqual(parent.protectedKey, unrelated.protectedKey);
});

test('Class#constructor'
  + ' creates protected method objects that have their parent class\'s'
  + ' protected method object as their prototype.', function(t) {

  t.plan(1);

  var parent = new Class(function() {});
  var cls = new Class(function() {}, parent);

  t.equal(
    Object.getPrototypeOf(cls.protectedMethods),
    parent.protectedMethods
  );
});

test('Class#constructor'
  + ' creates protected keys that return instances with the class\'s protected'
  + ' methods object as their prototype (even though the protected key'
  + ' itself is shared by all classes in the heirarchy)', function(t) {

  t.plan(2);

  var parent = new Class(function() {});
  var cls = new Class(function() {}, parent);

  t.equal(
    Object.getPrototypeOf(parent.protectedKey(new parent.Ctor())),
    parent.protectedMethods
  );
  t.equal(
    Object.getPrototypeOf(parent.protectedKey(new cls.Ctor())),
    cls.protectedMethods
  );
});

test('Class#constructor'
  + ' adds the subclass and final methods to the constructor', function(t) {

  t.plan(2);

  var cls = new Class(function() {});

  t.ok(cls.Ctor.subclass);
  t.ok(cls.Ctor.final);
});

test('Class#construct'
  + ' invokes the definition and returns the constructor', function(t) {

  t.plan(4);

  var definition = sinon.spy();
  var cls = new Class(definition);
  var ctor = cls.construct();

  t.equal(ctor, cls.Ctor);
  t.ok(definition.called);
  t.ok(definition.calledOn(cls.Ctor));
  t.ok(definition.calledWith(
    cls.Ctor.prototype,
    cls.protectedKey,
    cls.protectedMethods,
    cls.privateKey,
    cls.privateMethods
  ));
});

test('Class#construct'
  + ' just returns the constructor if no definition exists', function(t) {

  t.plan(2);

  var cls = new Class();
  var ctor;

  t.doesNotThrow(function() {
    ctor = cls.construct();
  });
  t.ok(ctor);
});

test('Class#construct'
  + ' returns a constructor that can subclass itself.', function(t) {

  t.plan(2);

  var cls = new Class(function() {});
  var Ctor = cls.construct();
  var SubCtor = Ctor.subclass(function() {});
  var subInst = new SubCtor();

  t.ok(subInst instanceof Ctor);
  t.equal(SubCtor.super_, Ctor);
});

test('Class#construct'
  + ' returns a constructor that can prevent further'
  + ' subclassing.', function(t) {

  t.plan(1);

  var cls = new Class(function() {});
  var Ctor = cls.construct();
  var SubCtor = Ctor.subclass(function() {});
  SubCtor.final();

  t.throws(function() {
    SubCtor.subclass(function() {});
  });
});

test('Class#construct'
  + ' returnes a constructor that, when invoked, will invoke the'
  + ' init method on the prototype.', function(t) {

  t.plan(1);

  var init = sinon.spy();
  var cls = new Class(function(prototype) {
    prototype.init = init;
  });
  var Ctor = cls.construct();

  new Ctor('foo', 'bar');
  t.ok(init.calledWith('foo', 'bar'));
});
