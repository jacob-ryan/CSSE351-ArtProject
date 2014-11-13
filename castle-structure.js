var structure = function()
{
	//castle's buffer size and starting index location in the buffer
	var castleBufferSize = 0;
	var castleIndex = 0;
	//castle point and normal data
	
	//castle material parameters
	var materialAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
	var materialDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
	var materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );
	var materialShininess = 50.0;
	
	var render = function()
	{
		setLighting(materialAmbient, materialDiffuse, materialSpecular, materialShininess);
		var t = mat4(1.0, 0.0, 0.0, -0.25,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					0.0, 0.0, 0.0, 1.0);
		modelViewMatrix = mult(lookingMatrix, t);
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
		
		gl.uniform4fv (colorLoc, vec4(0.25, 0.75, 0.75, 1.0));
		gl.uniform1i (lightedLoc, true);
		gl.drawArrays(gl.TRIANGLES, castleIndex, castleBufferSize);
	};
	
	//adds the castle to the scene
	var makeCastle = function()
	{
		for (var i = 0; i < castlePoints.length; i += 3)
		{
			//divide each point value by 500 to properly scale it
			pointsArray.push(vec4(
			castlePoints[i]/500,
			castlePoints[i+1]/500,
			castlePoints[i+2]/500, 1));
		}
		for (var i = 0; i < castleNorm.length; i += 3)
		{
			normalsArray.push(vec4(
			castleNorm[i],
			castleNorm[i+1],
			castleNorm[i+2], 1));
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
		castleIndex = 0;
		castleBufferSize = castlePoints.length / 3;
		index += castleBufferSize;
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	};
	
	return {
		render: render,
		makeCastle: makeCastle
	};
}();