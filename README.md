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

### 1. defining kind (recipe)

* client submits divide function
* client submits worker code
* client submits conquer function
* a kind is defined


### 2. job is submitted (recipe applied to given problem)

* client submits a cfg (problem)
* a job is defined
* system runs the divide function, generating a set of sub-problems treatable by webworkers (parts)


### 3. work processing

* each contributer site hosting a divconq script is a potential worker
* if there are active jobs, fetches random cfg for webworker resolution. serves page will all this.
* webworker is instanced, runs the part and returns an answer
* once all answers are available in the system, the system runs the conquer function
* system notifies the client with the result



## todo

* store states (ONGOING)
* generic worker examples with and without canvas
* support for instancing an iframe instead of webworker
