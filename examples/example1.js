exports.runExample = function() {

	var qtpl = require ('../logi-tpl');
			
	return qtpl.applyToFileTemplate (__dirname + '/tpl/example1.html', {	
		site_title : 'example1 site',
		site_footer : 'example1 footer',
		main_menu : ['Home', 'FAQ', 'Contact'],
		bottom_menu : ['Sitemap', 'About us']
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

}