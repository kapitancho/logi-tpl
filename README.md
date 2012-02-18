# logi-tpl 
A standalone template engine with support for asynchronous content.

## About
 
logi-tpl is a simple but powerful templating system.
The way it works is very close to the way PHP is used as a template engine. 
Full JavaScript functionality can be used inside the templates.
See below for more details. 

## Features

* No other language should be learned. JavaScript is the template language.
* Subtemplates can be included. Different parameters can be passed to them.
* Async content can be inserted wherever needed.

## Installation

### Installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### Installing logi-tpl
<pre>
  npm install logi-tpl
</pre>

## Usage

The template engine may work in several convenient ways.
The simplest one is this: 

    var logiTpl = require ('../logi-tpl');
		
    logiTpl.applyToFileTemplate (__dirname + '/template.html', {	
    	name : 'John Dow',
    	age : 21
    }, function (error, result) {
	    if (error) {
		    console.log ('Error: ', error);			
    	} else {
    		console.log (result);
	    }
    });

template.html

    Your name is <%= name %>.
    <% if (age > 18) { %>
        You are allowed to proceed.
    <% } else { %>
        Sorry, you are not allowed to proceed.
    <% } %> 

Output:

    Your name is John Dow.
    You are allowed to proceed.

Instead of providing a file resource, you can
directly pass the template as a string and call

    logiTpl.applyToStringTemplate (templateCode, params, function (error, generatedContent) { /* ... */ }, templateRoot);

If you need to compile a template for a later use, you can do it easily: 

    logiTpl.compileTemplateCode (templateCode, function (error, compilationResult) { /* ... */ }); 

Then use:

    logiTpl.applyToCompiledTemplate (compiledScript, params, function (error, generatedContent) { /* ... */ }, templateRoot);

The last argument 'templateRoot' can be used when subtemplates are included. When applyToFileTemplate is used, 
the templateRoot is automatically exctracted from the template file name. 

## Basic template syntax

In general, if no <% ... %> sections are present, the content is directly returned as it is.
The content inside <% and %> pairs is executed as a standard JavaScript. 
Syntax like the one below is fully valid:

    <% if (a > 1) { %>
        some text
    <% } %> 
 
Additionally, content inside <%= and %> is "printed" to the output.
There is one special case - if the expression inside <%= ... %> is a function,
then this function is expected to provide a content asyncronously. 
The engine invokes it with a callback parameter and the function should 
invoke this "callback" with the content passed as an argument.
Check example2.js for more details.  

Subtemplates are included by using:		
    <%~ "sub/template.html" %>   

By default, all the parameters are passed to the subtemplate.
If you need to pass different parameter set, you can use:
    <%~ "sub/template.html", { a : 3, b : 4 } %>   
 
## Planned features

The following things are planned for future releases:
* Improved parsing
* Better parse error details 
* Custom compiler options
* New tag pairs like <%& %> for HTML escape and several more.
* Other :)
 