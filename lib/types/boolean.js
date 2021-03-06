'use strict';

const Hoek = require('@hapi/hoek');

const Any = require('./any');
const Values = require('../values');
const Utils = require('../utils');


const internals = {};


internals.Boolean = class extends Any {

    constructor() {

        super();

        this._type = 'boolean';
        this._flags.insensitive = true;
        this._inner.truthySet = new Values();
        this._inner.falsySet = new Values();
    }

    _base(value, state, options) {

        const result = {
            value,
            errors: null
        };

        if (typeof value === 'string' &&
            options.convert) {

            const normalized = this._flags.insensitive ? value.toLowerCase() : value;
            result.value = normalized === 'true' ? true : (normalized === 'false' ? false : value);
        }

        if (typeof result.value !== 'boolean') {
            const converted = this._inner.truthySet.has(value, null, null, this._flags.insensitive) ||
                (this._inner.falsySet.has(value, null, null, this._flags.insensitive) ? false : value);

            if (converted !== value &&
                !options.convert) {

                result.errors = this.createError('boolean.cast', { value }, state, options);
                return result;
            }

            result.value = converted;
        }

        if (typeof result.value !== 'boolean') {
            result.errors = this.createError('boolean.base', { value }, state, options);
        }

        return result;
    }

    truthy(...values) {

        Utils.verifyFlat(values, 'truthy');

        const obj = this.clone();
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];

            Hoek.assert(value !== undefined, 'Cannot call truthy with undefined');
            obj._inner.truthySet.add(value);
        }

        return obj;
    }

    falsy(...values) {

        Utils.verifyFlat(values, 'falsy');

        const obj = this.clone();
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];

            Hoek.assert(value !== undefined, 'Cannot call falsy with undefined');
            obj._inner.falsySet.add(value);
        }

        return obj;
    }

    insensitive(enabled) {

        const insensitive = enabled === undefined ? true : !!enabled;

        if (this._flags.insensitive === insensitive) {
            return this;
        }

        const obj = this.clone();
        obj._flags.insensitive = insensitive;
        return obj;
    }

    describe() {

        const description = super.describe();
        description.truthy = [true, ...this._inner.truthySet.values()];
        description.falsy = [false, ...this._inner.falsySet.values()];
        return description;
    }
};


module.exports = new internals.Boolean();
