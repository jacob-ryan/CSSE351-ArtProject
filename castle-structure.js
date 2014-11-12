var structure = function()
{
	var materialAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
	var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0 );
	var materialSpecular = vec4( 0.8, 0.8, 0.8, 1.0 );
	var materialShininess = 80.0;
	
	var render = function()
	{
		setLighting(materialAmbient, materialDiffuse, materialSpecular, materialShininess);
		var t = mat4 (1, 0.0, 0.0, -0.25,
				   0.0, 1, 0.0, 0,
				   0.0, 0.0, 1, 0,
				   0.0, 0.0, 0.0, 1.0);
		modelViewMatrix = mult(lookingMatrix, t);
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
		
		gl.uniform4fv (colorLoc, vec4(0.25, 0.75, 0.75, 1.0));
		gl.uniform1i (lightedLoc, 1);
		gl.drawArrays(gl.TRIANGLES, castleIndex, castleBufferSize);
	};
	
	return {
		render: render
	};
}();