var vm = require ('vm');
var fs = require ('fs');
var path = require ('path');
var HTML = 0;
var JS = 1;
var ECHO = 2;
var INCLUDE = 3;
var signMap = {
	'=' : ECHO,
	'' : JS,
	'~' : INCLUDE
};

var r = /(\%>)(.*?)(<\%((\=|\~)?))/;
var r1 = /^(.*?)(<\%((\=|\~)?))/;
var r2 = /(\%>)(.*?)$/;

var cache = {};

exports.parseTemplateCode = function (templateCode, callback) {
    var lines = templateCode.split(/\n/g);
    var mode = HTML;
    var buffer = [
    ];

    var addToBuffer = function (content, mode) {
    	if (content.length == 0) return;
    	if (mode == HTML) {
    		buffer.push ("__logi_tpl.output ('" + content.replace(/\\/g, "\\\\").replace (/'/g, '\\\'') + "');");
    	} else if (mode == JS) {
    		buffer.push (content);
    	} else if (mode == ECHO) {
    		buffer.push ('__logi_tpl.output (' + content + ');');
    	} else if (mode == INCLUDE) {
    		buffer.push ('__logi_tpl.output (__logi_tpl.includeTemplate (' + content + '));');
    	}
    };
	lines.forEach (function (row) {
		row = row.trimRight();
		if (mode == HTML) {
			if (match = row.match (r1)) {
				addToBuffer (match[1], HTML);
				mode = signMap[match[2].charAt (2)];
				row = row.substr (match[0].length);
			} else {
				addToBuffer (row, HTML);
				row = '';
			}
		};
		while (match = row.match (r)) {
			addToBuffer (row.substr (0, match.index), mode);
			addToBuffer (match[2], HTML);
			mode = signMap[match[3].charAt (2)];
			row = row.substr (match.index + match[0].length); 
		}
		if (mode != HTML) {
			if (match = row.match (r2)) {
				addToBuffer (row.substr (0, match.index), mode);
				addToBuffer (match[2], HTML);
				row = row.substr (match.index + match[0].length);
				mode = HTML;
			}
		}
		if (row.length > 0) {
			addToBuffer (row, JS);
		}
		
		if (mode == HTML) {
			addToBuffer ('"\\n"', ECHO);
		}
	});
	var outputScript = buffer.join ("\n");
	
	callback (null, outputScript);
};

exports.compileTemplateCode = function (templateCode, callback) {
	exports.parseTemplateCode (templateCode, function (error, outputScript) {
		if (error) {
			callback (error, null);
		} else {
			try {
				var compiledScript = vm.createScript (outputScript, 'compiled_template');
				callback (null, compiledScript);
			} catch (e) {
				callback ({error:e, outputScript:outputScript}, null);
			}
		}
	});		
};

var outputEngine_output = function (text) {
	this.builder.push (text);
}; 

var outputEngine_includeTemplate = function (templateName, newContext) {
	var that = this;
	var templateFullPath;
	if (templateName.charAt (0) != '/') {
		templateFullPath = that.templateRoot + '/' + templateName;
	} else {
		templateFullPath = templateName;
	}
	return function (callback, context) {
		that.templateEngine.applyToFileTemplate (templateFullPath, newContext || context, callback);
	};
};

exports.applyToCompiledTemplate = function (compiledScript, context, callback, templateRoot) {
	try {				
		var outputEngine = {
			builder : [],
			output : outputEngine_output,
			includeTemplate : outputEngine_includeTemplate,
			templateRoot : templateRoot,
			templateEngine : exports
		};
		
		var eContext = {};
		for (var keys = Object.keys (context), l = keys.length; l; --l) {
		   eContext[keys[l - 1]] = context[keys[l - 1]];
		}
		eContext.__logi_tpl = outputEngine;
		
		compiledScript.runInNewContext (eContext);
		
		var builder = eContext.__logi_tpl.builder; 
		
		var result = [];
		var idx = 0;
		var fillResult = function (error, content) {
			if (typeof error != 'undefined' && error != null) {
				return callback (error, null);
			}
			if (typeof content != 'undefined') {
				result.push (content);
				return process.nextTick (fillResult);
			}
			if (idx < builder.length) {
				var el = builder[idx];
				idx++;
				if (typeof el == 'function') {
					el (fillResult, context);
				} else {
					result.push (el);
					process.nextTick (fillResult);
				}
			} else {
				callback (null, result.join (''));
			}
		};
		process.nextTick (fillResult);
	} catch (e) {
		callback (e, null);
	}
}	

exports.applyToStringTemplate = function (templateCode, context, callback, templateRoot) {
	exports.compileTemplateCode (templateCode, function (error, compiledScript) {
		if (error) {
			callback (error, null);
		} else {
			exports.applyToCompiledTemplate (compiledScript, context, callback, templateRoot);
		}		
	});
};

exports.applyToFileTemplate = function (fileName, context, callback) {
	/*if (cache[fileName]) {
		process.nextTick (function() {
			exports.applyToStringTemplate (cache[fileName], context, callback);			
		});
	}*/
	fs.readFile (fileName, function (error, data) {
		if (error) {
			callback (error, null);
		} else {
			cache[fileName] = content = data.toString ('utf8');
			exports.applyToStringTemplate (content, context, callback, path.dirname (fileName));
		}
	});
};
