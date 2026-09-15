import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import {
	allLoadOptionsMethods,
	description,
	ilai,
	operationsFor,
	properties,
	resourceValues,
} from './helpers/node';

describe('ILAI node description', () => {
	it('declares the expected node metadata', () => {
		expect(description.name).toBe('ilai');
		expect(description.displayName).toBe('ILAI');
		expect(description.version).toBe(1);
		expect(description.usableAsTool).toBe(true);
		expect(description.credentials).toEqual([{ name: 'ilaiApi', required: true }]);
	});

	it('resolves the base URL from the credentials', () => {
		expect(description.requestDefaults?.baseURL).toBe(
			'={{ $credentials.baseUrl.replace(/\\/+$/, "") }}',
		);
		expect(description.requestDefaults?.headers).toMatchObject({
			Accept: 'application/json',
			'Content-Type': 'application/json',
		});
	});

	it('strips trailing slashes from the configured base URL', () => {
		const expression = description.requestDefaults?.baseURL as string;
		const body = expression.replace(/^=\{\{/, '').replace(/\}\}$/, '');
		// Test-only evaluation of an expression this repository defines itself.
		// eslint-disable-next-line @n8n/community-nodes/no-dangerous-functions
		const evaluate = new Function('$credentials', `return ${body};`) as (credentials: {
			baseUrl: string;
		}) => string;

		expect(evaluate({ baseUrl: 'https://tenant.cockpit.impact-labs.ai/' })).toBe(
			'https://tenant.cockpit.impact-labs.ai',
		);
		expect(evaluate({ baseUrl: 'https://tenant.cockpit.impact-labs.ai///' })).toBe(
			'https://tenant.cockpit.impact-labs.ai',
		);
		expect(evaluate({ baseUrl: 'https://tenant.cockpit.impact-labs.ai' })).toBe(
			'https://tenant.cockpit.impact-labs.ai',
		);
	});

	it('exposes every documented resource', () => {
		expect(resourceValues).toEqual([
			'agent',
			'call',
			'channelSetting',
			'configuration',
			'faq',
			'glossary',
			'mail',
			'mcp',
			'process',
			'prompt',
			'redirect',
			'statistic',
			'task',
			'utterance',
		]);
	});

	it('uses a default resource that exists', () => {
		const resourceProperty = properties.find((property) => property.name === 'resource');
		expect(resourceValues).toContain(resourceProperty?.default);
	});

	it.each(resourceValues)('defines operations for the "%s" resource', (resource) => {
		const operations = operationsFor(resource);
		expect(operations.length).toBeGreaterThan(0);
	});

	it.each(resourceValues)('routes every "%s" operation to a request', (resource) => {
		for (const operation of operationsFor(resource)) {
			expect(operation.routing?.request?.method).toMatch(/^(DELETE|GET|PATCH|POST|PUT)$/);
			expect(operation.routing?.request?.url).toBeDefined();
			expect(operation.action).toBeDefined();
			expect(operation.description).toBeDefined();
		}
	});

	it.each(resourceValues)('uses an existing default operation for "%s"', (resource) => {
		const operationProperty = properties.find(
			(property) =>
				property.name === 'operation' &&
				(property.displayOptions?.show?.resource as string[])?.includes(resource),
		) as INodeProperties;

		const values = (operationProperty.options ?? []).map(
			(option) => (option as INodePropertyOptions).value,
		);

		expect(values).toContain(operationProperty.default);
	});

	it.each(resourceValues)('sorts the "%s" operations alphabetically', (resource) => {
		const names = operationsFor(resource).map((operation) => operation.name);
		expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
	});

	it('gives every property a default value', () => {
		const visit = (property: INodeProperties, path: string) => {
			expect(`${path}.${property.name}`).toBeDefined();
			expect(property.default).toBeDefined();

			for (const option of property.options ?? []) {
				if ('value' in option) continue;
				if ('values' in option) {
					option.values.forEach((value) => visit(value, `${path}.${property.name}`));
					continue;
				}
				visit(option as INodeProperties, `${path}.${property.name}`);
			}
		};

		properties.forEach((property) => visit(property, 'root'));
	});

	it('binds every property except the resource selector to a resource', () => {
		for (const property of properties) {
			if (property.name === 'resource') continue;
			expect(property.displayOptions?.show?.resource).toBeDefined();
		}
	});

	it('only references load options methods that are implemented', () => {
		const implemented = Object.keys(ilai.methods.loadOptions);
		for (const method of allLoadOptionsMethods()) {
			expect(implemented).toContain(method);
		}
	});

	it('implements only load options methods that are referenced', () => {
		const referenced = allLoadOptionsMethods();
		for (const method of Object.keys(ilai.methods.loadOptions)) {
			expect(referenced).toContain(method);
		}
	});

	// The conversation record and the system configuration must not be writable from a workflow.
	// See the comments in the corresponding resource files.
	it.each(['agent', 'configuration', 'statistic'])(
		'exposes the "%s" resource read-only',
		(resource) => {
			for (const operation of operationsFor(resource)) {
				expect(operation.routing?.request?.method).toBe('GET');
			}
		},
	);

	it('never writes into an existing call', () => {
		const writes = operationsFor('call')
			.map((operation) => ({
				value: String(operation.value),
				method: operation.routing?.request?.method,
				url: operation.routing?.request?.url ?? '',
			}))
			.filter((operation) => operation.method !== 'GET');

		// Starting a call and deleting one (GDPR erasure) are allowed; everything else is not.
		expect(writes).toEqual([
			{ value: 'createOutbound', method: 'POST', url: '/api/v1/call/outbound' },
			{
				value: 'delete',
				method: 'DELETE',
				url: '=/api/v1/calls/{{ encodeURIComponent($parameter.callId) }}',
			},
		]);
	});

	it('hides the limit field when all results are requested', () => {
		const limitFields = properties.filter((property) => property.name === 'limit');
		expect(limitFields.length).toBeGreaterThan(0);

		for (const limitField of limitFields) {
			expect(limitField.displayOptions?.show?.returnAll).toEqual([false]);
			expect(limitField.description).toBe('Max number of results to return');
			expect(limitField.default).toBe(50);
		}
	});

	it('paginates the endpoints that support offsets', () => {
		const paginated = properties.filter(
			(property) => property.name === 'returnAll' && property.routing?.operations?.pagination,
		);

		expect(paginated.length).toBe(3);

		for (const property of paginated) {
			const pagination = property.routing?.operations?.pagination as {
				type: string;
				properties: { limitParameter: string; offsetParameter: string; pageSize: number };
			};

			expect(pagination.type).toBe('offset');
			expect(pagination.properties.pageSize).toBe(250);
			expect(property.routing?.send?.paginate).toBe('={{ $value }}');
		}
	});
});
