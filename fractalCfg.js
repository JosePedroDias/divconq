{
    useCanvas:   'image/jpeg',   // if set, instantiates a hidden canvas and returns its imageData as id key. uses compression defined as value (image/jpeg or image/png)
    d:           [256*3, 256*2], // image size in px
    tl:          {r:-2, i: 1},   // top left fractal pos
    br:          {r: 1, i:-1},   // bottom right fractal pos
    iter:        240,            // maximum iteration steps
    parts:       [2, 2]          // divide work into w x h parts
}
