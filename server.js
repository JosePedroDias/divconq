var fs     = require('fs');
var http   = require('http');
var os     = require('os');
var vm     = require('vm');
var Canvas = require('canvas'); // libgif-dev libjpeg-dev libcairo2-dev
 


var loadFile = function(path) {
    return fs.readFileSync(path).toString();
};

var expandTemplate = function(tplS, modelO) {
    for (var k in modelO) {
        tplS = tplS.replace( new RegExp('({{'+k+'}})', 'g'), modelO[k] );
    }
    return tplS;
};

var getMyIPs = function() {
    var ips = {};
    var ifaces = os.networkInterfaces();
    var onDetails = function(details) {
        if (details.family === 'IPv4') {
            ips[ dev ] = details.address;
        }
    };
    for (var dev in ifaces) {
        ifaces[dev].forEach(onDetails);
    } 
    return ips;
};

var PORT = 4000;

var domain = ['http://', getMyIPs()['lo'], ':', PORT].join('');



var files = {
    tpl:  loadFile('tpl.js'),
    core: loadFile('core.js')
};



var srv = http.createServer(function(req, res) {

    var parts = req.url.split('/');
    parts.shift();

    var op = parts[0];
    //console.log( parts );

    if (op === 'favicon.ico') {
        res.writeHead(404);
        return res.end();
    }

    var workKind = 'fractal'; // TODO elect pending jobs, workKind and id

    try {
        var wkCfg         = loadFile(workKind + 'Cfg.js');
        var wkDivideWork  = loadFile(workKind + 'DivideWork.js');
        var wkWorker      = loadFile(workKind + 'Worker.js');
        var wkConquerWork = loadFile(workKind + 'ConquerWork.js');
        
        if (op === 'ask') {

            // TODO if new job, divide it and save parts
            if (1) {
                var sandbox = {};
                vm.runInNewContext(
                    [
                        'var cfg = ', wkCfg, ';',
                        wkDivideWork, ';',
                        'var cfgs = divideWork(cfg);'
                    ].join(''),
                    sandbox
                );
                var cfgs = sandbox.cfgs;
                //console.log(cfgs);
                var cfg2 = cfgs[0];

                cfg2.answerTo = [domain, 'answer'].join('/');
                cfg2.kpiTo    = [domain, 'kpi'].join('/');
            }
            else {
                // TODO else, fetch path
            }

            // TODO update jobs state

            var body = expandTemplate(files.tpl, {
                CORE:   files.core,
                WORKER: wkWorker,
                CFG:    JSON.stringify(cfg2)
            });

            res.writeHead(200, {
                'Content-Type':   'text/javascript; charset=utf-8',
                'Content-Length': body.length
            });
            return res.end(body);
        }
        else if (op === 'answer') {
            var parts = [];
            req.on('data', function(data) {
                parts.push(data);
            });
            req.on('end', function() {
                var d = parts.join('');
                //var o = JSON.parse(d);
                //console.log('received ' + d.length + ' bytes');

                // TODO save result

                if (1) { // if all results came, conquer
                    vm.runInNewContext(
                        [wkConquerWork, ';conquerWork(', wkCfg, ', [', d,']);'].join(''),
                        {console:console, fs:fs, Canvas:Canvas, Image:Canvas.Image}
                    );   

                    // TODO update job state to finished 
                }
            });
            var body = '{"status":"OK"}';
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type':                'application/json; charset=utf-8',
                'Content-Length':              body.length
            });
            return res.end(body);
        }
        else if (op === 'kpi') {
            console.log('KPI:');
            console.log('  data:      ' + decodeURIComponent(parts[1]) );
            console.log('  userAgent: ' + req.headers['user-agent']);
            console.log('  referer:   ' + req.headers.referer);
            console.log('  host:      ' + req.headers.host);
            console.log('  ip:        ' + req.connection.remoteAddress);
            res.writeHead(200, {
                'Content-Type':   'image/png',
                'Cache-Control':  'no-cache, no-store, must-revalidate',
                'Pragma':         'no-cache',
                'Expires':        '0',
                'Content-Length': '0'
            });
            res.end();

            // TODO save data?
        }
    } catch (ex) {
        throw ex;
        res.writeHead(500);
        return res.end([ex.toString(), ex.stacktrace()].join('\n'));
    }

    res.writeHead(404);
    res.end('unsupported path: "' + req.url + '"');
});

srv.listen(PORT);

console.log('running on ' + domain + ' ...');
