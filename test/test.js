var BitSequence, println;
var env = (typeof module === 'object') ? 'node' : 'browser';
if (env === 'browser') {
	BitSequence = BitSequenceCore;
	println = function(text) {
		var line = document.createElement('div');
		line.textContent = text;
		document.body.appendChild( line );
	};
}
if (env === 'node') {
	BitSequence = require('../umd/bitsequencecore.js');
	println = console.log;
}
function extractValues(binaryStr, markup) {
	var binaryStr, sequence = new BitSequence();
	sequence.fromString(binaryStr, binaryStr.length*8);
	var values = [], i = 0;
	var it = sequence.getIterator();
	while ( it.hasNext() ) {
		values.push( it.getNext(markup[i]) );
		if ( ++i == markup.length ) i = 0;
	}
	return values;
}
function packValues(values, markup) {
	var sequence = new BitSequence();
	var it = sequence.getIterator();
	for ( var j=0, i=0; j < values.length; j++ ) {
		it.setNext(markup[i], values[j]);
		if ( ++i == markup.length ) i = 0;
	}
	return sequence.toString();
}
var tests = [
	{	
		bytes: [97, 98, 99, 100],
		markup: [8, 8, 8, 8],
	},
	{	
		bytes: [97, 98, 99, 100],
		markup: [4, 12, 4, 8],
	},
	{	
		bytes: [254, 254, 254, 254],
		markup: [7, 1],
	},
	{	
		bytes: [1, 1, 1, 1],
		markup: [7, 8, 1],
	},
	{	
		bytes: [128, 1, 128, 1],
		markup: [7, 8, 1],
	},
];
println( '*********************************************************************' );
println( '*********************************************************************' );
println( 'this test extracts values using a defined markup from a base64 string' );
println( 'then those value by using that markup are packed back into a string' );
println( 'that is being encoded back into a base64 string' );
println( '*********************************************************************' );
println( '*********************************************************************' );
for ( var i=0; i < tests.length; i++ ) {
	println( 'test ' + (i+1) );
	println( 'bytes: ' + tests[i].bytes.toString() );
	println( 'markup: ' + tests[i].markup.toString() );
	println( '---------------------------------------------' );
	var base64Str, binaryStr;
	var string = String.fromCharCode.apply(null, tests[i].bytes);
	if ( env === 'browser' ) base64Str = btoa(string);
	if ( env === 'node' ) base64Str = Buffer.from(string, 'binary').toString('base64');
	println( 'input: '+base64Str );
	if ( env === 'browser' ) binaryStr = atob(base64Str);
	if ( env === 'node' ) binaryStr = Buffer.from(base64Str, 'base64').toString('binary');
	values = extractValues(binaryStr, tests[i].markup);
	println( 'extracted: ' + values.toString() );
	binaryStr = packValues(values, tests[i].markup);
	if ( env === 'browser' ) base64Str = btoa(binaryStr);
	if ( env === 'node' ) base64Str = Buffer.from(binaryStr, 'binary').toString('base64');
	println( 'output: '+ base64Str );
	println( '*********************************************' );
	println( '*********************************************' );
}
