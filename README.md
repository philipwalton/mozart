Mozart
======

Mozart is a different kind of classical inheritance library for JavaScript. In addition to providing an easy way to subclass (something pretty much every library does), Mozart gives you real data encapsulation with private and protected properties and methods.

## Usage

Mozart provides a single factory method that can be used to create new constructors.

```javascript
var ctor = require('mozart');

var SomeClass = ctor(fn);
```

Here's an example of a class hierarchies sharing protected instance members.

```javascript
var ctor = require('mozart');

// The parent class.
var Father = ctor(function(proto, _, _protected) {
  proto.init = function(name) {
    _(this).name = name;
  };
  proto.toString = function() {
    return _(this).name;
  };
  proto.introduceYourself = function() {
    return 'Hello, I am ' + this;
  };
});

// The subclass.
var Son = Father.subclass(function(proto, _, _protected) {
  var supertype = this.super_.prototype;
  proto.init = function(name, father) {
    supertype.init.apply(this, arguments);
    _(this).father = father;
  }
  proto.introduceYourself = function() {
    var myIntroduction = supertype.introduceYourself.apply(this);
    var ancestorNames = _(this).getAncestors().map(function(ancestor) {
      return _(ancestor).name;
    })

    return [myIntroduction].concat(ancestorNames).join(', son of ');
  };
  _protected.getAncestors = function() {
    var ancestors = [];
    var father = _(this).father;
    do {
      ancestors.push(father);
    } while (father = _(father).father);

    return ancestors;
  };
});
```

Given the above classes, check out the following output:

```javascript
var adam = new Father('Adam');
var bill = new Son('Bill', adam);
var chris = new Son('Chris', bill);
var david = new Son('David', chris);

adam.introduceYourself();
// 'Hello, I am Adam'

bill.introduceYourself();
// 'Hello, I am Bill, son of Adam'

chris.introduceYourself();
// 'Hello, I am Chris, son of Bill, son of Adam'

david.introduceYourself();
// 'Hello, I am David, son of Chris, son of Bill, son of Adam'
```

## API

### new Class(fn)

- Create a new class.
- The function is invoked with `(prototype, privates, _, __)`.

### Class#extend(fn);

- Extend an existing class.
- The function is invoked with `(prototype, privates, _, __)`.

### Class#final();

- Prevent a class from being subclassed.
