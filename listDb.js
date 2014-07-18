var lvl = require('levelup');
var csl = require('./csl');

var dbPath = process.argv.slice().pop();



var ks = csl.cyan;
var vs = csl.yellow;
var ls = csl.magenta;



var pad = function(s, l) {
    return s + new Array(l - s.length + 1).join(' ');
};



lvl(dbPath, function(err, db) {
    if (err) {
        console.log('syntax: node listDb <dbPath>');
        return console.error(err);
    }

    var sepRgx = /ÿ/g;

    db.createReadStream()
        .on('data', function(o) {
            var l = o.value.length;
            console.log([
                ks[0],
                pad( o.key.replace(sepRgx, '|') , 22),
                ks[1],
                vs[0],
                l > 60 ? [o.value.substring(0, 60), ls[0], '...(', l, ')', ls[1]].join('') : o.value,
                vs[1]
            ].join(''));
        })
        .on('end', function() { console.log('DONE'); });
    return; // TRAVERSE
});
