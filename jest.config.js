/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.test.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
	},
	collectCoverageFrom: ['nodes/**/*.ts', 'credentials/**/*.ts'],
	modulePathIgnorePatterns: ['<rootDir>/dist'],
	moduleFileExtensions: ['ts', 'js', 'json'],
};
