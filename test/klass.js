var test = require('tape');
var sinon = require('sinon');
var Klass = require('../lib/klass');

test('Klass#constructor'
  + ' accepts a definition as its only parameter.', function(t) {

  t.plan(3);

  var definition = function() {};
  var klass = new Klass(definition);

  t.equal(klass.definition, definition);
  t.notOk(klass.Ctor.name);
  t.notOk(klass.parentKlass);
});

test('Klass#constructor'
  + ' accepts a name and a definition.', function(t) {

  t.plan(3);

  var definition = function() {};
  var klass = new Klass('Foo', definition);

  t.equal(klass.definition, definition);
  t.equal(klass.Ctor.name, 'Foo');
  t.notOk(klass.parentKlass);
});

test('Klass#constructor'
  + ' accepts a definition and parent Klass.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parentKlass = new Klass(function() {});
  var klass = new Klass(definition, parentKlass);

  t.equal(klass.definition, definition);
  t.notOk(klass.Ctor.name);
  t.equal(klass.parentKlass, parentKlass);
});

test('Klass#constructor'
  + ' accepts a name, definition, and parent Klass.', function(t) {

  t.plan(3);

  var definition = function() {};
  var parentKlass = new Klass(function() {});
  var klass = new Klass('Bar', definition, parentKlass);

  t.equal(klass.definition, definition);
  t.equal(klass.Ctor.name, 'Bar');
  t.equal(klass.parentKlass, parentKlass);
});

test('Klass#constructor'
  + ' creates a constructor.', function(t) {

  t.plan(1);

  var klass = new Klass(function() {});

  t.ok(klass.Ctor);
});

test('Klass#constructor'
  + ' sets up the inheritance chain when given a parent Klass.', function(t) {

  t.plan(4);

  var parentKlass = new Klass(function() {});
  var klass = new Klass(function() {}, parentKlass);

  t.equal(klass.parentKlass, parentKlass);
  t.equal(klass.Parent, parentKlass.Ctor);
  t.equal(klass.Ctor.super_, parentKlass.Ctor); // Node style `super_`.
  t.equal(klass.Ctor.prototype.super, parentKlass.Ctor.prototype);
});

test('Klass#constructor'
  + ' creates the protected and private key and method objects', function(t) {

  t.plan(17);

  var parentKlass = new Klass(function() {});
  var klass = new Klass(function() {}, parentKlass);
  var unrelatedKlass = new Klass(function() {});

  t.ok(parentKlass.protectedKey);
  t.ok(parentKlass.protectedMethods);
  t.ok(parentKlass.privateKey);
  t.ok(parentKlass.privateMethods);

  t.ok(klass.protectedKey);
  t.ok(klass.protectedMethods);
  t.ok(klass.privateKey);
  t.ok(klass.privateMethods);

  t.ok(unrelatedKlass.protectedKey);
  t.ok(unrelatedKlass.protectedMethods);
  t.ok(unrelatedKlass.privateKey);
  t.ok(unrelatedKlass.privateMethods);

  // Protected keys are shared within klass heirachies, but not
  // between unrelated klass instances.
  t.equal(klass.protectedKey, parentKlass.protectedKey);
  t.notEqual(klass.protectedKey, unrelatedKlass.protectedKey);
  t.notEqual(parentKlass.protectedKey, unrelatedKlass.protectedKey);

  // Protected method objects have their parent klass protected
  // method objects in their prototype chain.
  t.equal(
    Object.getPrototypeOf(klass.protectedMethods),
    parentKlass.protectedMethods
  );
  t.notEqual(
    Object.getPrototypeOf(unrelatedKlass.protectedMethods),
    parentKlass.protectedMethods
  );
});

test('Klass#constructor'
  + ' adds the subclass and final methods to the constructor', function(t) {

  t.plan(2);

  var klass = new Klass(function() {});

  t.ok(klass.Ctor.subclass);
  t.ok(klass.Ctor.final);
});

test('Klass#construct'
  + ' invokes the definition and returns the constructor', function(t) {

  t.plan(4);

  var definition = sinon.spy();
  var klass = new Klass(definition);
  var ctor = klass.construct();

  t.equal(ctor, klass.Ctor);
  t.ok(definition.called);
  t.ok(definition.calledOn(klass.Ctor));
  t.ok(definition.calledWith(
    klass.Ctor.prototype,
    klass.protectedKey,
    klass.protectedMethods,
    klass.privateKey,
    klass.privateMethods
  ));
});
