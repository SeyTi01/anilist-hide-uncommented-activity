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

    function generateMergedConfig(configOverrides) {
        return merge({}, defaultConfig, configOverrides);
    }

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
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.not.throw();
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate boolean keys correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                uncommented: 'invalid',
                unliked: 123,
                text: 'invalid',
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should be a boolean/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate positive non-zero integers correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                targetLoadCount: 0,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should be a positive non-zero integer/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate array keys correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: 'invalid',
                notContainsStrings: 'invalid',
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should be an array/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate array keys with non-array values correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                notContainsStrings: true,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should be an array/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate linked conditions with strings correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                linkedConditions: ['invalid', 'unliked'],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate linked conditions array with boolean correctly', () => {
        const invalidConfig = generateMergedConfig({
            options: {
                linkedConditions: [true],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate string-based removal correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: [true],
                notContainsStrings: [true],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });

    it('should validate string-based removal with inner arrays correctly', () => {
        const invalidConfig = generateMergedConfig({
            remove: {
                containsStrings: [[true]],
                notContainsStrings: [[true]],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        const errorsBeforeValidation = validator.errors.length;
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.have.length.at.least(errorsBeforeValidation);
    });
});