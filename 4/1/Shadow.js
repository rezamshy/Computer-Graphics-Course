// PointLightedCube.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_VpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_VpMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = a_Color;\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
   // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
   '  vec3 normal = normalize(v_Normal);\n' +
   // Calculate world coordinate of vertex
   // Calculate the light direction and make it 1.0 in length
'  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
   // The dot product of the light direction and the normal
'  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
   // Calculate the color due to diffuse reflection
'  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
   // Calculate the color due to ambient reflection
'  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +

  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
  '}\n';

var gl, canvas, a_Position, a_Color, a_Normal, u_ModelMatrix, u_VpMatrix, u_NormalMatrix, lightPosition;
var g_modelMatrix, g_normalMatrix, g_vpMatrix;

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas, {stencil:true});
  gl = canvas.getContext("webgl", {stencil:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // create a plane
  var planeVertices = new Float32Array ( [
    20.0 , -3.0 , 20.0 ,
    20.0 , -3.0 , -20.0 ,
    -20.0 , -3.0 , -20.0 ,
    -20.0 , -3.0 , 20.0
    ]) ;
  var planeColors = new Float32Array ( [
  0.3 , 0.8 , 1.0 ,
  0.3 , 0.8 , 1.0 ,
  0.3 , 0.8 , 1.0 ,
  0.3 , 0.8 , 1.0
  ] ) ;
  
  // Set the clear color and enable the depth test
  gl.clearColor(1, 1, 1, 1);
  //gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_VpMatrix = gl.getUniformLocation(gl.program, 'u_VpMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_VpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  lightPosition = new Float32Array ( [10 , 10 , 15.5] ) ;
  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1, 1, 1);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, lightPosition[0], lightPosition[1], lightPosition[2]);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.5, 0.3, 0.3);

  g_modelMatrix = new Matrix4();  // Model matrix
  g_vpMatrix = new Matrix4(); 　 // Model view projection matrix
  g_normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the view projection matrix
  g_vpMatrix.setPerspective(45, canvas.width/canvas.height, 1, 100);
  g_vpMatrix.lookAt(8, 15, 20, 1, 0, -1, 0, 1, 0);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_VpMatrix, false, g_vpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
   
  groundPlane = new Plane ( planeVertices , planeColors ) ; // create the ground plane
}

function Plane(vertices, colors){
  //v3- -v2
  //|
  //e2
  //|
  //v0-e1-v1
  this.vertices = vertices;
  this.colors = colors;
  e1 = new Float32Array([vertices[3]-vertices[0], vertices[4]-vertices[1], vertices[5]-vertices[2]]);
  e2 = new Float32Array([vertices[9]-vertices[0], vertices[10]-vertices[1], vertices[11]-vertices[2]]);
  normal = new Float32Array([e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]);

  this.normals = new Float32Array([
    normal[0], normal[1], normal[2],
    normal[0], normal[1], normal[2],
    normal[0], normal[1], normal[2],
    normal[0], normal[1], normal[2]
  ]);
  
  this.indices = new Uint8Array([
    0, 1, 2,   0,2,3
  ]);
  
  this.modelMatrix = new Matrix4();

  this.verticesBuffer = initArrayBufferForLaterUse(vertices, 3, gl.FLOAT);
  this.colorsBuffer = initArrayBufferForLaterUse(colors, 3, gl.FLOAT);
  this.normalsBuffer = initArrayBufferForLaterUse(this.normals, 3, gl.FLOAT);
  if (!this.verticesBuffer || !this.colorsBuffer || !this.normalsBuffer) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  this.indexBuffer = gl.createBuffer();
  if (!this.indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}

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