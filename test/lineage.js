var test = require('tape');
var Father = require('./fixtures/father');
var Son = require('./fixtures/son');

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
