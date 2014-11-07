//つ ◕_◕ ༽つ

var canvas;
var gl;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];
var indexArray = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var sphereRadius = 0.4;
var sparkVelocities;
var sparkPositions;
var startIndex = 0;
var startIndexArrayLength = 0;

var gravity = 0.003;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function makeSphere(r, bands, cx, cy, cz) {
	var initIndex = index;
    for (var latNumber = 0; latNumber <= bands; latNumber++) {
		var theta = latNumber * Math.PI / bands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= bands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / bands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			
			// normalsArray.push(cx + x);
			// normalsArray.push(cy + y);
			// normalsArray.push(cz + z);
			normalsArray.push(vec4(
							  cx + x,
			                  cy + y,
			                  cz + z, 1.0));
			pointsArray.push(vec4(
							 cx - r * x,
							 cy - r * y,
		                     cz - r * z, 1.0));
			index += 1;
		}
		
	}
	
    for (var latNumber = 0; latNumber < bands; latNumber++) {
		for (var longNumber = 0; longNumber < bands; longNumber++) {
			var first = (latNumber * (bands + 1)) + longNumber + initIndex;
			var second = first + bands + 1;
			indexArray.push(first);
			indexArray.push(second);
			indexArray.push(first + 1);

			indexArray.push(second);
			indexArray.push(second + 1);
			indexArray.push(first + 1);
		}
    }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
	
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
	sparkVelocities = [];
	sparkPositions = [];
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    makeSphere(sphereRadius, 4, 0, 0, 0);
	startIndex = index;
	startIndexArrayLength = indexArray.length;
	//tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

	var iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexArray), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
	
	document.getElementById("btnFirework").onclick = function(){
		normalsArray = normalsArray.slice(0, startIndex);
		index = normalsArray.length;
		pointsArray = pointsArray.slice(0, startIndex);
		indexArray = indexArray.slice(0, startIndexArrayLength);
		sparkPositions = [];
		sparkVelocities = [];
        for (var i = 0; i < 8; i++) {
			makeSphere(0.3, 4, 0, 0, 0);
			var v = 0.1;
			var xx = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var yy = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var zz = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			sparkPositions.push(vec3(0, 0, 0));
			sparkVelocities.push(vec3(xx, yy, zz));
			
			gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexArray), gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
		}
    };
	
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		
	var looking = lookAt(eye, at , up);
	modelViewMatrix = looking;
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.drawElements(gl.TRIANGLES, startIndexArrayLength, gl.UNSIGNED_BYTE, 0);
	for (var i = 0; i < sparkVelocities.length; i++) {
		var v = sparkVelocities[i];
		var p = sparkPositions[i];
		var xx = p[0] + v[0];
		var yy = p[1] + v[1];
		var zz = p[2] + v[2];
		sparkVelocities[i][1] -= gravity;
		sparkPositions[i] = vec3(xx, yy, zz);
		var t = mat4 (1.0, 0.0, 0.0, xx,
				   0.0, 1.0, 0.0, yy,
				   0.0, 0.0, 1.0, zz,
				   0.0, 0.0, 0.0, 1.0);
		modelViewMatrix = mult(looking, t);
	
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
		gl.drawElements(gl.TRIANGLES, startIndexArrayLength, gl.UNSIGNED_BYTE, startIndexArrayLength + (startIndexArrayLength * i) );
	}
    window.requestAnimFrame(render);
}
