// RotatedTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

// The rotation angle
var ANGLE = 90.0; 
var angleStep = 45;
var play = false;
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  var u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
  var currentAngle=0;
  canvas.addEventListener("click", onClick, false);
  var tick = function(){
    if(play){
      currentAngle= animate(currentAngle);
    }
    draw(gl, n, currentAngle, u_xformMatrix);
    requestAnimationFrame(tick);
  }
  tick();

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n , currentAngle, u_xformMatrix){
  var radian = Math.PI* currentAngle / 100;
  var cosb= Math.cos(radian);
  var sinb = Math.sin(radian);
  var xformMatrix = new Float32Array([
    cosb, sinb, 0 ,0,
    -sinb, cosb, 0, 0,
    0,0,1,0,
    0,0,0,1
  ]);
  gl.uniformMatrix4fv(u_xformMatrix,false, xformMatrix);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
var g_last=0;
function animate(angle){
  var now= Date.now();
  var elapsed= now - g_last;
  g_last = now;
  var newAngle = angle+ (angleStep*elapsed)/ 1000.0;
  return newAngle%=360;
}

function onClick(){
  play=!play;
  console.log("click");
}