//
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
var cx = 0.0;
var yaw = 0.0;
var pitch = 0.0;

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
	//ocean.render();
	//castle.render();
	fireworks.render();
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