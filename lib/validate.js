'use strict'
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const hexRegex = /^[0-9a-fA-F]+$/;
const alphanumRegex = /^[a-z0-9]+$/i;

const isString = data => typeof data === 'string' || value instanceof String;
const isNumber = data => !isNaN(data);
const isObject = data => data instanceof Object;
const matches = regex => (data) => isString(data) && regex.exec(data);

/** 
 * Checks if passed value is a TypedArray 
 * @param {TypedArray} array Value to check type of.
 * @returns {boolean} True if a TypedArray, False if not.
 */
const isTypedArray = array => ArrayBuffer.isView(array) && !(array instanceof DataView);

/** 
 * Checks if passed value is an Array Object or a Typed Array
 * @param {Array|TypedArray} array Value to check type of.
 * @returns {boolean} True if a TypedArray or Array Object, False if neither.
 */
const isArray = array => Array.isArray(array) || isTypedArray(array);

const hasALength = data => isArray(data) || isString(data);

const hasLengthInRange = (lowerBound, upperLimit) => data => hasALength(data) && data.length >= lowerBound && data.length < upperLimit;

const areNullOrUndefined = (...args) => args.some(value => value === null || value === undefined);

const type = {
    string: isString,
    number: isNumber,
    object: isObject,
    boolean: data => typeof data === 'boolean',
    nullOrUndefined: data => data === null || data === undefined,
    notNullOrUndefined: data => !(data === null || data === undefined),
    hex: matches(hexRegex),
    emailAddress: matches(emailRegex),
    alphanumeric: matches(alphanumRegex),
    typedArray: isTypedArray,
    array: isArray,
    function: obj => !!(obj && obj.constructor && obj.call && obj.apply),
}

const value = {
    matches: matches,
    //ofDigits: numberOfDigits => data => isNumber(data) 
    ofLengthInRange: hasLengthInRange,
    ofLength: length => hasLengthInRange(length, length + 1),
    inInterval: (lowerBound, upperLimit) => data => isNumber(data) && data >= lowerBound && data < upperLimit,
    equalTo: value => data => (data === value) ? (data !== 0 || 1 / data === 1 / value): (data !== data && value !== value),
    shallowEqualTo: obj => data => {
        if (equals(obj)(data)) return true;

        if (typeof data !== 'object' || data === null ||
            typeof obj !== 'object' || typeof obj === null
        ) {
            return false;
        }

        const dataKeys = Object.keys(data);
        const objKeys = Object.keys(obj);

        if (dataKeys.length !== objKeys.length) return false;

        for (let i = 0; i < dataKeys.length; i++) {
            if (obj.hasOwnProperty(dataKeys[i]) || !equals(data[dataKeys[i]])(obj[dataKeys[i]])) {
                return false;
            }
        }
        return true;
    },
}

const createPolicy = (...validators) => {
    if (validators.length === 0) throw new Error('Policy cannot be empty: No Validator Functions Provided');
    let invalidValidators = validators.map( validator => validator(null)).filter( output => typeof output !== 'boolean');
    if (invalidValidators.length > 0) throw new Error('Invalid Validator Function: Validators must return a boolean');

    return data => validators.every( validator => validator(data));
}

module.exports = {
    type,
    value,
    createPolicy,
    areNullOrUndefined
}