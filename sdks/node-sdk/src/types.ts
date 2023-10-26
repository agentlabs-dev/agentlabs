import { AttachmentItem } from './attachment';
import { HttpApi } from './http';
import { IncomingChatMessage } from './incoming-chat-message';
import { RealtimeClient } from './realtime';
import { EChartsOption } from './types/echart';

export interface AgentConfig {
    realtime: RealtimeClient;
	http: HttpApi;
    agentId: string;
}

export interface RawChatMessage {
    text: string;
    conversationId: string;
    messageId: string;
    agentId: string;
	member: Member;
}

export interface SendMessageOptions {
    format?: MessageFormat;
}

export type TypewriteMessageOptions = {
    format?: MessageFormat;
    intervalMs?: number;
    initialDelayMs?: number;
};


export type SendEchartOptions = {
	textFormat?: MessageFormat;
	echart: EChartsOption;
	conversationId: string;
	text?: string;
}

const MessageFormats = ['PlainText', 'Markdown'] as const;

export type MessageFormat = (typeof MessageFormats)[number];

export type OnChatMessageHandler = (message: IncomingChatMessage) => void | Promise<void>;

export type SendMessagePayload = {
    text: string;
    conversationId: string;
	attachments?: AttachmentItem[];
};

export interface AgentMessageStreamConfig {
    realtime: RealtimeClient;
    conversationId: string;
    agentId: string;
    format?: MessageFormat;
}

export interface Member {
	id: string,

	createdAt: string
	updatedAt: string,

	verifiedAt?: string
	bannedAt?: string

	firstName?: string,
	lastName?: string,
	fullName?: string,

	email?: string,
	isAnonymous?: boolean,

	profilePictureUrl?: string,

	projectId: string
}
