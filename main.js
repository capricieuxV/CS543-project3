// WebGL globals
let canvas;
let gl;
let program;
var id;
var thetaLoc; // rotation theta
var modelViewMatrix, projectionMatrix, invModelMatrix, transMatrix, rotMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, invModelMatrixLoc, transMatrixLoc, rotMatrixLoc;

var eye = vec3(0, 0, 25);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var dx = 0;
var dy = 0;
var dz = 0;

var ambientOn = true;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var texture;
var minT = 0.0;
var maxT = 1.0;

var texCoord = [
    vec2(minT, minT),
    vec2(minT, maxT),
    vec2(maxT, maxT),
    vec2(maxT, minT)
];

var bunnyVertices, bunnyTex, bunnyNormals, bunny_specular, bunny_diffuse;
var carVertices, carTex, carNormals, car_specular, car_diffuse;
var streetVertices, streetTex, streetNormals, street_specular, street_diffuse;
var stopSignVertices, stopSignTex, stopSignNormals, stopSign_specular, stopSign_diffuse;
var lampVertices, lampTex, lampNormals, lamp_specular, lamp_diffuse;
/**
 * Sets up WebGL and enables the features this program requires.
 */
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj", "OBJ");
    streetVertices = faceVertices;
    // streetNormals = faceNormals;
    // streetTex = faceUVs;
    console.log("street", streetVertices)
    // console.log("street normals", streetNormals)
    // console.log("street texture", streetTex)
    // render();
}

/**
 * render the original file
 */
function render(){
    console.log("rendering current obj");
    modelViewMatrix = lookAt(eye, at, up);
    transMatrix = translate(dx, dy, dz);
    projectionMatrix = perspective(60, 1, 0.01, 100000);

    createATexture();

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.clearColor(1,1,1,1);

    var street = new myOBJ("Street");
    console.log("street vertex: ", street.points)
    var stopSign = new myOBJ("StopSign");
    var lamp = new myOBJ("Lamp");
    var car = new myOBJ("Car");
    var bunny = new myOBJ("Bunny");
    // console.log("bunny vertex:", bunny.points)

    street.displayObj();
    stopSign.displayObj();
    lamp.displayObj();
    car.displayObj();
    bunny.displayObj();
}

function loadBunny() {
    console.log("loading bunny")

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.obj","OBJ");
    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.mtl","MTL")
    bunnyVertices = faceVertices;
    bunnyNormals = faceNormals;
    bunnyTex = faceUVs;

    clearData();
}

function loadCar() {
    console.log("loading car")

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj", "OBJ");
    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl", "MTL");
    carVertices = faceVertices;
    carNormals = faceNormals;
    carTex = faceUVs;

    clearData();
}

function loadStreet() {
    console.log("loading street")

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj", "OBJ");
    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl", "MTL");
    streetVertices = faceVertices;
    streetNormals = faceNormals;
    streetTex = faceUVs;

    clearData();
}

function loadStopSign() {
    console.log("loading stop sign")

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj", "OBJ");
    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl", "MTL");
    stopSignVertices = faceVertices;
    stopSignNormals = faceNormals;
    stopSignTex = faceUVs;

    clearData();
}

function loadLamp() {
    console.log("loading lamp")

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj", "OBJ");
    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl", "MTL");
    lampVertices = faceVertices;
    lampNormals = faceNormals;
    lampTex = faceUVs;

    clearData();
}

function createATexture()
{
    // Initialize a texture
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Fill the texture with a 1x1 blue pixel.
    //Specify the array of the two-dimensional texture elements
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function configureTexture( image ) {
    //Create a texture object
    texture = gl.createTexture();

    //Bind it as the current two-dimensional texture
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    //Link the texture object we create in the application to the sampler in the fragment shader
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function clearData(){
    vertices = [];      // List of vertex definitions from OBJ
    normals = [];       // List of normal definitions from OBJ
    uvs = [];           // List of UV definitions from OBJ
    faceVertices = [];  // Non-indexed final vertex definitions
    faceNormals = [];   // Non-indexed final normal definitions
    faceUVs = [];       // Non-indexed final UV definitions

    faceVerts = []; // Indices into vertices array for this face
    faceNorms = []; // Indices into normal array for this face
    faceTexs = []; // Indices into UVs array for this face

    currMaterial = null;    // Current material in use
    textureURL = null;      // URL of texture file to use

    diffuseMap = new Map();
    specularMap = new Map();
}

/**
 * making the rendering object
 * @param objName
 */

class myOBJ {
    constructor(objName) {
        console.log("construct", objName)
        this.name = objName;
        this.points = [];
        this.normalize = [];
        this.texture = [];
        this.length = 0;

        switch (this.name) {
            case "Bunny":
                loadBunny();
                this.points = bunnyVertices;
                this.normalize = bunnyNormals;
                this.texture = bunnyTex;
                break;
            case "Car":
                loadCar();
                this.points = carVertices;
                this.normalize = carNormals;
                this.texture = carTex;
                break;
            case "Street":
                loadStreet();
                this.points = streetVertices;
                this.normalize = streetNormals;
                this.texture = streetTex;
                break;
            case "StopSign":
                loadStopSign();
                this.points = stopSignVertices;
                this.normalize = stopSignNormals;
                this.texture = stopSignTex;
                break;
            case "Lamp":
                loadLamp();
                this.points = lampVertices;
                this.normalize = lampNormals;
                this.texture = lampTex;
                break;
        }
        console.log("obj", objName)
        console.log(objName, this.points)
        console.log(objName, this.texture)
    }

    displayObj(){
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var vNormal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normalize), gl.STATIC_DRAW);

        var vNormalPosition = gl.getAttribLocation( program, "vNormal");
        gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormalPosition);

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texture), gl.STATIC_DRAW );

        var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(vTexCoord );

        modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
        projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
        transMatrixLoc = gl.getUniformLocation( program, "transMatrix" );

        gl.uniformMatrix4fv(transMatrixLoc, false, flatten(transMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

        gl.drawArrays(gl.TRIANGLES, 0, this.points.length);
    }
}// ender of making object