// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position; // attribute variable
  attribute vec4 a_Color;
  attribute float a_PointSize;
  varying vec4 color;
  void main () {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
    color = a_Color;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float ; // This is required
  varying vec4 color;
  void main() {
    gl_FragColor = color; // Set the point color
  }
  `;

// Global Variables
var nGridx; // 2nGridx is the number of divisions along the x-direction
var nGridy; // 2nGridy is the number of divsions along the y-direction
var gCanvas;// canvas of the drawing area
var gl; 
var a_Position; // attribute
var a_PointSize; // attribute
var a_Color; // attribute

function main() {
  // Retrieve <canvas> element
  gCanvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = getWebGLContext(gCanvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Colors
  const red= new Float32Array([1.0, 0.0, 0.0, 1.0]);
  const green= new Float32Array([0.0, 1.0, 0.0, 1.0]);
  const blue= new Float32Array([0.0, 0.0, 1.0, 1.0]);
  const yellow= new Float32Array([1.0, 1.0, 0.0, 1.0]);
  const purple= new Float32Array([1.0, 0.0, 1.0, 1.0]);
  const cyan= new Float32Array([0.0, 1.0, 1.0, 1.0]);

  //
  nGridx= 10;
  nGridy = 15;
  // Draw the grid
  drawGrid(3, blue);
  // Draw a point
  let p1 = new Point (0, 0, 5, red ) ;
  let p2 = new Point (5, 4, 15, green ) ;
  let p3 = new Point (-4, -3, 10, purple ) ;
  let p4 = new Point (-4, 2, 25, blue ) ;
  let p5 = new Point (4, -5, 20, cyan ) ;
  //console.log(p2.canvasToGl(300, 300));
  p1.draw();
  p2.draw();
  p3.draw();
  p4.draw();
  p5.draw();
  /*let s1 = new Point(-nGridx, 0, 15, red);
  let e1 = new Point(nGridx, 0, 15, red);
  let line = new Line(s1, e1);
  line.draw();
  let s2 = new Point ( 0 , -nGridy , 5 , blue ) ;
  let e2 = new Point ( 0 , nGridy , 5 , blue ) ;
  line = new Line ( s2 , e2 ) ;
  line.draw ( ) ;*/
  let s1 = new Point (-nGridx , 0 , 30 , red ) ;
  let e1 = new Point ( nGridx , 0 , 20 , blue ) ;
  let line = new Line ( s1 , e1 ) ;
  line.draw ( ) ;
  let s2 = new Point ( 0 , -nGridy , 25 , green ) ;
  let e2 = new Point ( 0 , nGridy , 5 , purple ) ;
  line = new Line ( s2 , e2 ) ;
  line.draw ( ) ;

  /*s2 = new Point ( 3 , -nGridy , 25 , green ) ;
  e2 = new Point ( 3 , nGridy , 5 , purple ) ;
  line = new Line ( s2 , e2, 20, yellow ) ;
  line.draw ( ) ;*/
  

  // Drawing the red point at the end. (center of the grid)
  let p6 = new Point (0, 0, 20, red ) ;
  p6.draw();
}

// Class Point constructor
function Point(x, y, ps = 1.0, c = new Float32Array([1.0, 1.0, 1.0, 1.0]), w = 400, h = 400) {
  // Methods
  this.gridToCanvas = function(xx, yy){
    xx = w/2 + xx * (w / (2 * nGridx));
    yy = h/2 - yy * (h / (2 * nGridy));
    return new Float32Array([xx, yy]);
  }
  this.canvasToGrid = function(xx, yy){
    xx = xx * nGridx / (w/2) - nGridx;
    yy= (h -yy) * nGridy / (h/2) - nGridy;
    return new Float32Array([xx, yy]);
  }
  this.canvasToGl = function(xx, yy){
    xx = (2 / w) * xx - 1;
    yy = (2 / h) * (h - yy) - 1;
    return new Float32Array([xx, yy]);
  }
  this.glToCanvas = function(xx, yy){
    xx = ((xx + 1) * w) / 2;
    yy = h - ((yy + 1) * h) / 2;
    return new Float32Array([xx, yy]); 
  }
  this.glToGrid = function(xx, yy){
    xx = xx * nGridx;
    yy = yy * nGridy;
    return new Float32Array([xx, yy]); 
  }
  this.gridToGl = function(xx, yy){
    xx = xx / nGridx;
    yy = yy / nGridy;
    return new Float32Array([xx, yy]); 
  }

  // Position
  this.vertices = this.gridToGl(x, y);
  //this.vertices = new Float32Array(2); // a point has x and y coordinates
  //this.vertices[0] = x;
  //this.vertices[1] = y;
  this.vertexBuffer = initArrayBufferForLaterUse(this.vertices, 2, gl.FLOAT);
  if (this.vertexBuffer == null) {
    console.log("Failed to create vertexBuffer");
    return -1;
  }
  this.num = this.vertices.length / 2;
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // PointSize
  /*
  this.ps = new Float32Array(1);
  this.ps[0] = ps;
  this.pointSizeBuffer = initArrayBufferForLaterUse(this.ps, 1, gl.FLOAT);
  if (this.pointSizeBuffer == null) {
    console.log("Failed to create pointSizeBuffer");
    return -1;
  }
  a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if (a_PointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize');
    return -1;
  }
  */
  a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  this.ps = ps;

  // Color
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  this.c = c;
  this.w = w;
  this.h = h;

  
}
Point.prototype = {
  draw: function () {
    // Position
    initAttributeVariable(a_Position, this.vertexBuffer);

    // PointSize
    // initAttributeVariable(a_PointSize, this.pointSizeBuffer);
    gl.vertexAttrib1f(a_PointSize, this.ps);

    // Color
    gl.vertexAttrib4fv(a_Color, this.c);

    gl.drawArrays(gl.POINTS, 0, this.num);
  }
}

// Class Line constructor
function Line(s, e, lw , c) {
  this.s = s;
  this.e = e;
  this.lw = lw;
  this.c = c;
 
  ep = 2/Math.max(this.s.h,this.s.w);
  //if(Math.min(this.s.ps, this.e.ps)>1)
    //ep += ep * (Math.min(this.s.ps, this.e.ps)/2);
  dx = Math.abs(this.s.vertices[0] - this.e.vertices[0]);
  dy = Math.abs(this.s.vertices[1] - this.e.vertices[1]);
  this.nOfSteps = Math.max(dx, dy) / ep;

  this.x = [];
  this.y = [];
  // x
  if (s.vertices[0] <= e.vertices[0])
    for (let i = 0; i < this.nOfSteps; i++)
      this.x.push(s.vertices[0] + (i * ep) * Math.sign(dx));
  else
    for (let i = 0; i < this.nOfSteps; i++)
      this.x.push(s.vertices[0] - i * ep);

  // y  
  if (s.vertices[1] <= e.vertices[1])
    for (let i = 0; i < this.nOfSteps; i++)
      this.y.push(s.vertices[1] + (i * ep) * Math.sign(dy));
  else
    for (let i = 0; i < this.nOfSteps; i++)
      this.y.push(s.vertices[1] - i * ep);

  
  
  this.ps = [];
  this.r = [];
  this.g = [];
  this.b = [];

  this.interpolate = function(lw = this.lw, c = this.c){
      // Point Size
    if (lw == null){
      dp = Math.abs(s.ps - e.ps);
      pStepSize = dp / this.nOfSteps;
      if (s.ps <= e.ps)
        for (let i = 0; i < this.nOfSteps; i++)
          this.ps.push(s.ps + i * pStepSize);
      else
        for (let i = 0; i < this.nOfSteps; i++)
          this.ps.push(s.ps - i * pStepSize);
    }
    else
    for (let i = 0; i < this.nOfSteps; i++)
      this.ps.push(lw);
    
    
    if (c==null){
      // Red Color
      dr = Math.abs(s.c[0] - e.c[0]);
      cStepSize = dr / this.nOfSteps;
      if (s.c[0] <= e.c[0])
        for (let i = 0; i < this.nOfSteps; i++)
          this.r.push(s.c[0] + i * cStepSize);
      else
        for (let i = 0; i < this.nOfSteps; i++)
          this.r.push(s.c[0] - i * cStepSize);

      // Green Color
      dg = Math.abs(s.c[1] - e.c[1]);
      cStepSize = dg / this.nOfSteps;
      if (s.c[1] <= e.c[1])
        for (let i = 0; i < this.nOfSteps; i++)
          this.g.push(s.c[1] + i * cStepSize);
      else
        for (let i = 0; i < this.nOfSteps; i++)
          this.g.push(s.c[1] - i * cStepSize);

      // Blue Color
      db = Math.abs(s.c[2] - e.c[2]);
      cStepSize = db / this.nOfSteps;
      if (s.c[2] <= e.c[2])
        for (let i = 0; i < this.nOfSteps; i++)
          this.b.push(s.c[2] + i * cStepSize);
      else
        for (let i = 0; i < this.nOfSteps; i++)
          this.b.push(s.c[2] - i * cStepSize);
    }
    else{
      for (let i = 0; i < this.nOfSteps; i++){
          this.r.push(c[0]);
          this.g.push(c[1]);
          this.b.push(c[2]);
      }
    }
  }
  this.interpolate();
  
}
Line.prototype = {
  draw: function () {
    for(let i=0; i<this.nOfSteps; i++){
      v = this.s.glToGrid(this.x[i], this.y[i]);
      let p = new Point(v[0], v[1], this.ps[i], new Float32Array([this.r[i], this.g[i], this.b[i], 1]));
      p.draw();
    }
    

  }
}

function drawGrid(ps, c) {
  for(let i=0; i<2*nGridx; i++){
    let s1 = new Point (i-nGridx , nGridy , ps , c ) ;
    let e1 = new Point ( i-nGridx , -nGridy , ps , c ) ;
    let line = new Line ( s1 , e1 ) ;
    line.draw();
  }
  for(let i=0; i<2*nGridy; i++){
    let s1 = new Point (-nGridx , i-nGridy , ps , c ) ;
    let e1 = new Point ( nGridx , i-nGridy , ps , c ) ;
    let line = new Line ( s1 , e1 ) ;
    line.draw();
  }
}

// initialize gl buffer
function initArrayBufferForLaterUse(data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Store the necessary information to assign the object
  // to the attribute variable later
  buffer.num = num;
  buffer.type = type;
  return buffer;
}

// initialize attribute variable
function initAttributeVariable(a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}
