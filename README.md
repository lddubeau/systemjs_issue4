### Versions

I get the problem with versions 0.20.0 to 0.20.11.

I was not able to reproduce it with any version in the 0.19 series.

### Symptoms

I get a big fat exception:

```
Error: Cannot read property '0' of undefined
```

Which points to [this](https://github.com/systemjs/systemjs/blob/0.20.10/dist/system.src.js#L1029). It is the `var depLoad = dependencyInstantiations[i];` line in the following code:

```
function makeDynamicRequire (loader, key, dependencies, dependencyInstantiations, registry, state, seen) {
  // we can only require from already-known dependencies
  return function (name) {
    for (var i = 0; i < dependencies.length; i++) {
      if (dependencies[i] === name) {
        var depLoad = dependencyInstantiations[i];
        var module;

        if (depLoad instanceof ModuleNamespace)
          module = depLoad;
```

When I add tracing to the console, I find that `makeDynamicRequire` is sometimes called with a `dependencies` array which has a length > 0 but with `dependencyInstantiations` that is undefined.

### How to reproduce the problem

Clone https://github.com/lddubeau/systemjs_issue3

1. ``npm install``.

2. Start the server ``./server.js localhost:[some port number]``. **It
is important that you use THIS SERVER. The problem here is a race
condition, and the server purposely delays responding to the request
for one module so as to recreate the conditions necessary for the
problem to occur.**

3. Direct your browser to load ``http://localhost:[same port number]/index.html``.

If you are lucky, you'll immediately get:

```
Uncaught (in promise) Error: Cannot read property '0' of undefined
  Loading x
    at register-loader.js:532
    at doEvaluate (register-loader.js:607)
    at ensureEvaluate (register-loader.js:518)
    at register-loader.js:538
    at doEvaluate (register-loader.js:607)
    at ensureEvaluate (register-loader.js:518)
    at register-loader.js:538
    at doEvaluate (register-loader.js:607)
    at ensureEvaluate (register-loader.js:518)
    at register-loader.js:538
```

If you are unlucky, you may need to reload until you get the error, or
it might require that you play with the timeout that is set in
index.html.

When I try it here I get the error nearly 100% of the time.
