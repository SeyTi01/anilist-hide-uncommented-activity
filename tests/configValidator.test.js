const { expect } = require('chai');
const { ConfigValidator } = require('../src/hideUnwantedActivity.user');
const merge = require('lodash.merge');

describe('ConfigValidator', () => {
    const defaultConfig = {
        remove: {
            uncommented: false,
            unliked: false,
            text: false,
            images: false,
            videos: false,
            containsStrings: [],
            notContainsStrings: [],
        },
        options: {
            targetLoadCount: 10,
            caseSensitive: false,
            linkedConditions: [],
        },
        runOn: {
            home: false,
            social: false,
            profile: false,
        },
    };

    const generateMergedConfig = (configOverrides) => merge({}, defaultConfig, configOverrides);

    const validateAndCheckErrors = (config, errorMessage) => {
        const validator = new ConfigValidator(config);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(errorMessage);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    };

    it('should validate a valid configuration without errors', () => {
        const validConfig = generateMergedConfig({
            remove: {
                containsStrings: ['A'],
                notContainsStrings: [['A']],
            },
            options: {
                linkedConditions: ['text'],
            },
        });
        const validator = new ConfigValidator(validConfig);
        expect(() => validator.validate()).to.not.throw();
    });

    it('should validate boolean keys correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                uncommented: 'invalid',
                unliked: 123,
                text: 'invalid',
            },
        });
        validateAndCheckErrors(invalidConfig, /should be a boolean/);
    });

    it('should validate positive non-zero integers correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                targetLoadCount: 0,
            },
        });
        validateAndCheckErrors(invalidConfig, /should be a positive non-zero integer/);
    });

    it('should validate array keys correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: 'invalid',
                notContainsStrings: 'invalid',
            },
        });
        validateAndCheckErrors(invalidConfig, /should be an array/);
    });

    it('should validate array keys with non-array values correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: true,
            },
        });
        validateAndCheckErrors(invalidConfig, /should be an array/);
    });

    it('should validate linked conditions with strings correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                linkedConditions: ['invalid', 'unliked'],
            },
        });
        validateAndCheckErrors(invalidConfig, /should only contain the following strings/);
    });

    it('should validate linked conditions array with boolean correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                linkedConditions: [true],
            },
        });
        validateAndCheckErrors(invalidConfig, /should only contain the following strings/);
    });

    it('should validate string-based removal correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: [true],
                notContainsStrings: [true],
            },
        });
        validateAndCheckErrors(invalidConfig, /should only contain strings/);
    });

    it('should validate string-based removal with inner arrays correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: [[true]],
                notContainsStrings: [[true]],
            },
        });
        validateAndCheckErrors(invalidConfig, /should only contain strings/);
    });
});