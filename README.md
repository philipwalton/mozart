Mozart
======

[![Build Status](https://secure.travis-ci.org/philipwalton/mozart.png)](https://travis-ci.org/philipwalton/mozart)

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#)
4. [API](#api)
5. [Browser and Environment Support](#browser-and-environment-support)
6. [Building and Testing](#testing)

## Introduction

Mozart is a full-featured, classical inheritance library for Node.js and the browser. With Mozart you get:

- Simple subclassing.
- Private and protected methods and properties.
- Intuitive super invocations.
- Dynamic getter and setter generation.

Unlike most JS inheritence libraries, Mozart does more than just hide away the prototype boilerplate that nobody likes to remember. It also offers real data encapsulation, similiar to what you'd find to most classical languages. Mozart uses the [Private Parts](https://github.com/philipwalton/private-parts) module so you no longer have to prefix your properties with an underscore and hope nobody touches them. Your public interface can be exactly what you want it to be.

## Getting Started

Mozart provides a single factory method that can be used to create new constructors. When given no arguments, an annoymous constructor is returned. If passed a name, a constructor is created with that name. *(Note, named constructors can be useful for debugging.)*

```javascript
var ctor = require('mozart');

// Create an anonymous constructor.
var Foo = ctor();

// Create a named constructor.
var Bar = ctor('Bar');
```

If you're failing to see what value the above code provides you, don't worry. The real value provided by Mozart comes from passing a class definition to the constructor factory (which I'll explain later). That being said, there are a few differences between Mozart constructors and regular JavaScript constructors worth pointing out.

The primary difference is that Mozart constructors are created for you, meaning you don't have the ability to add any logic to them. This is intentional as much of the headache of traditional JS classical inheritance patterns comes from the fact that constructors are different from prototype methods.

To solve this problem, the one (and only) thing Mozart constructors do is look for an `init` method and (if found) call it with whatever arguments were passed to the constructor. Moving the constructor logic to a prototype method simplifies everything. Inheritanc is easier, and super methods can all be invoked in the same way.

In addition to this, Mozart constructors are packaged with five convinence methods: `subclass`, `final`, `addGetters`, `addSetters`, and `addAccessors`. More details about these methods can be found in the [API](#api) section).

### Class Hierarchies

The real power of the constructor factory method comes when you pass it a class definition. With a class definition you can write classes with public, private, and protected methods and properties.

The class definition is a function that is invoked with five arguments: the public prototype, the protected key function, the protected methods object, the private key function, and the private methods object. A detailed description of each can be found in the [API](#api) below.

**Note**: if you don't know what a "key function" is, check out the [Private Parts](https://github.com/philipwalton/private-parts) module to learn more.

```javascript
var ctor = require('mozart');

var Citizen = ctor(function(proto, _, _protected) {

  // == PUBLIC ==

  proto.init = function(name, age) {
    _(this).name = name;
    _(this).age = age;
  };
  proto.vote = function(politician) {
    if (_(this).allowedToVote()) {
      console.log(_(this).name + ' voted for ' + politician);
    } else {
      throw new Error(_(this).name + ' is not allowed to vote.');
    }
  };

  // == PROTECTED ==

  _protected.allowedToVote = function() {
    return this.age > 18;
  };
});
```

The above class definition uses both public and protected methods. The next example subclasses `Citizen` and inherits its public and protected methods. As you can see, both public and protected methods are able to inherit from their parent and invoke their supermethods.

```javascript
var Criminal = Citizen.subclass(function(proto, _, _protected) {

  proto.init = function(name, age, crime) {
    _(this).crime = crime;
    proto.super.init.call(this, name, age);
  };

  _protected.allowedToVote = function() {
    return _(this).crime != 'felony'
      && _protected.super.allowedToVote.call(this);
  };
});

var joe = new Criminal('Joe', 27, 'felony');
joe.vote('Obama') // Throws: Joe is not allowed to vote.
```

### Getters and Setters

In most object oriented languages with classes, all instance variables are private (or protected) by default and the only way to access them is to create getters and setters.

With Mozart you can take the same approach, and it offers an easy way to dynamically generate those methods to avoid extraneous typing.

Here's how you'd write getters and setters manually:

```javascript
var Citizen = ctor(function(proto, _) {
  proto.getName = function() {
    return _(this).name;
  };
  proto.getAge = function() {
    return _(this).age;
  };
  proto.setName = function(value) {
    _(this).name = value;
  };
  proto.setAge = function(value) {
    _(this).age = value;
  };
};
```

And here's how you'd do it dynamically with Mozart:

```javascript
var Citizen = ctor(function() {
  this.addGetters('name', 'age');
  this.addSetters('name', 'age');
};
```

The above example calls the `addGetters` and `addSetters` methods on `this`, which in the context of the class definition is the contructor itself. It could alternatively have been written outside of the class definition:

```javascript
var Citizen = ctor();
Citizen.addGetters('name', 'age');
Citizen.addSetters('name', 'age');
```

Lastly, if you want to add a getter and setter for the same property you could simply use `addAccessors`.

```javascript
var Citizen = ctor();
Citizen.addAccessors('name', 'age');
```

## API

### The Constructor Factory

```javascript
var ctor = require('mozart');
```

The Mozart module consists of a single factory method that can be used to create new constructors from a given class definition. All future examples assume the contructor factory is stored on the variable `ctor` as in the above example.

#### ctor(*[name]*, *[definition]*)

Create a new constructor with an optional name and optional class definition.

**`name`**: {string} *(optional)* The name of the constructor. Names can be useful for debugging.

**`definition`**: {Function} *(optional)* The class definition &mdash; a function that is invoked with the public, protected, and private keys and method objects.

### The Class Definition

The class definition is the function passed to the constructor factory. This function defines the public, private, and protected methods.

#### definition(proto, _, _protected, __, __private)

The class definition function is invoked with the returned constructor as its `this` context and passed the following five arguments:

**`proto`**: {Object} The prototype of the returned constructor. In the above example, `proto` would equal `MyConstructor.prototype`.

**`_`**: {Function} The protected key. This is used to get and set protected instance properties. Protected instances can be accessed by the current class and its subclasses. (See [Private Parts](https://github.com/philipwalton/private-parts#the-key-function) for more information on key functions.)

**`_protected`**: {Object} The protected prototype. Use this object to store protected methods that are shared by all protected instances. Protected methods can be accessed by the current class and its subclasses.

**`__`**: {Function} The private key. This is used to get and set private instance properties. Private instances can only be accessed by the current class. (See [Private Parts](https://github.com/philipwalton/private-parts#the-key-function) for more information on key functions.)

**`__private`**: {Object} The private prototype. Use this object to store private methods that are shared by all private instances. Private methods can only be accessed by the current class.

### The Returned Constructor

The returned constructor is just a normal JavaScript constructor, but it has five convience methods mixed in.

#### Constructor.subclass(*[name]*, *[definition]*)

Once you have a constructor that was made using Mozart's constructor factory, you can easily subclass it. Subclassing returns a new constructor whose prototype has the parent constructor's prototype in it's chain. Subclassing also sets up the prototype chain for the protected methods, allowing you to invoke super.

#### Constructor.addGetters(prop1, *[prop2]*, *[...propN]*)

Dynamically create getter methods on the constructor prototype for the given properties. Getter methods appear in the form of `getPropertyName()` for property `propertyName`.

#### Constructor.addSetters(prop1, *[prop2]*, *[...propN]*)

Dynamically create setter methods on the constructor prototype for the given properties. Setter methods appear in the form of `setPropertyName(value)` for property `propertyName`.

#### Constructor.addAccessors(prop1, *[prop2]*, *[...propN]*)

Dynamically create both getter and setter methods on the constructor prototype for the given properties.

#### Constructor.final()

Calling `final` on a Mozart constructor prevents it from being subclassed. This can be important if you need to ensure that your protected methods are truly protected. Since all classes in a hierarchy share the same protected key, a malicious user could subclass one of your constructors and expose the key publicly.

If this is a concern, make sure to call `final()` on all classes once they no longer needs to be subclassed.

## Browser and Environment Support

Mozart has [been tested](https://ci.testling.com/philipwalton/mozart) and, with a [WeakMap Polyfill](https://github.com/Benvie/WeakMap), known to work in the following environments.

* Node.js
* Chrome 6+
* Firefox 4+
* Safari 5.1+
* Internet Explorer 9+
* Opera 12+

For a list of environments that support WeakMap natively, see [Kangax's ES6 compatibility tables](http://kangax.github.io/es5-compat-table/es6/#WeakMap).

## Building and Testing

To run the tests and build the browser version of the library, use the following commands:

```sh
# Run the node and browser tests.
make test

# Build the browser version.
make build

# Test and build.
make
```

 Mozart uses [Browserify](http://browserify.org/) to build the browser version of the library as well as browser versions of the tests. It uses [Travic-CI](https://travis-ci.org/) to run the tests in Node.js and [Testling](https://ci.testling.com/) to run the tests in actual browsers on each commit.

