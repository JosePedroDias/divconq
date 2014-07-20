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
    var isPrime = (function(n) {
        if (n % 1 || n < 2) { return false; }
        if (n % 2 === 0) { return n === 2; }
        if (n % 3 === 0) { return n === 3; }
        var m = Math.sqrt(n);
        for (var i = 5; i <= m; i += 6) {
            if ( (n % i === 0) || (n % (i + 2) === 0) ) { return false; }
        }
        return true;
    })(o.n);

    done({
        n:       o.n,
        isPrime: isPrime
    });
};
*/};

var conquerFn = function() {/*
    var primes = [];
    results.forEach(function(o) {
        if (o.isPrime) {
            primes.push(o.n);
        }
    });
    return JSON.stringify(primes);
*/};

var cfg = function() {/*
{
    min: 295075130,
    max: 295075152
}
*/};

var kind = {
    name:      'primes',
    divideFn:  fetch(divideFn),
    worker:    fetch(worker),
    conquerFn: fetch(conquerFn)
};

cfg = fetch(cfg);

module.exports = {
    kind: kind,
    cfg:  cfg
};
