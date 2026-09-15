import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { getAgents } from './loadOptions/getAgents';
import { getMcpServers } from './loadOptions/getMcpServers';
import { getMcpTools } from './loadOptions/getMcpTools';
import { getProcesses } from './loadOptions/getProcesses';
import { getTasks } from './loadOptions/getTasks';
import { agentDescription } from './resources/agent';
import { callDescription } from './resources/call';
import { channelSettingDescription } from './resources/channelSetting';
import { configurationDescription } from './resources/configuration';
import { faqDescription } from './resources/faq';
import { glossaryDescription } from './resources/glossary';
import { mailDescription } from './resources/mail';
import { mcpDescription } from './resources/mcp';
import { processDescription } from './resources/process';
import { promptDescription } from './resources/prompt';
import { redirectDescription } from './resources/redirect';
import { statisticDescription } from './resources/statistic';
import { taskDescription } from './resources/task';
import { utteranceDescription } from './resources/utterance';
import { BASE_URL_EXPRESSION } from './shared/constants';

export class Ilai implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ILAI',
		name: 'ilai',
		icon: { light: 'file:../../icons/ilai.svg', dark: 'file:../../icons/ilai.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the ILAI (Impact Labs AI) API',
		defaults: {
			name: 'ILAI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ilaiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: BASE_URL_EXPRESSION,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'call',
				options: [
					{ name: 'Agent', value: 'agent' },
					{ name: 'Call', value: 'call' },
					{ name: 'Channel Setting', value: 'channelSetting' },
					{ name: 'Configuration', value: 'configuration' },
					{ name: 'FAQ', value: 'faq' },
					{ name: 'Glossary', value: 'glossary' },
					{ name: 'Mail', value: 'mail' },
					{ name: 'MCP', value: 'mcp' },
					{ name: 'Process', value: 'process' },
					{ name: 'Prompt', value: 'prompt' },
					{ name: 'Redirect', value: 'redirect' },
					{ name: 'Statistic', value: 'statistic' },
					{ name: 'Task', value: 'task' },
					{ name: 'Utterance', value: 'utterance' },
				],
			},
			...agentDescription,
			...callDescription,
			...channelSettingDescription,
			...configurationDescription,
			...faqDescription,
			...glossaryDescription,
			...mailDescription,
			...mcpDescription,
			...processDescription,
			...promptDescription,
			...redirectDescription,
			...statisticDescription,
			...taskDescription,
			...utteranceDescription,
		],
	};

	methods = {
		loadOptions: {
			getAgents,
			getMcpServers,
			getMcpTools,
			getProcesses,
			getTasks,
		},
	};
}
