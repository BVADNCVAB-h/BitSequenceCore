    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            define([], factory);
        } else if (typeof module === 'object' && module.exports) {
            module.exports = factory();
        } else {
            root.BitSequenceCore = factory();
        }
    })(this, function() {
'use strict';
return function() {
    var self = this;
    var INT_BYTE_SIZE = 8;
    var EXT_BYTE_SIZE = 8;
    var STRING_BYTE_SIZE = 8;
    var bitLength = 0;
    var rawdata = [];
    this.getSequence = function( lowerBit, upperBit ) {
        var value = 0;
        var lowerIndex = Math.floor( lowerBit / INT_BYTE_SIZE );
        var lowerShift = lowerBit % INT_BYTE_SIZE;
        var upperIndex = Math.floor( upperBit / INT_BYTE_SIZE );
        var upperShift = upperBit % INT_BYTE_SIZE;
        var dataUpperIndex = Math.floor( (bitLength-1) / INT_BYTE_SIZE );
        var valueConsumed = 1, rawDataVal;
        for ( var i=upperIndex; i >= lowerIndex; i-- ) {
            var leftShift = 0, rightShift = INT_BYTE_SIZE - 1, rawDataVal = 0;
            var currByteDefined = ( i <= dataUpperIndex && rawdata[ i ] !== undefined );
            if ( currByteDefined ) rawDataVal = rawdata[ i ];
            if ( i == upperIndex ) rightShift = upperShift;
            if ( i == lowerIndex ) leftShift = lowerShift;
            var bitsToConsume = rightShift - leftShift + 1;
            rawDataVal >>= (INT_BYTE_SIZE - rightShift - 1);
            rawDataVal &= (1 << bitsToConsume)-1;
            rawDataVal *= valueConsumed;
            valueConsumed *= Math.pow( 2, bitsToConsume );
            value += rawDataVal;
        }
        return value;
    };
    this.setSequence = function( lowerBit, upperBit, value ) {
        var lowerIndex = Math.floor( lowerBit / INT_BYTE_SIZE );
        var lowerShift = lowerBit % INT_BYTE_SIZE;
        var upperIndex = Math.floor( upperBit / INT_BYTE_SIZE );
        var upperShift = upperBit % INT_BYTE_SIZE;
        var dataUpperIndex = Math.floor( (bitLength-1) / INT_BYTE_SIZE );
        var valueConsumed = 1, valueToConsume, rawDataVal;
        for ( var i=upperIndex; i >= lowerIndex; i-- ) {
            var leftShift = 0, rightShift = INT_BYTE_SIZE - 1, rawDataVal = 0;
            var currByteDefined = ( i <= dataUpperIndex && rawdata[ i ] !== undefined );
            if ( currByteDefined ) rawDataVal = rawdata[ i ];
            if ( i == upperIndex ) rightShift = upperShift;
            if ( i == lowerIndex ) leftShift = lowerShift;
            var bitsToConsume = rightShift - leftShift + 1;
            var leftRemValue = rawDataVal, rightRemValue = rawDataVal;
            var leftRevShift = INT_BYTE_SIZE - leftShift;
            var rightRevShift = INT_BYTE_SIZE - rightShift - 1;
            leftRemValue >>= leftRevShift;
            leftRemValue <<= leftRevShift;
            rightRemValue &= (1 << rightRevShift)-1;
            valueToConsume = valueConsumed * Math.pow( 2, bitsToConsume );
            var replacingValue = value % valueToConsume;
            replacingValue = Math.floor( replacingValue / valueConsumed );
            replacingValue <<= rightRevShift;
            valueConsumed = valueToConsume;
            rawdata[ i ] = leftRemValue + replacingValue + rightRemValue;
        }
        if ( upperBit+1 > bitLength ) bitLength = upperBit+1;
        return true;
    };
    this.getIterator = function() {
        return new (function() {
            var pointer = 0;
            this.bitsLeft = function() {
                return bitLength - pointer;
            };
            this.hasNext = function() {
                return pointer < bitLength;
            };
            this.getNext = function( bitNumber ) {
                var lowerBit = pointer;
                var upperBit = pointer + bitNumber - 1;
                var value = self.getSequence( lowerBit, upperBit );
                pointer = upperBit + 1;
                return value;
            };
            this.setNext = function( bitNumber, value ) {
                var lowerBit = pointer;
                var upperBit = pointer + bitNumber - 1;
                self.setSequence( lowerBit, upperBit, value );
                pointer = upperBit + 1;
                return this;
            };
            this.shift = function( bitNumber ) {
                pointer += bitNumber;
                if ( pointer < 0 ) pointer = 0;
                if ( pointer > bitLength ) pointer = bitLength;
                return this;
            }
        })();
    };
    var convertArray = function( srcArray, bitLength, srcByteSize, destByteSize ) {
        var destArray = [];
        var srcIndex = -1, srcByteLeft = 0;
        var destIndex = -1, destByteLeft = 0;
        var srcCell, destCell, bytesToRead=0;
        var bitsLeft = bitLength;
        while ( true ) {
            srcByteLeft -= bytesToRead;
            destByteLeft -= bytesToRead;
            bitsLeft -= bytesToRead;
            if ( srcByteLeft == 0 ) {
                srcIndex++;
                srcByteLeft = srcByteSize;
                var isSet = (srcArray[ srcIndex ] !== undefined);
                if ( isSet ) srcCell = srcArray[ srcIndex ];
                else srcCell = 0;
            }
            if ( destByteLeft == 0 || bitsLeft <= 0 ) {
                if ( destIndex >= 0 ) destArray[ destIndex ] = destCell;
                destIndex++;
                destByteLeft = destByteSize;
                destCell = 0;
            }
            if ( bitsLeft <= 0 ) break;
            /*---------------------------------------------------------------------*/
            bytesToRead = (srcByteLeft > destByteLeft) ? destByteLeft : srcByteLeft;
            if ( bitsLeft < bytesToRead ) bytesToRead = bitsLeft;
            var addt = srcCell >> (srcByteLeft - bytesToRead);
            addt &= (1 << bytesToRead)-1;
            addt <<= (destByteLeft - bytesToRead);
            destCell += addt;
            /*---------------------------------------------------------------------*/
        }
        return destArray;
    };
    this.toArray = function( destByteSize ) {
        if ( destByteSize === undefined ) destByteSize = EXT_BYTE_SIZE;
        return convertArray( rawdata, bitLength, INT_BYTE_SIZE, destByteSize );
    };
    this.fromArray = function( srcArray, srcBitLength, srcByteSize ) {
        if ( isNaN(+srcBitLength) ) return null;
        if ( srcByteSize === undefined ) srcByteSize = EXT_BYTE_SIZE;
        rawdata = convertArray( srcArray, srcBitLength, srcByteSize, INT_BYTE_SIZE );
        bitLength = srcBitLength;
        return this;
    };
    this.toString = function( destByteSize ) {
        if ( destByteSize === undefined ) destByteSize = STRING_BYTE_SIZE;
        var charArray = [];
        var destArray = this.toArray( destByteSize );
        for ( var i=0; i < destArray.length; i++ ) {
            charArray[i] = String.fromCharCode( destArray[i] );
        }
        return charArray.join("");
    };
    this.fromString = function( srcString, srcBitLength, srcByteSize ) {
        if ( isNaN(+srcBitLength) ) return null;
        if ( srcByteSize === undefined ) srcByteSize = STRING_BYTE_SIZE;
        var srcArray = [];
        for ( var i=0; i < srcString.length; i++ ) {
            srcArray[ i ] = srcString.charCodeAt( i );
        }
        return this.fromArray( srcArray, srcBitLength, srcByteSize );
    };
    this.bitLength = function() {
        return bitLength;
    };
};
    });