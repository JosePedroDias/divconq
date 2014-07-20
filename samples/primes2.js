'use strict';



var fetch = function(fn) {
    return fn.toString()
        .replace(/^[^\/]+\/\*!?/, '')
        .replace(/\*\/[^\/]+$/,   '');
};


var divideFn = function() {/*
    var M, m = cfg.min;
    var cfgs = [];
    while (1) {
        M = m + cfg.each - 1;
        if (M >= cfg.max) {
            M = cfg.max;
        }
        cfgs.push({min:m, max:M});
        if (M === cfg.max) {
            break;
        }
        m = M + 1;
    }

    return cfgs;
*/};

var worker = function() {/*

var onMessage = function(o) {

    var isPrime = function(n) {
        if (n % 1 || n < 2) { return false; }
        if (n % 2 === 0) { return n === 2; }
        if (n % 3 === 0) { return n === 3; }
        var m = Math.sqrt(n);
        for (var i = 5; i <= m; i += 6) {
            if ( (n % i === 0) || (n % (i + 2) === 0) ) { return false; }
        }
        return true;
    };
    
    var primes = [];
    for (var n = o.min; n <= o.max; ++n) {
        if (isPrime(n)) {
            primes.push(n);
        }
    }

    done({
        primes: primes
    });
};
*/};

var conquerFn = function() {/*
    var primes = [];
    results.forEach(function(result) {
        primes = primes.concat(result.primes);
    });
    return JSON.stringify(primes);
*/};

var cfg = function() {/*
{
    min:  110000,
    max:  116000,
    each:   1000
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
