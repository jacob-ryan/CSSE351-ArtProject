// つ ◕_◕ ༽つ
// castle.js
// CSSE 351 - Computer Graphics
// Final Art Project
// By Jacob Ryan, Jonathan Jungck, Tai Enrico, and Michael Laritz
//

var canvas;
var aspect;
var gl;

var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var yaw = 0.0;
var pitch = 0.0;

var lookingMatrix;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var colorLoc;
var lightedLoc;

var lightPosition = vec4(1.0, 1.0, 1.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var nBuffer;
var vBuffer;
var fireworkIndex;

var init = function()
{
	canvas = document.getElementById("gl-canvas");
	aspect = canvas.width / canvas.height;
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl)
	{
		alert("WebGL isn't available.");
		return;
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.8, 1.0, 1.0);

	gl.enable(gl.DEPTH_TEST);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	initShaderVariables(program);

	canvas.requestPointerLock = canvas.requestPointerLock ||
								canvas.mozRequestPointerLock ||
								canvas.webkitRequestPointerLock;
	if (canvas.requestPointerLock)
	{
		canvas.onclick = function()
		{
			canvas.requestPointerLock();
			document.addEventListener("mousemove", mouseMoved, false);
			document.addEventListener("keydown", keyPressed, true);
		};
	}
	else
	{
		alert("Your browser does not support the Pointer Lock API.");
		return;
	}

	render();
};

var render = function()
{
	window.requestAnimationFrame(render);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var eye = vec3(0.0, 0.0, 1.0);
	var at = vec3(0.0, 0.0, 1.0);
	var up = vec3(0.0, 1.0, 0.0);
	lookingMatrix = lookAt(eye, at, up);
	modelViewMatrix = lookingMatrix;
	var camTransform = mat4(1.0, 0.0, 0.0, cx,
							0.0, 1.0, 0.0, cy,
							0.0, 0.0, 1.0, cz,
							0.0, 0.0, 0.0, 1.0);
	projectionMatrix = mult(perspective(45.0, aspect, 1, 5*20), camTransform);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

	//ocean.render();
	//structure.render();
	fireworks.render();
};

var initShaderVariables = function(program)
{
	nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	colorLoc = gl.getUniformLocation(program, "color");
	lightedLoc = gl.getUniformLocation(program, "lighted");
};

var setLighting = function(mAmbient, mDiffuse, mSpecular)
{
	var ambientProduct = mult(lightAmbient, mAmbient);
	var diffuseProduct = mult(lightDiffuse, mDiffuse);
	var specularProduct = mult(lightSpecular, mSpecular);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
};

var keyPressed = function(e)
{
	var key = e.keyCode;
	var KEY_W = 87;
	var KEY_A = 65;
	var KEY_S = 83;
	var KEY_D = 68;
	var scale = 0.01;
	console.log("Pressed " + key);

	if (key == KEY_W)
	{
		cz += scale;
	}
	if (key == KEY_A)
	{
		cx -= scale;
	}
	if (key == KEY_S)
	{
		cz -= scale;
	}
	if (key == KEY_D)
	{
		cx += scale;
	}
};

var mouseMoved = function(e)
{
	var dx = e.movementX ||
				e.mozMovementX ||
				e.webkitMovementX ||
				0;
	var dy = e.movementY ||
				e.mozMovementY ||
				e.webkitMovementY ||
				0;
	console.log("dx: " + dx + ", dy: " + dy);

	yaw += dx * 0.1;
	yaw = yaw % 360;

	pitch += dy * 0.1;
	pitch = Math.min(pitch, 80.0);
	pitch = Math.max(pitch, -80.0);
};

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
//used to add a cube to the buffer to be used for the firework particle
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
	fireworkIndex = index;
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}
