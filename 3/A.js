// MultiJointModel_segment.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
  }`;

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }`;

var gl, canvas, a_Position, a_Color, u_MvpMatrix;
var viewProjMatrix = new Matrix4(), g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();
function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Colors
  const red= new Float32Array([1.0, 0.0, 0.0, 1.0]);
  const green= new Float32Array([0.0, 1.0, 0.0, 1.0]);
  const blue= new Float32Array([0.0, 0.0, 1.0, 1.0]);
  const yellow= new Float32Array([1.0, 1.0, 0.0, 1.0]);
  const purple= new Float32Array([1.0, 0.0, 1.0, 1.0]);
  const cyan= new Float32Array([0.0, 1.0, 1.0, 1.0]);

  

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (a_Position < 0 || !u_MvpMatrix ) {
    console.log('Failed to get the storage location of attribute or uniform variable');
    return;
  }

  // Calculate the view projection matrix
  viewProjMatrix.setPerspective(30.0, 1, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0, 20.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var vertices1 = new Float32Array([ 
    0, 0, -1,  2, 0, -1,  0, 0, 1,  2, 0, 1
  ]);
  let s1 = new Square(vertices1, blue);
  let s2 = new Square(vertices1, red);
  let s3 = new Square(vertices1, cyan);
  let s4 = new Square(vertices1, yellow);
  g_modelMatrix.setTranslate(0, 0, 0);
  s1.draw();
  
  canvas.onmousemove = function(ev) { moved(ev, s2); };
  /*g_modelMatrix.translate(2,0,0);
  g_modelMatrix.rotate(90, 0, 0, 1);
  s3.draw();
  g_modelMatrix.translate(2,0,0);
  g_modelMatrix.rotate(90, 0, 0, 1);
  s4.draw();*/
}

function moved(ev , s) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  if (-0.5<=x && x<=0.5){
    let r = (x+0.5)*90;
    draw(r);
  }
  
  
}

function Square(vertices, c){
  
  
  var colors = new Float32Array([ 
    c[0],c[1],c[2], c[0],c[1],c[2], c[0],c[1],c[2], c[0],c[1],c[2] 
  ]);
  var indices = new Uint8Array([
    0, 1, 2,   1, 2, 3
  ]);
  
  this.modelMatrix = new Matrix4();

  this.verticesBuffer = initArrayBufferForLaterUse(vertices, 3, gl.FLOAT);

  
  this.colorsBuffer = initArrayBufferForLaterUse(colors, 3, gl.FLOAT);
  
  if (!this.verticesBuffer || !this.colorsBuffer) return -1;

  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

Square.prototype = {
  setModelMatrix: function(m){
    this.modelMatrix.set(m);
  }

  ,draw: function () {
    initAttribute(a_Position, this.verticesBuffer);
    initAttribute(a_Color, this.colorsBuffer);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(this.modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    // Draw
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
  }
}

function draw(r){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Colors
    const red= new Float32Array([1.0, 0.0, 0.0, 1.0]);
    const green= new Float32Array([0.0, 1.0, 0.0, 1.0]);
    const blue= new Float32Array([0.0, 0.0, 1.0, 1.0]);
    const yellow= new Float32Array([1.0, 1.0, 0.0, 1.0]);
    const purple= new Float32Array([1.0, 0.0, 1.0, 1.0]);
    const cyan= new Float32Array([0.0, 1.0, 1.0, 1.0]);

    var vertices1 = new Float32Array([ 
      0, 0, -1,  2, 0, -1,  0, 0, 1,  2, 0, 1
    ]);

    let s1 = new Square(vertices1, blue);
    let s2 = new Square(vertices1, green);
    let s3 = new Square(vertices1, purple);
    let s4 = new Square(vertices1, red);
    let s5 = new Square(vertices1, cyan);
    let s6 = new Square(vertices1, yellow);
    
    g_modelMatrix.setTranslate(0, 0, 0);
    s1.setModelMatrix(g_modelMatrix);
    s1.draw();

    g_modelMatrix.setTranslate(0, 0, -1);
    g_modelMatrix.rotate(r, 1, 0, 0);
    g_modelMatrix.translate(0, 0, -1);
    s2.setModelMatrix(g_modelMatrix);
    s2.draw();

    g_modelMatrix.setTranslate(0, 0, 1);
    g_modelMatrix.rotate(-r, 1, 0, 0);
    g_modelMatrix.translate(0, 0, 1);
    s3.setModelMatrix(g_modelMatrix);
    s3.draw();
    
    g_modelMatrix.setTranslate(2,0,0);
    g_modelMatrix.rotate(r, 0, 0, 1);
    s4.setModelMatrix(g_modelMatrix);
    s4.draw();

    g_modelMatrix.translate(2,0,0);
    g_modelMatrix.rotate(r, 0, 0, 1);
    s5.setModelMatrix(g_modelMatrix);
    s5.draw();

    g_modelMatrix.translate(2,0,0);
    g_modelMatrix.rotate(r, 0, 0, 1);
    s6.setModelMatrix(g_modelMatrix);
    s6.draw();

    /*
    g_modelMatrix.setTranslate(0, 0, 0);
    s1.setModelMatrix(g_modelMatrix);
    s1.draw();

    g_modelMatrix.setTranslate(2, 0, 0);
    g_modelMatrix.rotate(r, 0, 0, 1);
    s2.setModelMatrix(g_modelMatrix);
    s2.draw();
    
    g_modelMatrix.setRotate(-r, 0, 0, 1);
    g_modelMatrix.translate(-2, 0, 0);
    s3.setModelMatrix(g_modelMatrix);
    s3.draw();
    
    g_modelMatrix.setTranslate(0,0,1);
    g_modelMatrix.rotate(-r, 1, 0, 0);
    g_modelMatrix.translate(0, 0, 1);
    s4.setModelMatrix(g_modelMatrix);
    s4.draw();
    
    g_modelMatrix.translate(0,0,1);
    g_modelMatrix.rotate(-r, 1, 0, 0);
    g_modelMatrix.translate(0, 0, 1);
    s5.setModelMatrix(g_modelMatrix);
    s5.draw();
    
    g_modelMatrix.translate(0,0,1);
    g_modelMatrix.rotate(-r, 1, 0, 0);
    g_modelMatrix.translate(0, 0, 1);
    s6.setModelMatrix(g_modelMatrix);
    s6.draw();
    */
}
/*function initArrayBuffer(attribute, data, num, type){
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return true;
}*/

function initArrayBufferForLaterUse(data, num, type){
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initAttribute(a_Attribute, buffer){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(a_Attribute, buffer.num, buffer.type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_Attribute);
}