var test = require('tape');
var sinon = require('sinon');
var Class = require('../lib/klass');

test('Class#constructor'
  + ' accepts a definition as its only parameter.', function(t) {

  t.plan(3);

  var definition = function() {};
  var cls = new Class(definition);

  t.equal(cls.definition, definition);
  t.notOk(cls.Ctor.name);
  t.notOk(cls.parentClass);
});

test('Class#constructor'
  + ' accepts a name and a definition.', function(t) {

  t.plan(3);

  var definition = function() {};
  var cls = new Class('Foo', definition);

  t.equal(cls.definition, definition);
  t.equal(cls.Ctor.name, 'Foo');
  t.notOk(cls.parentClass);
});

test('Class#constructor'
  + ' accepts a definition and parent Class.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parentClass = new Class(function() {});
  var cls = new Class(definition, parentClass);

  t.equal(cls.definition, definition);
  t.notOk(cls.Ctor.name);
  t.equal(cls.parentClass, parentClass);
});

test('Class#constructor'
  + ' accepts a name, definition, and parent Class.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parentClass = new Class(function() {});
  var cls = new Class('Bar', definition, parentClass);

  t.equal(cls.definition, definition);
  t.equal(cls.Ctor.name, 'Bar');
  t.equal(cls.parentClass, parentClass);
});

test('Class#constructor'
  + ' creates a constructor.', function(t) {

  t.plan(1);

  var cls = new Class(function() {});

  t.ok(cls.Ctor);
});

test('Class#constructor'
  + ' sets up the inheritance chain when given a parent Class.', function(t) {

  t.plan(5);

  var parentClass = new Class(function() {});
  var cls = new Class(function() {}, parentClass);

  t.equal(cls.parentClass, parentClass);
  t.equal(cls.Parent, parentClass.Ctor);
  t.equal(cls.Ctor.super_, parentClass.Ctor); // Node style `super_`.
  t.equal(cls.Ctor.prototype.super, parentClass.Ctor.prototype);
  t.equal(cls.protectedMethods.super, parentClass.protectedMethods);
});

test('Class#constructor'
  + ' creates the protected and private key and method objects', function(t) {

  t.plan(17);

  var parentClass = new Class(function() {});
  var cls = new Class(function() {}, parentClass);
  var unrelatedClass = new Class(function() {});

  t.ok(parentClass.protectedKey);
  t.ok(parentClass.protectedMethods);
  t.ok(parentClass.privateKey);
  t.ok(parentClass.privateMethods);

  t.ok(cls.protectedKey);
  t.ok(cls.protectedMethods);
  t.ok(cls.privateKey);
  t.ok(cls.privateMethods);

  t.ok(unrelatedClass.protectedKey);
  t.ok(unrelatedClass.protectedMethods);
  t.ok(unrelatedClass.privateKey);
  t.ok(unrelatedClass.privateMethods);

  // Protected keys are shared within class heirachies, but not
  // between unrelated class instances.
  t.equal(cls.protectedKey, parentClass.protectedKey);
  t.notEqual(cls.protectedKey, unrelatedClass.protectedKey);
  t.notEqual(parentClass.protectedKey, unrelatedClass.protectedKey);

  // Protected method objects have their parent class protected
  // method objects in their prototype chain.
  t.equal(
    Object.getPrototypeOf(cls.protectedMethods),
    parentClass.protectedMethods
  );
  t.notEqual(
    Object.getPrototypeOf(unrelatedClass.protectedMethods),
    parentClass.protectedMethods
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
  var cls = new Class(function(proto) {
    proto.init = init;
  });
  var Ctor = cls.construct();

  new Ctor('foo', 'bar');
  t.ok(init.calledWith('foo', 'bar'));
});
