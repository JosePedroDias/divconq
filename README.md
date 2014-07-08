# divconq



## vision

Distributed cluster of webworkers.

Somewhat inspired in crowdprocess but fills in the gaps - instead
of sending the payloads, you send the problem and divide and conquer functions
(fancy name for map reduce)

This model is viable for [embarrassingly parallel](http://en.wikipedia.org/wiki/Embarrassingly_parallel) problems.
Besides, the input and output of the payloads should be somewhat small (CPU-bound problem).


## interesting applications

* graphics rendering (global illumination, raytrace...)
* face detection
* procedural textures (perlin noice)
* search, genetics


## process

### defining workKind

* client submits worker code
* client submits divide function
* client submits a conquer function
* a workKind is defined


### work is submitted

* client submits a problem (cfg)
* a work is defined
* system runs the divide function, generating a set of sub-problems treatable by webworkers (payloads)


### work processing

* each contributer site hosting a divconq script is a potential worker
* if an unfinished work exists, a payload and worker code is sent to the contributer
* webworker is instanced, runs the payload and returns a workUnit
* once all workUnits are available in the system, the system runs the conquer function
* system notifies the client with the work result



## done / todo

* __DONE__ fractal problem solved locally with webworkers in parallel
* __DONE__ fractal problem split into the conceptual parts (conquer pending)

* fractal solved in different remote webworkers
* fractal 
* kpis for start of workUnit?!
* generic worker examples with and without canvas



## maybe...

generalize the concept into node-spawned webworker thingies too (is it viable?)



## working:

`GET /<workKind>/<tplKind>`

`/fractal/all`

`/fractal/one`
