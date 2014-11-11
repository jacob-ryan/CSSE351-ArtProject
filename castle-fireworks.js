var fireworks = function()
{
	var privateData = 123;
	
	var render = function()
	{
		//console.log("Rendering " + privateData);
	};
	
	return {
		render: render
	};
}();