//つ ◕_◕ ༽つ

var canvas;
var gl;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];

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
var sparkLives;
var startIndex = 0;
var startIndexArrayLength = 0;

var gravity = 0.003;

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

var nBuffer;
var vBuffer;

function makeSphere(r, bands, cx, cy, cz) {
	var initIndex = index;
	var norms = [];
	var points = [];
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
			norms.push(vec4(
							  cx + x,
			                  cy + y,
			                  cz + z, 1.0));
			points.push(vec4(
							 cx - r * x,
							 cy - r * y,
		                     cz - r * z, 1.0));
		}
		
	}
    for (var latNumber = 0; latNumber < bands; latNumber++) {
		for (var longNumber = 0; longNumber < bands; longNumber++) {
			var first = (latNumber * (bands + 1)) + longNumber;
			var second = first + bands + 1;
			// indexArray.push(first);
			// indexArray.push(second);
			// indexArray.push(first + 1);

			// indexArray.push(second);
			// indexArray.push(second + 1);
			// indexArray.push(first + 1);
			normalsArray.push(norms[first]);
			normalsArray.push(norms[second]);
			normalsArray.push(norms[first + 1]);
			
			normalsArray.push(norms[second]);
			normalsArray.push(norms[second + 1]);
			normalsArray.push(norms[first + 1]);
			
			pointsArray.push(points[first]);
			pointsArray.push(points[second]);
			pointsArray.push(points[first + 1]);
			
			pointsArray.push(points[second]);
			pointsArray.push(points[second + 1]);
			pointsArray.push(points[first + 1]);
			
			index += 6;
		}
    }
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
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
	sparkLives = [];
	
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

	//tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	makeSphere(sphereRadius, 4, 0, 0, 0);
	startIndex = index;
    
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
		// normalsArray = normalsArray.slice(0, startIndex);
		// index = normalsArray.length;
		// pointsArray = pointsArray.slice(0, startIndex);
		if (sparkPositions.length == 0) {
			makeSphere(0.3, 2, 0, 0, 0);
		}
        for (var i = 0; i < 8; i++) {
			var v = 0.1;
			var xx = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var yy = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var zz = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			sparkPositions.push(vec3(0, 0, 0));
			sparkVelocities.push(vec3(xx, yy, zz));
			sparkLives.push(Math.random()*1.5 + 1);
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
	for( var i=0; i<startIndex; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
	// gl.drawElements(gl.TRIANGLES, startIndexArrayLength, gl.UNSIGNED_BYTE, 0);
	var removeSparks = []
	for (var i = 0; i < sparkVelocities.length; i++) {
		var vv = sparkVelocities[i];
		var p = sparkPositions[i];
		var xx = p[0] + vv[0];
		var yy = p[1] + vv[1];
		var zz = p[2] + vv[2];
		sparkVelocities[i][1] -= gravity;
		sparkPositions[i] = vec3(xx, yy, zz);
		sparkLives[i] -= 0.02;
		if (sparkLives[i] < 0) {
			removeSparks.push(i);
		}
		var t = mat4 (1.0, 0.0, 0.0, xx,
				   0.0, 1.0, 0.0, yy,
				   0.0, 0.0, 1.0, zz,
				   0.0, 0.0, 0.0, 1.0);
		modelViewMatrix = mult(looking, t);
	
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
		for( var j=startIndex; j<index; j+=3) 
			gl.drawArrays( gl.TRIANGLES, j, 3 );
		//gl.drawElements(gl.TRIANGLES, startIndexArrayLength, gl.UNSIGNED_BYTE, startIndexArrayLength + (startIndexArrayLength * i) );
	}
	for (var i = removeSparks.length - 1; i >= 0; i--) {
		var ind = removeSparks[i];
		sparkLives.splice(ind, 1);
		sparkVelocities.splice(ind, 1);
		sparkPositions.splice(ind, 1);
	}
    window.requestAnimFrame(render);
}
