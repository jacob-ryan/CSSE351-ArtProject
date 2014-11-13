// つ ◕_◕ ༽つ
// castle.js
// CSSE 351 - Computer Graphics
// Final Art Project
// By Jacob Ryan, Jonathan Jungck, Tai Enrico, and Michael Laritz
//

var canvas;
var gl;

//keyboard controls info
var keyStates = {};
var keyNames = ["forward", "backward", "left", "right", "up", "down"];
var keyCodes = [87, 83, 65, 68, 81, 69];
for (var i = 0; i < keyNames.length; i += 1)
{
	keyStates[keyNames[i]] = { code: keyCodes[i], pressed: false };
}

//camera transform info
var cx = 0.0;
var cy = 0.3;
var cz = 2.0;
var yaw = 180;
var pitch = 0.0;
var velocity = vec3(0.0, 0.0, 0.0);
var forwardVector = vec3(0.0, 0.0, 0.0);
var rightVector = vec3(0.0, 0, 0);

//lighting
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

//buffer info
var nBuffer;
var vBuffer;
var pointsArray = [];
var normalsArray = [];
var index = 0;
var fireworkIndex = 0;

//shader program
var program;

//perspective projection info
var lookingMatrix;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var aspect;

//shader parameters
var colorLoc; //color of next rendered object
var lightedLoc; //should the next rendered object use lighting?

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
	gl.clearColor(0.05, 0.05, 0.5, 1.0);

	gl.enable(gl.DEPTH_TEST);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	initShaderVariables(program);
	
	//add castle to the scene
	structure.makeCastle();
	//add firework cube to the scene
	fireworks.makeCube(0.005, 0, 0, 0);
	
	//camera controls
	canvas.requestPointerLock = canvas.requestPointerLock ||
								canvas.mozRequestPointerLock ||
								canvas.webkitRequestPointerLock;
	if (canvas.requestPointerLock)
	{
		canvas.onclick = function()
		{
			canvas.requestPointerLock();
			document.addEventListener("mousemove", mouseMoved, false);
			document.addEventListener("keydown", keyDown, true);
			document.addEventListener("keyup", keyUp, true);
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
	
	//check if any keys are being pressed to move the camera
	checkKeyPresses();
	
	//move/rotate the camera
	var eye = vec3(cx, cy, cz);
	var fx = Math.sin(radians(yaw)) * Math.cos(radians(pitch));
	var fy = Math.sin(radians(pitch));
	var fz = Math.cos(radians(yaw)) * Math.cos(radians(pitch));
	var rx = Math.sin(radians(yaw - 90));
	var ry = 0.0;
	var rz = Math.cos(radians(yaw - 90));
	
	forwardVector = vec3(fx, fy, fz);
	forwardVector = normalize(forwardVector);
	rightVector = vec3(rx, ry, rz);
	rightVector = normalize(rightVector);
	
	//set up initial model view and projection matrices for this frame
	var at = add(eye, forwardVector);
	var up = vec3(0.0, 1.0, 0.0);
	lookingMatrix = lookAt(eye, at, up);
	
	modelViewMatrix = lookingMatrix;
	var camTransform = mat4(1.0, 0.0, 0.0, 0.0,
							0.0, 1.0, 0.0, 0.0,
							0.0, 0.0, 1.0, 0.0,
							0.0, 0.0, 0.0, 1.0);
	projectionMatrix = mult(perspective(45.0, aspect, 0.1, 5*20), camTransform);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

	//render scene props
	ocean.render();
	structure.render();
	fireworks.render();
};

var initShaderVariables = function(program)
{
	nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	colorLoc = gl.getUniformLocation(program, "color");
	lightedLoc = gl.getUniformLocation(program, "lighted");
};

//set the current lighting to be used by the shader according to the material parameters
var setLighting = function(mAmbient, mDiffuse, mSpecular, mShininess)
{
	var ambientProduct = mult(lightAmbient, mAmbient);
	var diffuseProduct = mult(lightDiffuse, mDiffuse);
	var specularProduct = mult(lightSpecular, mSpecular);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), mShininess);
};

var keyDown = function(e)
{
	var key = e.keyCode;
	
	for (var prop in keyStates)
	{
		if (keyStates.hasOwnProperty(prop))
		{
			if (keyStates[prop].code == key)
			{
				keyStates[prop].pressed = true;
			}
		}
	}
};

var keyUp = function(e)
{
	var key = e.keyCode;
	
	for (var prop in keyStates)
	{
		if (keyStates.hasOwnProperty(prop))
		{
			if (keyStates[prop].code == key)
			{
				keyStates[prop].pressed = false;
			}
		}
	}
};

//use keys to translate camera based on current rotation
var checkKeyPresses = function()
{
	var factor = 0.01;
	
	if (keyStates["forward"].pressed)
	{
		velocity = add(velocity, forwardVector);
	}
	if (keyStates["backward"].pressed)
	{
		velocity = add(velocity, negate(forwardVector));
	}
	if (keyStates["left"].pressed)
	{
		velocity = add(velocity, negate(rightVector));
	}
	if (keyStates["right"].pressed)
	{
		velocity = add(velocity, rightVector);
	}
	if (keyStates["up"].pressed)
	{
		velocity = add(velocity, vec3(0.0, 1.0, 0.0));
	}
	if (keyStates["down"].pressed)
	{
		velocity = add(velocity, vec3(0.0, -1.0, 0.0));
	}
	
	cx += factor * velocity[0];
	cy += factor * velocity[1];
	cz += factor * velocity[2];
	
	velocity = scale(0.75, velocity);
};

//use mouse to rotate camera
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

	yaw -= dx * 0.1;
	yaw = yaw % 360;

	pitch -= dy * 0.1;
	pitch = Math.min(pitch, 80.0);
	pitch = Math.max(pitch, -80.0);
};