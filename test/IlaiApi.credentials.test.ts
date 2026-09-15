import { IlaiApi } from '../credentials/IlaiApi.credentials';
import { findSpecOperation, normalisePath } from './helpers/openapi';

describe('ILAI API credentials', () => {
	const credentials = new IlaiApi();

	it('declares the credential metadata', () => {
		expect(credentials.name).toBe('ilaiApi');
		expect(credentials.displayName).toBe('ILAI API');
		expect(credentials.icon).toEqual({
			light: 'file:../icons/ilai.svg',
			dark: 'file:../icons/ilai.dark.svg',
		});
	});

	it('asks for a base URL and an API key', () => {
		const names = credentials.properties.map((property) => property.name);
		expect(names).toEqual(['baseUrl', 'apiKey']);

		const apiKey = credentials.properties.find((property) => property.name === 'apiKey');
		expect(apiKey?.typeOptions?.password).toBe(true);
		expect(apiKey?.required).toBe(true);

		const baseUrl = credentials.properties.find((property) => property.name === 'baseUrl');
		expect(baseUrl?.required).toBe(true);
	});

	it('sends the API key as a bearer token', () => {
		expect(credentials.authenticate).toEqual({
			type: 'generic',
			properties: {
				headers: {
					Authorization: '=Bearer {{$credentials.apiKey}}',
				},
			},
		});
	});

	it('tests the credentials against an authenticated endpoint', () => {
		const request = credentials.test.request;

		expect(request.method).toBe('GET');
		expect(request.baseURL).toBe('={{ $credentials.baseUrl.replace(/\\/+$/, "") }}');
		expect(findSpecOperation('GET', normalisePath(request.url as string))).toBeDefined();
	});
});
