'use strict';



var fetch = function(fn) {
    return fn.toString()
        .replace(/^[^\/]+\/\*!?/, '')
        .replace(/\*\/[^\/]+$/,   '');
};


var divideFn = function() {/*
    var l = cfg.max - cfg.min + 1;
    var n = cfg.min;
    var cfgs = new Array(l);

    for (var i = 0; i < l; ++i) {
        cfgs[i] = {i:i, n:n++};
    }
*/};

var worker = function() {/*
// example based on https://gist.github.com/joaojeronimo/7930840#file-run-js

var onMessage = function(o) {
    var number = o.n;
    
    var isPrime = true; // assume it's prime, we'll try to disprove

    var i = number; // we'll iterate through all the numbers before it
    while (--i) {
        // every number is divisible by itself and one, we don't want to divide it by zero
        if (i === 0 || i === 1 || i === number)
            continue; // continue actually means skip the rest of this iteration and keep looping

        // if it's divisible by any other number
        if (!(number % i))
            isPrime = false; // then it's not a prime number
    }

    done(isPrime ? number : null);
};
*/};

var conquerFn = function() {/*
    return cfg.filter(function(o) {
        return (o.n !== null);
    });
*/};

var cfg = function() {/*
{
    min: 295075130,
    max: 295075152
}
*/};

var kind = {
    divideFn:  fetch(divideFn),
    worker:    fetch(worker),
    conquerFn: fetch(conquerFn)
};

cfg = fetch(cfg);

module.exports = {
    kind: kind,
    cfg:  cfg
};
