var lvl = require('levelup');

var dbPath = process.argv.slice().pop();

lvl(dbPath, function(err, db) {
    if (err) {
        console.log('syntax: node listDb <dbPath>');
        return console.error(err);
    }

    var sepRgx = /ÿ/g;

    db.createReadStream()
        .on('data', function(o) {
            console.log(
                o.key.replace(sepRgx, '|'),
                '->',
                o.value.length > 60 ? o.value.substring(0, 60)+'...' : o.value
            );
        })
        .on('end', function() { console.log('DONE'); });
    return; // TRAVERSE
});
