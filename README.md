Mozart
======

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#)
* [API](#api)
* [Building and Testing](#testing)

## Introduction

Mozart is a full-featured, classical inheritance library for JavaScript that offers a simple and intuitive way to subclass as well as providing **public**, **protected** and **private** methods and properties.

Mozart uses the [Private Parts](https://github.com/philipwalton/private-parts) module to bring real data encapsulation to JavaScript class heirarchies.

## Usage

Mozart provides a single factory method that can be used to create new constructors. When given no arguments, an annoymous constructor is returned. If passed a name, the constructor is created with that name. (Note, named constructors can be useful for debugging.)

```javascript
var ctor = require('mozart');

// Create an anonymous constructor.
var Foo = ctor();

// Create a named constructor.
var Bar = ctor('Bar');
```

If you're failing to see what value the above code provides you, don't worry. The real value provided by Mozart comes from passing a class definition to the constructor factory (which I'll explain later). That being said, there are a few differences between Mozart constructors and regular JavaScript constructors worth pointing out.

The primary difference is that Mozart constructors are created for you, meaning you don't have the ability to add any logic to them. This is intentional as much of the headache of traditional JS classical inheritance patterns comes from the fact that constructors are not in the prototype chain.

To solve this problem, the one (and only) thing Mozart constructors do is look for an `init` method, and if one it found it is called with whatever arguments were passed to the constructor. Moving the constructor logic to a prototype method simplifies everything. Inheritanc is easier, and super methods can all be invoked in the same way.

In addition to this, Mozart constructors are packaged with five convinence methods to make inheritance easier: `subclass`, `final`, `addGetters`, `addSetters`, and `addAccessors`. More details about these methods can be found in the [API](#api) section).

### Class Hierarchies

The real power of the constructor factory method comes when you pass it a class definition. With a class definition you can write classes with public, private, and protected methods and properties.

The class definition is a function that is invoked with five arguments: the public prototype, the protected key function, the protected methods object, the private key function, and the private methods object. A detailed description of each can be found in the [API](#api) below.

**Note**: if you don't know what the key function is, check out the [Private Parts](https://github.com/philipwalton/private-parts) module to learn more.

```javascript
var ctor = require('./');

var Citizen = ctor(function(proto, _, _protected) {
  // Public methods.
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
  // Protected methods.
  _protected.allowedToVote = function() {
    return this.age > 18;
  };
});
```

The above class definition uses both public and protected methods. The next example subclasses `Citizen` in shows how you can both inherit methods from you parent as well as invoke a super-method.

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

As you can see, the Criminal subclass inherits the `vote` method from Citizen. It also illustrates how to invoke a super-method as shown in the public method `init` and the protected method `allowedToVote`.

## API

### The Constructor Factory

```javascript
var ctor = require('mozart');
```

The Mozart module consists of a single factory method that can be used to create new constructors from a given class definition. All future examples assume the contructor factory is stored on the variable `ctor` as in the above example.

#### `ctor([name], [definition])`

Create a new constructor with an optional name and optional class definition.

**`name`**: {string} *(optional)* The name of the constructor. Names can be useful for debugging.
**`definition`**: {Function} *(optional)* The class definition &mdash; a function that is invoked with the public, protected, and private keys and method objects.

### The Class Definition

The class definition is the function passed to the constructor factory. This function defines the public, private, and protected methods.

#### `definition(proto, _, _protected, __, __private)`

The class definition function is invoked with the returned constructor as its `this` context and passed the following five arguments:

**`proto`**: {Object} The prototype of the returned constructor. In the above example, `proto` would equal `MyConstructor.prototype`.

**`_`**: {Function} The protected key. This is used to get and set protected instance properties. Protected instances can be accessed by the current class and its subclasses. (See [Private Parts](https://github.com/philipwalton/private-parts#the-key-function) for more information on key functions.)

**`_protected`**: {Object} The protected prototype. Use this object to store protected methods that are shared by all protected instances. Protected methods can be accessed by the current class and its subclasses.

**`__`**: {Function} The private key. This is used to get and set private instance properties. Private instances can only be accessed by the current class. (See [Private Parts](https://github.com/philipwalton/private-parts#the-key-function) for more information on key functions.)

**`__private`**: {Object} The private prototype. Use this object to store private methods that are shared by all private instances. Private methods can only be accessed by the current class.

### The Returned Constructor

The returned constructor is just a normal JavaScript constructor, but it has five convience methods mixed in.

#### `Constructor.subclass([name], definition)`

Once you have a constructor that was made using Mozart's constructor factory, you can easily subclass it. Subclassing returns a new constructor whose prototype has the parent constructor's prototype in it's chain. Subclassing also sets up the prototype chain for the protected methods, allowing you to invoke super.

#### `Constructor.addGetters(prop1, [prop2], [...propN])

Dynamically create getter methods on the constructor prototype for the given properties. Getter methods appear in the form of `getPropertyName()` for property `propertyName`.

#### `Constructor.addSetters(prop1, [prop2], [...propN])

Dynamically create setter methods on the constructor prototype for the given properties. Setter methods appear in the form of `setPropertyName(value)` for property `propertyName`.

#### `Constructor.addAccessors(prop1, [prop2], [...propN])

Dynamically create both getter and setter methods on the constructor prototype for the given properties.

#### `Constructor.final()`

Calling `final` on a Mozart constructor prevents it from being subclassed. This can be important if you need to ensure that your protected methods are truly protected. Since all classes in a hierarchy share the same protected key, a malicious user could subclass one of your constructors and expose the key publicly.

If this is a concern, make sure to call `final()` on all classes once they no longer needs to be subclassed.

## Building and Testing

Mozart uses jshint to lint the code and tape to test it:

```sh
# lint the code
make lint

# test it
make test

# lint and test
make
```

