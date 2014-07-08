/*

PRODUCER                                                         SERVER

producer submits script functions 
                                       -->       new jobKind created with the code
producer submits config data 
                                       -->       new job is created, it's id returned
...

producer checks state of job
                                       -->      



----------------------------


PARTS

cfg -> divideWork
addWorker
worker
conquer


CLIENT                    SERVER

divconq.js
               ->       select one job from pending jobs
                        select on index from pending ids in job
                        generate js for job with job code. include index
                        update job index state from unprocessed to processing
               <-
create webworker
let it process
return result back

*/



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
    one:  loadFile('tplClientOne.js'),
    core: loadFile('divconqClientCore.js')
};



var srv = http.createServer(function(req, res) {

    var parts = req.url.split('/');
    parts.shift();
    //console.log( parts );

    if (parts[0] === 'favicon.ico') {
        res.writeHead(404);
        return res.end();
    }

    var workKind = 'fractal'; // TODO elect pending jobs, workKind and id

    try {
        var divConqCore   = files.core;
        var tpl           = files.one;
        var wkWorker      = loadFile(workKind + 'Worker.js');
        var wkCfg         = loadFile(workKind + 'Cfg.js');
        var wkDivideWork  = loadFile(workKind + 'DivideWork.js');
        var wkAddWorker   = loadFile(workKind + 'AddWorker.js');
        var wkConquerWork = loadFile(workKind + 'ConquerWork.js');
        
        if (parts[0] === 'ask') {

            // TODO if new job, divide it and save parts
            if (1) {
                var sandbox = {};
                vm.runInNewContext(
                    [
                        'var cfg = ', wkCfg, ';',
                        wkDivideWork, ';',
                        'var cfg2 = divideWork(cfg);'
                    ].join(''),
                    sandbox
                );
                var cfg2 = sandbox.cfg2;

                cfg2.answerTo = [domain, 'answer'].join('/');
            }
            else {
                // TODO else, fetch path
            }

            // TODO update jobs state

            var body = expandTemplate(tpl, {
                DIVCONQ_CORE: divConqCore,
                WORKER:       wkWorker,
                CFG:          JSON.stringify(cfg2),
                ADD_WORKER:   wkAddWorker
            });
        }
        else if (parts[0] === 'answer') {
            var parts = [];
            req.on('data', function(data) {
                parts.push(data);
            });
            req.on('end', function() {
                var d = parts.join('');
                //var o = JSON.parse(d);
                console.log('received ' + d.length + ' bytes');

                // TODO save result

                if (1) { // if all results came, conquer
                    vm.runInNewContext(
                        [wkConquerWork, ';conquerWork(', wkCfg, ', [', d,']);'].join(''),
                        {console:console, fs:fs, Canvas:Canvas, Image:Canvas.Image}
                    );   
                    // update job state to finished 
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

        res.writeHead(
            200,
            {
                'Content-Type':   'text/javascript; charset=utf-8',
                'Content-Length': body.length
            }
        );
        return res.end(body);

    } catch (ex) {
        res.writeHead(404);
        return res.end(ex.toString());
        //res.end(ex.toString()); throw ex;
    }

    res.writeHead(404);
    return res.end('?');
});

srv.listen(PORT);

console.log('running on ' + domain + ' ...');
