var test = require('tape');
var sinon = require('sinon');
var ctor = require('../');

test('Protected properties can be accessed using the'
  + ' protected key.', function(t) {

  t.plan(1);

  var Ctor = ctor(function(proto, _) {
    proto.init = function(name) {
      _(this).name = name;
    };
    proto.getName = function() {
      return _(this).name;
    };
  });

  var c = new Ctor('foo');
  t.equal(c.getName(), 'foo');
});

test('Protected methods can be called on the protected instance.', function(t) {

  t.plan(1);
  var protectedMethod = sinon.spy();

  var Ctor = ctor(function(proto, _, _protected) {
    proto.publicMethod = function() {
      _(this).protectedMethod();
    };
    _protected.protectedMethod = protectedMethod;
  });

  var c = new Ctor();
  c.publicMethod();
  t.ok(protectedMethod.called);
});

test('Private properties can be accessed using the'
  + ' private key.', function(t) {

  t.plan(1);

  var Ctor = ctor(function(proto, _, __protected, __) {
    proto.init = function(name) {
      __(this).name = name;
    };
    proto.getName = function() {
      return __(this).name;
    };
  });

  var c = new Ctor('foo');
  t.equal(c.getName(), 'foo');
});

test('Private methods can be called on the private instance.', function(t) {

  t.plan(1);
  var privateMethod = sinon.spy();

  var Ctor = ctor(function(proto, _, __protected, __, __private) {
    proto.publicMethod = function() {
      __(this).privateMethod();
    };
    __private.privateMethod = privateMethod;
  });

  var c = new Ctor();
  c.publicMethod();
  t.ok(privateMethod.called);
});

test('Prototype methods can call super.', function(t) {

  t.plan(1);

  var Parent = ctor(function(proto) {
    proto.method = function() {
      return 'foo';
    };
  });

  var Child = Parent.subclass(function(proto) {
    proto.method = function() {
      return proto.super.method.call(this) + 'bar';
    };
  });

  var GrandChild = Child.subclass(function(proto) {
    proto.method = function() {
      return proto.super.method.call(this) + 'baz';
    };
  });

  var grandChild = new GrandChild();
  t.equal(grandChild.method(), 'foobarbaz');
});

test('Prototype methods are inherited from their parent.', function(t) {

  t.plan(3);

  var parentOne = sinon.spy();
  var parentTwo = sinon.spy();
  var childOne = sinon.spy();

  var Parent = ctor(function(proto) {
    proto.one = parentOne;
    proto.two = parentTwo;
  });

  var Child = Parent.subclass(function(proto) {
    proto.one = childOne;
  });

  var GrandChild = Child.subclass(function() {});

  var grandChild = new GrandChild();
  grandChild.one();
  grandChild.two();

  t.ok(childOne.called);
  t.ok(parentTwo.called);
  t.notOk(parentOne.called);
});

test('Protected methods can call super.', function(t) {

  t.plan(1);

  var Parent = ctor(function(proto, _, _protected) {
    proto.callProtectedMethod = function() {
      return _(this).method();
    };
    _protected.method = function() {
      return 'foo';
    };
  });

  var Child = Parent.subclass(function(proto, _, _protected) {
    _protected.method = function() {
      return _protected.super.method.call(_(this)) + 'bar';
    };
  });

  var GrandChild = Child.subclass(function(proto, _, _protected) {
    _protected.method = function() {
      return _protected.super.method.call(_(this)) + 'baz';
    };
  });

  var grandChild = new GrandChild();
  t.equal(grandChild.callProtectedMethod(), 'foobarbaz');
});

test('Protected methods are inherited from their parent.', function(t) {

  t.plan(3);

  var parentOne = sinon.spy();
  var parentTwo = sinon.spy();
  var childOne = sinon.spy();

  var Parent = ctor(function(proto, _, _protected) {
    proto.callProtected = function(method) {
      _(this)[method]();
    };
    _protected.one = parentOne;
    _protected.two = parentTwo;
  });

  var Child = Parent.subclass(function(proto, _, _protected) {
    _protected.one = childOne;
  });

  var GrandChild = Child.subclass(function() {});

  var grandChild = new GrandChild();
  grandChild.callProtected('one');
  grandChild.callProtected('two');

  t.ok(childOne.called);
  t.ok(parentTwo.called);
  t.notOk(parentOne.called);
});

test('Private methods do not have parents.', function(t) {

  t.plan(2);

  var Parent = ctor(function(proto, _, _protected, __, __private) {});

  var Child = Parent.subclass(function(proto, _, _protected, __, __private) {
    t.ok(__private);
    t.notOk(__private.super);
  });
});

