var test = require('tape');
var ctor = require('..');
var Father = require('./fixtures/father');
var Son = require('./fixtures/son');

test('It accepts a function and returns a constructor.', function(t) {

  t.plan(1);

  var Ctor = ctor(function() {});
  t.equal(Ctor.prototype.constructor, Ctor);
});

test('It returns a constructor that can subclass itself.', function(t) {

  t.plan(2);

  var Ctor = ctor(function() {});
  var SubCtor = Ctor.subclass(function() {});
  var subInst = new SubCtor();

  t.ok(subInst instanceof Ctor);
  t.equal(SubCtor.super_, Ctor);
});

test('It returns a constructor that can prevent futher '
  + 'subclassing.', function(t) {

  t.plan(1);

  var Ctor = ctor(function() {});
  var SubCtor = Ctor.subclass(function() {});
  SubCtor.final();

  t.throws(function() {
    SubCtor.subclass(function() {});
  });
});


test('It allows subclasses to access protected members.', function(t) {

  t.plan(4);

  var adam = new Father('Adam');
  var bill = new Son('Bill', adam);
  var chris = new Son('Chris', bill);
  var david = new Son('David', chris);

  t.equal(
    adam.introduceYourself(),
    'Hello, I am Adam'
  );
  t.equal(
    bill.introduceYourself(),
    'Hello, I am Bill, son of Adam'
  );
  t.equal(
    chris.introduceYourself(),
    'Hello, I am Chris, son of Bill, son of Adam'
  );
  t.equal(
    david.introduceYourself(),
    'Hello, I am David, son of Chris, son of Bill, son of Adam'
  );

});
