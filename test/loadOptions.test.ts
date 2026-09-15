import type { ILoadOptionsFunctions } from 'n8n-workflow';

import { getAgents } from '../nodes/Ilai/loadOptions/getAgents';
import { getMcpServers } from '../nodes/Ilai/loadOptions/getMcpServers';
import { getMcpTools } from '../nodes/Ilai/loadOptions/getMcpTools';
import { getProcesses } from '../nodes/Ilai/loadOptions/getProcesses';
import { getTasks } from '../nodes/Ilai/loadOptions/getTasks';
import { ilaiApiRequest } from '../nodes/Ilai/shared/transport';

type RequestOptions = { method: string; url: string; qs: Record<string, unknown> };

function mockContext(options: {
	response?: unknown;
	baseUrl?: string;
	parameters?: Record<string, unknown>;
}) {
	const httpRequestWithAuthentication = jest.fn().mockResolvedValue(options.response ?? []);

	const context = {
		getCredentials: jest
			.fn()
			.mockResolvedValue({ baseUrl: options.baseUrl ?? 'https://tenant.example.com', apiKey: 'k' }),
		getNodeParameter: jest.fn((name: string) => options.parameters?.[name]),
		helpers: { httpRequestWithAuthentication },
	} as unknown as ILoadOptionsFunctions;

	return { context, httpRequestWithAuthentication };
}

function lastRequest(mock: jest.Mock): RequestOptions {
	return mock.mock.calls[mock.mock.calls.length - 1][1] as RequestOptions;
}

describe('ilaiApiRequest', () => {
	it('builds the URL from the credentials and authenticates', async () => {
		const { context, httpRequestWithAuthentication } = mockContext({ response: { ok: true } });

		const result = await ilaiApiRequest.call(context, 'GET', '/api/v1/agents/');

		expect(result).toEqual({ ok: true });
		expect(httpRequestWithAuthentication.mock.calls[0][0]).toBe('ilaiApi');
		expect(lastRequest(httpRequestWithAuthentication)).toMatchObject({
			method: 'GET',
			url: 'https://tenant.example.com/api/v1/agents/',
		});
	});

	it('strips trailing slashes from the base URL', async () => {
		const { context, httpRequestWithAuthentication } = mockContext({
			baseUrl: 'https://tenant.example.com///',
		});

		await ilaiApiRequest.call(context, 'GET', '/api/v1/process/unique');

		expect(lastRequest(httpRequestWithAuthentication).url).toBe(
			'https://tenant.example.com/api/v1/process/unique',
		);
	});

	it('passes the query string through', async () => {
		const { context, httpRequestWithAuthentication } = mockContext({});

		await ilaiApiRequest.call(context, 'GET', '/api/v1/mcp/tools', { server_id: 7 });

		expect(lastRequest(httpRequestWithAuthentication).qs).toEqual({ server_id: 7 });
	});
});

describe('getProcesses', () => {
	it('maps the distinct process names to options', async () => {
		const { context, httpRequestWithAuthentication } = mockContext({
			response: ['Default', 'Billing'],
		});

		const options = await getProcesses.call(context);

		expect(lastRequest(httpRequestWithAuthentication).url).toBe(
			'https://tenant.example.com/api/v1/process/unique',
		);
		expect(options).toEqual([
			{ name: 'Default', value: 'Default' },
			{ name: 'Billing', value: 'Billing' },
		]);
	});

	it('skips empty entries and handles an empty response', async () => {
		const { context } = mockContext({ response: ['Default', '', null] });

		await expect(getProcesses.call(context)).resolves.toEqual([
			{ name: 'Default', value: 'Default' },
		]);
	});
});

describe('getAgents', () => {
	it('prefers the display name and falls back to the SIP name', async () => {
		const { context } = mockContext({
			response: [
				{ id: 1, sip_display_name: 'Reception', sip_name: 'reception', process: 'Default' },
				{ id: 2, sip_display_name: null, sip_name: 'billing', process: 'Billing' },
				{ id: 3, sip_display_name: null, sip_name: null, process: 'Sales' },
			],
		});

		await expect(getAgents.call(context)).resolves.toEqual([
			{ name: 'Reception', value: 1 },
			{ name: 'billing', value: 2 },
			{ name: 'Sales (3)', value: 3 },
		]);
	});

	it('ignores agents without an ID', async () => {
		const { context } = mockContext({
			response: [{ id: null, sip_display_name: 'Draft', sip_name: null, process: null }],
		});

		await expect(getAgents.call(context)).resolves.toEqual([]);
	});
});

describe('getMcpServers', () => {
	it('maps servers to options', async () => {
		const { context } = mockContext({
			response: [
				{ id: 4, name: 'Ticket system' },
				{ id: null, name: 'Unsaved' },
			],
		});

		await expect(getMcpServers.call(context)).resolves.toEqual([
			{ name: 'Ticket system', value: 4 },
		]);
	});
});

describe('getMcpTools', () => {
	it('filters the tools by the selected server', async () => {
		const { context, httpRequestWithAuthentication } = mockContext({
			response: [{ id: 1, server_id: 7, name: 'create_ticket', description: 'Creates a ticket' }],
			parameters: { serverId: 7 },
		});

		const options = await getMcpTools.call(context);

		expect(lastRequest(httpRequestWithAuthentication).qs).toEqual({ server_id: 7 });
		expect(options).toEqual([
			{ name: 'create_ticket', value: 'create_ticket', description: 'Creates a ticket' },
		]);
	});
});

describe('getTasks', () => {
	it('maps scheduled tasks to options', async () => {
		const { context } = mockContext({
			response: [{ id: 'abc', name: 'Nightly import', task_type: 'faq_import' }],
		});

		await expect(getTasks.call(context)).resolves.toEqual([
			{ name: 'Nightly import', value: 'abc', description: 'faq_import' },
		]);
	});
});
