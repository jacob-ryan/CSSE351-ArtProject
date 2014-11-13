var ocean = function()
{
	var numPoints;
	var divisions = 16;

	var materialAmbient = vec4(0.0, 0.0, 0.0, 1.0);
	var materialDiffuse = vec4(0.0, 0.5, 0.5, 1.0);
	var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
	var materialShininess = 1000.0;

	var render = function()
	{
		updateWaves();
		
		//lightDiffuse = vec4(1, 1, 1, 1.0);
		//lightPosition = vec4(0, 1, -3, 1.0);
		setLighting(materialAmbient, materialDiffuse, materialSpecular, materialShininess);
		var t = mat4(2.0, 0.0, 0.0, -1.0,
					0.0, 2.0, 0.0, 0.0,
					0.0, 0.0, 2.0, 0.75,
					0.0, 0.0, 0.0, 1.0);
		modelViewMatrix = mult(lookingMatrix, t);
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );

		gl.uniform1i(lightedLoc, true);
		gl.uniform1i(enableTextureLoc, true);
		gl.drawArrays(gl.TRIANGLES, pointsArray.length - 1024 * 32, numPoints);
		//gl.uniform1i(enableTextureLoc, false);
	};
	
	var updateWaves = function()
	{
		var points = [];
		var normals = [];
		
		var step = 1.0 / divisions;
		for (var x = 0; x <= 1.0 - step; x += step)
		{
			for (var y = 0; y <= 1.0 - step; y += step)
			{
				var x1 = x;
				var y1 = y;
				var x2 = x + step;
				var y2 = y;
				var x3 = x;
				var y3 = y + step;
				var x4 = x + step;
				var y4 = y + step;
				
				var z1 = sample(x1, y1);
				var z2 = sample(x2, y2);
				var z3 = sample(x3, y3);
				var z4 = sample(x4, y4);
				
				var p1 = vec4(x1, z1, y1, 1);
				var p2 = vec4(x2, z2, y2, 1);
				var p3 = vec4(x3, z3, y3, 1);
				var p4 = vec4(x4, z4, y4, 1);

				points.push(p1);
				points.push(p3);
				points.push(p2);
				
				normals.push(norm(p1));
				normals.push(norm(p3));
				normals.push(norm(p2));

				points.push(p4);
				points.push(p2);
				points.push(p3);
				
				normals.push(norm(p4));
				normals.push(norm(p2));
				normals.push(norm(p3));
			}
		}
		numPoints = points.length;
		
		var offset = (pointsArray.length - 1024 * 32) * 4 * 4;
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(points));
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(normals));
	};
	
	var norm = function(p)
	{
		var x1 = p[0];
		var y1 = p[1];
		var x2 = x1 + 0.01;
		var y2 = y1;
		var x3 = x1;
		var y3 = y1 + 0.01;
		
		var z1 = sample(x1, y1);
		var z2 = sample(x2, y2);
		var z3 = sample(x3, y3);
		
		var a = vec3(0.01, 0.0, z2 - z1);
		var b = vec3(0.0, 0.01, z3 - z1);
		var n = normalize(cross(a, b));
		return vec4(n[0], n[1], n[2], 1);
	};
	
	var sample = function(x, y)
	{
		var t = (new Date()).getTime() / 1000;
		var x1 = 8 * x + 1.0 * t;
		var y1 = 8 * y + 0.5 * t;
		var height = Math.cos(x1) * Math.sin(y1);
		return height * 0.05;
	};

	return {
		render: render
	};
}();