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
        const validConfig = {
            remove: {
                uncommented: false,
                unliked: false,
                text: false,
                images: false,
                videos: false,
                containsStrings: ['A'],
                notContainsStrings: [['B']],
            },
            options: {
                targetLoadCount: 10,
                caseSensitive: false,
                linkedConditions: ['text'],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        };

        const validator = new ConfigValidator(validConfig);
        expect(() => validator.validate()).to.not.throw();
        expect(validator.errors).to.be.an('array').that.is.empty;
    });

    it('should validate boolean keys correctly', () => {
        const invalidConfig = {
            remove: {
                uncommented: 'invalid',
                unliked: 123,
                text: 'invalid',
                images: false,
                videos: false,
                containsStrings: ['A'],
                notContainsStrings: [['B']],
            },
            options: {
                targetLoadCount: 10,
                caseSensitive: false,
                linkedConditions: ['text'],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        };

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be a boolean/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate positive non-zero integers correctly', () => {
        const invalidConfig = {
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
                targetLoadCount: 0,
                caseSensitive: false,
                linkedConditions: [],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        };

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be a positive non-zero integer/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate array keys correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                uncommented: false,
                unliked: false,
                text: false,
                images: false,
                videos: false,
                containsStrings: 'invalid',
                notContainsStrings: 'invalid',
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
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should be an array/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions with strings correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
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
                linkedConditions: ['invalid', 'unliked'],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions inner array with strings correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
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
                linkedConditions: [['invalid', 'unliked']],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions array with boolean correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
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
                linkedConditions: [true],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate linked conditions inner array with boolean correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
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
                linkedConditions: [[true]],
            },
            runOn: {
                home: false,
                social: false,
                profile: false,
            },
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain the following strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate string based removal correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                uncommented: false,
                unliked: false,
                text: false,
                images: false,
                videos: false,
                containsStrings: [true],
                notContainsStrings: [true],
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
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });

    it('should validate string based removal with inner arrays correctly', () => {
        const invalidConfig = Object.assign({}, defaultConfig, {
            remove: {
                uncommented: false,
                unliked: false,
                text: false,
                images: false,
                videos: false,
                containsStrings: [[true]],
                notContainsStrings: [[true]],
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
        });

        const validator = new ConfigValidator(invalidConfig);
        expect(() => validator.validate()).to.throw(/should only contain strings/);
        expect(validator.errors).to.be.an('array').that.is.not.empty;
    });
});