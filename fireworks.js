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
var sparkScales;
var sparkColors;
var sparkAngles;
var sparkCenters;

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

var colorLoc;
var lightedLoc;
var aspect;

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

function makeCube(size, cx, cy, cz) {
	var hs = size / 2; // half-size
	//front
	pointsArray.push(vec4(cx + hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz - hs));
	//back
	pointsArray.push(vec4(cx - hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz + hs));
	//top
	pointsArray.push(vec4(cx + hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz - hs));
	//bottom
	pointsArray.push(vec4(cx - hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz + hs));
	//left
	pointsArray.push(vec4(cx - hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx - hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx - hs, cy + hs, cz + hs));
	//right
	pointsArray.push(vec4(cx + hs, cy - hs, cz - hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz + hs));
	pointsArray.push(vec4(cx + hs, cy + hs, cz - hs));
	pointsArray.push(vec4(cx + hs, cy - hs, cz - hs));
	normalsArray = pointsArray;
	index += 36;
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    aspect = canvas.width / canvas.height;
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
	sparkScales = [];
	sparkColors = [];
	sparkAngles = [];
	sparkCenters = [];
	
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
	
	//makeSphere(sphereRadius, 4, 0, 0, -1);
	makeCube(0.01, 0, 0, -1);
	startIndex = index;
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	colorLoc = gl.getUniformLocation (program, "color");
	lightedLoc = gl.getUniformLocation(program, "lighted");

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
			//makeSphere(0.1, 2, 0, 0, 0);
			makeCube(0.05, 0, 0, 0);
		}
		var hue = Math.random();
        for (var i = 0; i < 50; i++) {
			var v = 0.05;
			var xx = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var yy = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v * 1.35;
			var zz = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			sparkPositions.push(vec3(0, 0, 0));
			sparkVelocities.push(vec3(xx, yy, zz));
			sparkLives.push(Math.random()*1.5 + 1);
			sparkScales.push(Math.random() * 2 + 1);
			var c = hslToRgb(hue, Math.random() * 0.2 + 0.8, Math.random() * 0.4 + 0.3);
			sparkColors.push(vec4(c[0], c[1], c[2], 1.0));
			sparkAngles.push(0);
			sparkCenters.push(vec3(0, 0, 0));
		}
    };
	
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(0)*Math.cos(phi), 
        radius*Math.sin(0)*Math.sin(phi), radius*Math.cos(0));
	var looking = lookAt(eye, at, up);
	modelViewMatrix = looking;
	var cameraPos =mat4(1.0, 0.0, 0.0, 0,
						0.0, 1.0, 0.0, 0,
						0.0, 0.0, 1.0, -1,
						0.0, 0.0, 0.0, 1.0);
	projectionMatrix = mult(perspective (45.0, aspect, 1, 5*20), cameraPos);
    //projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniform4fv (colorLoc, vec4(1.0, 0.5, 0.3, 1.0));
	gl.uniform1i (lightedLoc, 1);
	for( var i=0; i<startIndex; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );
	// gl.drawElements(gl.TRIANGLES, startIndexArrayLength, gl.UNSIGNED_BYTE, 0);
	var removeSparks = [];
	for (var i = 0; i < sparkVelocities.length; i++) {
		var vv = sparkVelocities[i];
		var p = sparkPositions[i];
		var xx = p[0] + vv[0];
		var yy = p[1] + vv[1];
		var zz = p[2] + vv[2];
		var scale = sparkScales[i];
		var theta = sparkAngles[i];
		var center = sparkCenters[i];
		sparkVelocities[i][1] -= gravity;
		sparkPositions[i] = vec3(xx, yy, zz);
		sparkLives[i] -= 0.02;
		sparkScales[i] -= 0.02;
		sparkAngles[i] += Math.random() * 10 + 5;
		if (sparkLives[i] < 0 || sparkScales[i] < 0) {
			removeSparks.push(i);
		}
		
		var c = [];
		var s = [];
		
		for (j=0; j<3; j++) {
			var angle = radians(theta);
			c.push(Math.cos(angle));
			s.push(Math.sin(angle));
		}
		
		var rx = mat4 (1.0, 0.0, 0.0, 0.0,
				   0.0, c[0], -s[0], 0.0,
				   0.0, s[0], c[0], 0.0,
				   0.0, 0.0, 0.0, 1.0);
					   
		var ry = mat4 (c[1], 0.0, s[1], 0.0,
				   0.0, 1.0, 0.0, 0.0,
				   -s[1], 0.0, c[1], 0.0,
				   0.0, 0.0, 0.0, 1.0);
		
		var rz = mat4 (c[2], -s[2], 0.0, 0.0,
				   s[2], c[2], 0.0, 0.0,
				   0.0, 0.0, 1.0, 0.0,
				   0.0, 0.0, 0.0, 1.0);
		
		var t = mat4 (scale, 0.0, 0.0, xx + center[0],
				   0.0, scale, 0.0, yy + center[1],
				   0.0, 0.0, scale, zz + center[2],
				   0.0, 0.0, 0.0, 1.0);
		
		var tz1 = mat4 (1.0, 0.0, 0.0, -center[0],
						0.0, 1.0, 0.0, -center[1],
						0.0, 0.0, 1.0, -center[2],
						0.0, 0.0, 0.0, 1.0);
						
		var rotation = mult (rz, mult(ry, rx));
						
		modelViewMatrix = mult(looking, mult(t, mult (rotation, tz1)));
		//modelViewMatrix = mult(looking, t);
	
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
		var c = sparkColors[i];
		gl.uniform4fv (colorLoc, c);
		gl.uniform1i (lightedLoc, 0);
		for( var j=startIndex; j<index; j+=3) {
			gl.drawArrays( gl.TRIANGLES, j, 3 );
		}
	}
	for (var i = removeSparks.length - 1; i >= 0; i--) {
		var ind = removeSparks[i];
		sparkLives.splice(ind, 1);
		sparkVelocities.splice(ind, 1);
		sparkPositions.splice(ind, 1);
		sparkScales.splice(ind, 1);
		sparkColors.splice(ind, 1);
		sparkAngles.splice(ind, 1);
		sparkCenters.splice(ind, 1);
	}
    window.requestAnimFrame(render);
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r, g, b];
}