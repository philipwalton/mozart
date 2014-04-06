mods := ./node_modules
bins := ./node_modules/.bin
src := index.js lib/*.js
test := test/*.js

all: install lint test

install:
	@ npm install

lint: $(src) $(test)
	@ $(bins)/jshint --verbose $^

test: $(test)
	@ node --harmony $(bins)/tape $^

.PHONY: all install test lint
