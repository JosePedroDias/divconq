var cfg = {
  jobId: 123,           // just for reference back to the server
  d:    [256*3, 256*2], // image size in px
  tl:   {r:-2, i: 1},   // top left fractal pos
  br:   {r: 1, i:-1},   // bottom right fractal pos
  iter: 256,            // maximum iteration steps
  parts: [2, 2],        // divide work into 4 2x2 parts
  index: 0              // you're worker 1/4
};
