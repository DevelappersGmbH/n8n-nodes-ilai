import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { BASE_URL_EXPRESSION } from '../nodes/Ilai/shared/constants';

export class IlaiApi implements ICredentialType {
	name = 'ilaiApi';

	displayName = 'ILAI API';

	icon: Icon = { light: 'file:../icons/ilai.svg', dark: 'file:../icons/ilai.dark.svg' };

	documentationUrl = 'https://impact-labs.ai/';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'e.g. https://your-tenant.cockpit.impact-labs.ai',
			description: 'Base URL of your ILAI cockpit instance, without the /api/v1 path',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Bearer token for the ILAI API. Can be generated in the cockpit under Configuration > API Keys.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: BASE_URL_EXPRESSION,
			url: '/api/v1/agents/',
			method: 'GET',
		},
	};
}
