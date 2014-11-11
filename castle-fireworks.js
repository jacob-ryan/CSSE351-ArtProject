var fireworks = function()
{	
	var gravity = 0.01;
	var spawnTimerMax = 200;
	var spawnTimerMin = 100;
	var spawnTimer = 0;
	var sparkVelocities = [];
	var sparkPositions = [];
	var sparkLives = [];
	var sparkScales = [];
	var sparkColors = [];
	var sparkAngles = [];
	var sparkCenters = [];
	
	var render = function()
	{
		spawnTimer -= 1;
		if (spawnTimer <= 0) {
			spawnFirework(30);
			spawnTimerMax = Math.random() * spawnTimerMax + spawnTimerMin;
		}
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
			
			var tz1 = mat4 (1.0, 0.0, 0.0, 0,
							0.0, 1.0, 0.0, 0,
							0.0, 0.0, 1.0, 0,
							0.0, 0.0, 0.0, 1.0);
							
			var rotation = mult (rz, mult(ry, rx));
							
			modelViewMatrix = mult(looking, mult(t, mult (rotation, tz1)));
			//modelViewMatrix = mult(looking, t);
		
			gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
			var c = sparkColors[i];
			gl.uniform4fv (colorLoc, c);
			gl.uniform1i (lightedLoc, 0);
			for( var j=fireworkIndex; j<index; j+=3) {
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
	};
	
	function spawnFirework(n) {
		var hue = Math.random();
		var center = vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		var lc = hslToRgb(hue, 1, Math.random() * 0.4 + 0.3);
		lightDiffuse = vec4( lc[0], lc[1], lc[2], 1.0 );
		lightPosition = vec4(center[0], center[1], center[2], 0.0 );
		for (var i = 0; i < n; i++) {
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
			sparkCenters.push(center);
		}
	}
	
	return {
		render: render
	};
}();