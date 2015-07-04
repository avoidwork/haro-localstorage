# haro-localStorage

[![build status](https://secure.travis-ci.org/avoidwork/haro-localStorage.svg)](http://travis-ci.org/avoidwork/haro-localStorage)

[Harō](http://haro.rocks) is a modern immutable DataStore built with ES6 features, which can be wired to an API for a 
complete feedback loop. It is un-opinionated, and offers a plug'n'play solution to modeling, searching, & managing data 
on the client, or server (in RAM). It is a [partially persistent data structure](https://en.wikipedia.org/wiki/Persistent_data_structure), by maintaining version sets of records in `versions` ([MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)).

***haro-localStorage*** is a persistent storage adapter, providing 'auto saving' behavior, as well as the ability to 
`save()` & `load()` the entire DataStore.

### How to use
Require the adapter & register it with `haro.register(key, fn)`. The key must match the `store.adapters` key. The prefix 
will be used as `prefix_` for the `localStorage` items. Records will be have keys as `prefix_storeId_key`, while 
DataStores will have `prefix_storeId`.

```javascript
var haro = require('haro'),
    store;

// Register the adapter
haro.register('local', require('haro-localStorage'));

// Configure a store to utilize the adapter
store = haro(null, {
  adapters: {
    local: "prefix"
  }
});
```

## License
Copyright (c) 2015 Jason Mulligan
Licensed under the BSD-3 license
