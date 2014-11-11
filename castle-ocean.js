var ocean = function()
{
	var points;
	var divisions = 20;
	
	var render = function()
	{
		points = [];
		
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
				
				points.push(vec3(x1, y1, z1));
				points.push(vec3(x3, y3, z3));
				points.push(vec3(x2, y2, z2));
				
				points.push(vec3(x4, y4, z4));
				points.push(vec3(x2, y2, z2));
				points.push(vec3(x3, y3, z3));
			}
		}
		
		var index = numCastlePoints;
		
	};
	
	var sample = function(x, y)
	{
		var t = (new Date()).getTime() / 1000;
		var x1 = x + 1.0 * t;
		var y1 = y + 0.5 * t;
		var x2 = x + 0.1 * t;
		var y2 = y + 0.05 * t;
		var level1 = Math.cos(x1) * Math.sin(y1);
		var level2 = Math.cos(x2) * Math.sin(y2);
		var total = 0.2 * level1 + 0.1 * level2;
		return total;
	};
	
	return {
		render: render
	};
}();