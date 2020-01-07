# BitSequenceCore
A tool for applying different markups to a given sequence of bits in order to retrieve numeric values. 
It can be used e.g. for packing and unpacking numeric values into/from strings.
The library functionality is similar to that of bit fields in C++, implemented with a different interface.

## Node package name: bitsequencecore

## Source files
* ./umd/bitsequencecore.js: HTML embedded script, CommonJS module
* ./umd/bitsequencecore.min.js: HTML embedded script, CommonJS module (minified)
* ./esm/bitsequencecore.js: ES module

## Importing from the ES module
```javascript
/*****************(Using Node Package)***************/
import { BitSequenceCore } from 'bitsequencecore/esm';
/*******************(Using File Path)****************/
import { BitSequenceCore } from 'bitsequencecore.js';
```

## Brief description of the interface:

#### Instantiating:
```javascript
var sequence = new BitSequenceCore();
```

#### Instantiating iterator:
```javascript
var it = sequence.getIterator();
```

#### Forming a bit sequence from an array or a string:
```javascript
sequence.fromArray(<src_array>, <bits_to_add>, [<array_element_size>=8]);
sequence.fromString(<src_string>, <bits_to_add>, [<string_char_size>=8]);
```

#### Saving the stored bit sequence to an array or a string:
```javascript
<dest_array> = sequence.toArray([<array_element_size>=8]);
<dest_string> = sequence.toString([<string_char_size>=8]);
```

#### Forming a bit sequence by a consecution of numbers (by using iterator):
```javascript
it.setNext(<field_bit_length>, <value>);
```

#### Consecutively retrieving numeric values from the bit sequence (by using iterator):
```javascript
while ( it.hasNext() ) { 
    <value> = it.getNext(<field_bit_length>);
    ................
}
```

#### Main interface:
```javascript
function getSequence(lowerBit, upperBit) {}
function setSequence(lowerBit, upperBit, value) {}
function getIterator() {}
function toArray(/**default=8**/destByteSize) {}
function fromArray(srcArray, srcBitLength, /**default=8**/srcByteSize) {}
function toString(/**default=8**/destByteSize) {}
function fromString(srcString, srcBitLength, /**default=8**/srcByteSize) {}
```

#### Iterator interface:
```javascript
function bitsLeft() {}
function hasNext() {}
function getNext(bitNumber) {}
function setNext(bitNumber, value) {}
function shift(bitNumber) {}
```
* Functions getNext() and setNext() move the cursor of the iterator by itself.
* Function shift() moves the cursor forward if supplied with the argument of a positive value 
or backward when the value is negative.

#### Example:
```javascript
var markup = [ 8, 8, 8, 8 ];
var env = (typeof module === 'object') ? 'node' : 'browser';
var base64Str, string = String.fromCharCode(97, 98, 99, 100); //"abcd"
if ( env === 'browser' ) base64Str = btoa(string);
if ( env === 'node' ) base64Str = Buffer.from(string, 'binary').toString('base64');
console.log( 'input: '+base64Str ); //"input: WJjZA=="
/**extracting numeric values from a base64 string:**/
var binaryStr, sequence = new BitSequenceCore();
if ( env === 'browser' ) binaryStr = atob(base64Str); //"abcd"
if ( env === 'node' ) binaryStr = Buffer.from(base64Str, 'base64').toString('binary'); //"abcd"
var sequence = new BitSequenceCore();
sequence.fromString(binaryStr, binaryStr.length*8);
var values = [], i = 0;
var it = sequence.getIterator();
while ( it.hasNext() ) {
    values.push( it.getNext(markup[i]) );
    if ( ++i == markup.length ) i = 0;
}
console.log( 'extracted: '+values ) //[ 97, 98, 99, 100 ];
/**packing numeric values into a base64 string:**/
var sequence2 = new BitSequenceCore();
var it2 = sequence2.getIterator();
for ( var j=0, i=0; j < values.length; j++ ) {
    it2.setNext(markup[i], values[j]);
    if ( ++i == markup.length ) i = 0;
}
var base64Str2, binaryStr2 = sequence2.toString(); //"abcd"
if ( env === 'browser' ) base64Str2 = btoa(binaryStr2);
if ( env === 'node' ) base64Str2 = Buffer.from(binaryStr2, 'binary').toString('base64');
console.log( 'output: '+base64Str2 ); //"output: YWJjZA=="
```

#### The way of setting a value:
The argument(s) of the setter functions define(s) an interval in which the value will be inserted. 
The interval is initially filled with zeros, the value is aligned with the right end of the interval 
and if the value exceeds the boundaries it is cut from the left side.


#### Functions getSequence() and setSequence():
These functions are used for accessing a random part of the sequence.
The first and the second arguments define an interval (inclusive both ends) to be operated on.
Example:
```javascript
sequence.setSequence( 4, 11, 255 );
sequence.getSequence( 8, 11 ); //15
sequence.toArray(); //[ 15, 240 ]
```

#### Functions fromArray() and fromString():
These functions erase any present bit sequence. The second argument defines the number of bits
that should be read from the first argument and it's mandatory.
For example, the following will add all but two last bits from the string:
```javascript
sequence.fromString("abc", 22);
```

### Parameters srcByteSize, destByteSize

( the third argument of functions fromArray() and fromString() and 
the first argument of functions toArray(), toString() )

These parameters are optional with a default value of 8.
They define a "length of byte" in the sense of 
how many bits should be read from each array element or string character.
For example, if binary data is packed in 
a string with 15-bit characters it can be declared as follow:
```javascript
sequence.fromString("abc", 22, 15); 
/**it extracts 15 bits from the first character
and 7 bits out of 15 (from the left side) from the second one.**/
```
Excessive bits of the value of an array element or character is cut from the left side and 
insufficient bits is completed with zeros from the left side.
For examples, the following takes only first two (from the right) 
bits from each array element:
```javascript
sequence.fromArray([254, 254, 254], 6, 2);
sequence.toArray(1) //[ 1, 0, 1, 0, 1, 0 ]
```
