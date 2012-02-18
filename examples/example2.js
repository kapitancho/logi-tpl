exports.runExample = function() {
	
	var qtpl = require ('../logi-tpl');
			
	return qtpl.applyToFileTemplate (__dirname + '/tpl/example2.html', {	
		site_title : 'example1 site',
		sync_demo : function (param1, param2) {
			return "param1 - param2 = " + (param1 - param2);
		},
		async_demo : function (callback) {
			//An async operation may go here. It should finally invoke: 
			callback (null, "ASYNC DEMO RESULT");
		},
		async_demo_with_args : function (param1, param2) {
			return function (callback) {
				//An async operation that uses param1 and param2 may go here. It should finally invoke: 
				callback (null, "param1 + param2 = " +  (param1 + param2));			
			};
		}
	}, function (error, result) {
		console.log ("Teamplte rendering has finished...");
		if (error) {
			console.log ('Error: ', error);			
		} else {
			console.log ('Rendering successful! Streaming the result:');
			console.log (result);
		}
	});
	
	console.log ("Teamplte rendering is in progress...");
	
};