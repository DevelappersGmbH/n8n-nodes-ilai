import type { INodeProperties } from 'n8n-workflow';

import { properties } from './helpers/node';

/** Evaluates the JavaScript inside a single `{{ ... }}` n8n expression. */
function evaluate(expression: string, value: unknown): unknown {
	const body = expression.trim().replace(/^=\{\{/, '').replace(/\}\}$/, '');
	// Test-only evaluation of an expression this repository defines itself.
	// eslint-disable-next-line @n8n/community-nodes/no-dangerous-functions
	const run = new Function('$value', `return ${body};`) as (input: unknown) => unknown;
	return run(value);
}

function findProperty(name: string, predicate: (property: INodeProperties) => boolean) {
	const property = properties.find((candidate) => candidate.name === name && predicate(candidate));
	if (property) return property;

	for (const candidate of properties) {
		for (const option of candidate.options ?? []) {
			if ('value' in option || 'values' in option) continue;
			const nested = option as INodeProperties;
			if (nested.name === name && predicate(nested)) return nested;
		}
	}

	throw new Error(`Property "${name}" not found`);
}

describe('mail address expressions', () => {
	it.each(['toAddresses', 'ccAddresses', 'bccAddresses'])(
		'splits %s into a trimmed list of addresses',
		(name) => {
			const property = findProperty(name, (candidate) => Boolean(candidate.routing?.send?.value));
			const expression = property.routing?.send?.value as string;

			expect(evaluate(expression, 'a@example.com, b@example.com')).toEqual([
				'a@example.com',
				'b@example.com',
			]);
			expect(evaluate(expression, ' single@example.com ')).toEqual(['single@example.com']);
			expect(evaluate(expression, 'a@example.com,,')).toEqual(['a@example.com']);
			expect(evaluate(expression, '')).toEqual([]);
		},
	);

	it('sends the addresses to the properties the API expects', () => {
		const toAddresses = findProperty('toAddresses', () => true);
		expect(toAddresses.routing?.send?.property).toBe('to_addresses');
		expect(toAddresses.routing?.send?.type).toBe('body');
	});
});

describe('JSON parameters', () => {
	it('defaults to valid JSON', () => {
		const visit = (property: INodeProperties) => {
			if (property.type === 'json') {
				expect(() => JSON.parse(property.default as string)).not.toThrow();
			}

			for (const option of property.options ?? []) {
				if ('value' in option) continue;
				if ('values' in option) {
					option.values.forEach(visit);
					continue;
				}
				visit(option as INodeProperties);
			}
		};

		properties.forEach(visit);
	});
});

describe('URL templates', () => {
	it('encodes free text path parameters', () => {
		const encoded = properties
			.filter((property) => property.name === 'operation')
			.flatMap((property) => property.options ?? [])
			.map((option) => (option as { routing?: { request?: { url?: string } } }).routing)
			.map((routing) => routing?.request?.url ?? '')
			.filter((url) => url.includes('$parameter.callId') || url.includes('$parameter.taskId'));

		expect(encoded.length).toBeGreaterThan(0);
		for (const url of encoded) {
			expect(url).toContain('encodeURIComponent(');
		}
	});
});
