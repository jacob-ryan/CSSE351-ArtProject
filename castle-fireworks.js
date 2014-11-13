var fireworks = function()
{	
	//how fast fireworks fall
	var gravity = 0.0003;
	//controls how often the fireworks spawn
	var spawnTimerMax = 24;
	var spawnTimerMin = 12;
	var spawnTimer = 0;
	//firework spark data
	var sparkVelocities = [];
	var sparkPositions = [];
	var sparkLives = [];
	var sparkScales = [];
	var sparkColors = [];
	var sparkAngles = [];
	var sparkCenters = [];
	
	var render = function()
	{
		//spawn a new firework when the timer reaches 0 and reset the timer
		spawnTimer -= 1;
		if (spawnTimer <= 0) {
			spawnFirework(50);
			spawnTimer = Math.random() * spawnTimerMax * (spawnTimerMin/spawnTimerMax) + spawnTimerMin;
		}
		
		var removeSparks = [];
		for (var i = 0; i < sparkVelocities.length; i++) {
			//retrieve and adjust parameters for the firework particle
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
			//transform the firework particle to be drawn
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
			
			var tz1 = mat4 (1.0, 0.0, 0.0, 0,
							0.0, 1.0, 0.0, 0,
							0.0, 0.0, 1.0, 0,
							0.0, 0.0, 0.0, 1.0);
							
			var rotation = mult (rz, mult(ry, rx));
							
			modelViewMatrix = mult(lookingMatrix, mult(t, mult (rotation, tz1)));
		
			gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
			
			//set particle color
			var c = sparkColors[i];
			gl.uniform4fv (colorLoc, c);
			//firework particles do NOT use lighting
			gl.uniform1i (lightedLoc, 0);
			
			//draw the firework particle
			gl.drawArrays(gl.TRIANGLES, fireworkIndex, 36);
		}
		//remove dead sparks from the scene
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
	};
	
	//spawns "n" number of firework particles
	function spawnFirework(n) {
		//pick a random hue and center for the firework
		var hue = Math.random();
		var center = vec3(Math.random() * 1 - 0.5, Math.random() * 0.75 + 0.25, Math.random());
		
		//change color of light source, move it to the center of this firework
		var lc = hslToRgb(hue, 1, Math.random() * 0.4 + 0.3);
		lightDiffuse = vec4( lc[0], lc[1], lc[2], 1.0 );
		lightPosition = vec4(center[0], center[1], center[2], 0.0 );
		var v = 0.005;
		for (var i = 0; i < n; i++) {
			var vx = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			var vy = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v * 1.35;
			var vz = (Math.random() < 0.5 ? -1 : 1) * Math.random() * v;
			sparkPositions.push(vec3(0, 0, 0));
			sparkVelocities.push(vec3(vx, vy, vz));
			sparkLives.push(Math.random()*1.5 + 1);
			sparkScales.push(Math.random() * 2 + 1);
			var c = hslToRgb(hue, Math.random() * 0.2 + 0.8, Math.random() * 0.4 + 0.3);
			sparkColors.push(vec4(c[0], c[1], c[2], 1.0));
			sparkAngles.push(0);
			sparkCenters.push(center);
		}
	}
	
	//transforms hsl color to rgb color
	function hslToRgb(h, s, l){
		var r, g, b;

		if(s == 0){
			r = g = b = l;
		}
		else{
			function hue2rgb(p, q, t){
				if(t < 0) {
					t += 1;
				}
				if(t > 1) {
					t -= 1;
				}
				if(t < 1/6) {
					return p + (q - p) * 6 * t;
				}
				if(t < 1/2) {
					return q;
				}
				if(t < 2/3) {
					return p + (q - p) * (2/3 - t) * 6;
				}
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
	
	//used to add the firework cube to the buffer to be used for the firework particle
	var makeCube = function(size, cx, cy, cz) {
		var hs = size / 2; // half-size
		//front
		pointsArray.push(vec4(cx + hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz - hs, 1));
		//back
		pointsArray.push(vec4(cx - hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz + hs, 1));
		//top
		pointsArray.push(vec4(cx + hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz - hs, 1));
		//bottom
		pointsArray.push(vec4(cx - hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz + hs, 1));
		//left
		pointsArray.push(vec4(cx - hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx - hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx - hs, cy + hs, cz + hs, 1));
		//right
		pointsArray.push(vec4(cx + hs, cy - hs, cz - hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz + hs, 1));
		pointsArray.push(vec4(cx + hs, cy + hs, cz - hs, 1));
		pointsArray.push(vec4(cx + hs, cy - hs, cz - hs, 1));
		for (var i = 0; i < 36; i += 1) { normalsArray.push(vec4(0, 0, 0, 1)); }
		fireworkIndex = index;
		index += 36;
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	}
	
	return {
		render: render,
		makeCube: makeCube
	};
	
}();