# BitSequenceCore
A tool for applying different markups to a given sequence of bits in order to retrieve numeric values. It can be used e.g. for  packing and unpacking numeric values into/from strings.
The library functionality is similar to that of bit fields in C++, implemented with a different interface.

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

#### Saving the bit sequence to an array or a string:
```javascript
<dest_array> = sequence.toArray([<array_element_size>=8]);
<dest_string> = sequence.toString([<string_char_size>=8]);
```

#### Forming a bit sequence by a consecution of numbers:
```javascript
it.setNext(<field_bit_length>, <value>);
```

#### Consecutively retrieving numeric values from the bit sequence:
```javascript
while ( it.hasNext() )
{ <value> = it.getNext(<field_bit_length>); }
```

#### Constructor:
```javascript
function BitSequenceCore() {}
```

#### Interface:
```javascript
function getSequence(lowerBit, upperBit) {}
function setSequence(lowerBit, upperBit, value) {}
function getIterator() {}
function toArray(/**default=8**/destByteSize) {}
function fromArra(srcArray, srcBitLength, /**default=8**/srcByteSize) {}
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

#### Commentary on iterator:
functions getNext() and setNext() move the cursor of the iterator by itself;
function shift() moves the cursor in forward (if positive argument passed)
or backward (if negative one passed) directions;
bitsLeft() returns difference between the current cursor position and the sequence length;

#### Example:
```javascript
/**extracting numeric values from base64 string:**/
var string = String.fromCharCode(97, 98, 99, 100); //"abcd"
var base64Str = btoa(string); //"YWJjZA=="
var binaryStr = atob(base64Str); //"abcd"
var sequence = new BitSequenceCore();
sequence.fromString(binaryStr, binaryStr.length*8);
var markup = [ 8, 8, 8, 8 ], i=0;
var values = [];
var it = sequence.getIterator();
while ( it.hasNext() ) {
    values.push( it.getNext(markup[i]) );
    if ( ++i == markup.length ) i = 0;
}
console.log( values ) //[ 97, 98, 99, 100 ];
/**packing numeric values (extracted) into base64 string:**/
var sequence2 = new BitSequenceCore();
var it2 = sequence2.getIterator();
for ( var j=0, i=0; j < values.length; j++ ) {
    it2.setNext(markup[i], values[j]);
    if ( ++i == markup.length ) i = 0;
}
var binaryStr2 = sequence2.toString(); //"abcd"
var base64Str2 = btoa(binaryStr2); //"YWJjZA=="
```

#### Commentary on the way value is set:
The argument(s) of the setter functions defines an interval in which the value will be inserted. The interval is initially filled with zeros, the value is added to the right side of the interval and if the value exceeds the boundaries it is cut from the left side.

#### Description of functions getSequence() and setSequence():
These functions permit to get access to a random part of the sequence.
The first and the second arguments define an interval (inclusive both ends) to be operated on.
Example:
```javascript
sequence.setSequence( 4, 11, 255 );
sequence.getSequence( 8, 11 ); //15
sequence.toArray(); //[ 15, 240 ]
```

#### Commentary on functions fromArray() and fromString():
These functions flush previous bit sequence.
The second argument defines the number of bits that should be added and it's mandatory.
For example, the following will add all but two last bits from the string:
```javascript
sequence.fromString("abc", 22);
```
The third parameter is optional and sets "length of byte" in the sense of which length is occupied by each array element 
or string's character, with a default value of 8.
For example, if binary data is packed in a string with UTF-16 characters
it can be declared as follow:
```javascript
sequence.fromString("abc", 22, 16); 
/**it extracts 16 bits from the first character 
and 6 bits (from the left side) from the second one.**/
```
#### It's worth mentioning that in many cases (for e.g. in the case of functions atob() and btoa()) functions work only with 8-bit characters and produce strings with 8-bit characters and nonetheless characters of the JavaScript strings is 16-bit, only the 8 bits from the right side of each character in such cases should be taken into account i.e. added to the sequence.
The third parameter can take any value 
Excessive data of the array element or character is cut from the left side,
insufficient data is completed with zeros from the left side and 
then the defined number of bits is read.
For examples, the following takes only first two (from the right) 
bits from each array element:
```javascript
sequence.fromArray([254, 254, 254], 6, 2);
/**sequence.toArray(1) //[ 1, 0, 1, 0, 1, 0 ] **/
```


