const { expect } = require('chai');
const { ConfigValidator } = require('../src/hideUnwantedActivity.user');

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

    it('should validate a valid configuration without errors', () => {
        const validator = new ConfigValidator(defaultConfig);
        expect(() => validator.validate()).to.not.throw();
        expect(validator.errors).to.be.an('array').that.is.empty;
    });

    it('should validate boolean keys correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                uncommented: 'invalid',
                unliked: 123,
                text: 'invalid',
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be a boolean/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate positive non-zero integers correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            options: {
                targetLoadCount: -1,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be a positive non-zero integer/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate array keys correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                containsStrings: 'invalid',
                notContainsStrings: 'invalid',
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be an array/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions with strings correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            options: {
                linkedConditions: ['invalid', 'unliked'],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions inner array with strings correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            options: {
                linkedConditions: [['invalid', 'unliked']],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions array with boolean correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            options: {
                linkedConditions: [true],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions inner array with boolean correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            options: {
                linkedConditions: [[true]],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate string based removal correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                containsStrings: [true],
                notContainsStrings: [true],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate string based removal with inner arrays correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                containsStrings: [[true]],
                notContainsStrings: [[true]],
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });
});