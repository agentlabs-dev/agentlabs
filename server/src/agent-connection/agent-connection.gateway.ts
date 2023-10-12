import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AgentChatConversationsService } from 'src/agent-chat/agent-chat-conversations/agent-chat-conversations.service';
import { AgentChatMessagesService } from 'src/agent-chat/agent-chat-messages/agent-chat-messages.service';
import { AgentConnectionManagerService } from 'src/agent-connection-manager/agent-connection-manager.service';
import { AgentsService } from 'src/agents/agents.service';
import { BaseRealtimeMessageDto } from 'src/common/base-realtime-message.dto';
import { FrontendConnectionManagerService } from 'src/frontend-connection-manager/frontend-connection-manager.service';
import { SdkSecretsService } from '../sdk-secrets/sdk-secrets.service';
import { AgentStreamManagerService } from './agent-stream-manager/agent-stream-manager.service';
import { ConversationMutexManager } from './conversation-mutex-manager';
import { AgentMessageDto } from './dto/agent-message.dto';
import { StreamChatMessageTokenDto } from './dto/stream-chat-message-token.dto';

@WebSocketGateway({ namespace: '/agent' })
export class AgentConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly conversationMutexManager = new ConversationMutexManager();

  constructor(
    private readonly agentConnectionManagerService: AgentConnectionManagerService,
    private readonly frontendConnectionManagerService: FrontendConnectionManagerService,
    private readonly conversationsService: AgentChatConversationsService,
    private readonly messagesService: AgentChatMessagesService,
    private readonly agentsService: AgentsService,
    private readonly sdkSecretsService: SdkSecretsService,
    private readonly streamManager: AgentStreamManagerService,
  ) {}

  private readonly logger = new Logger(AgentConnectionGateway.name);

  async handleConnection(client: Socket) {
    const projectId = client.handshake.headers['x-agentlabs-project-id'];
    const agentId = client.handshake.headers['x-agentlabs-agent-id'];
    const secret = client.handshake.headers['x-agentlabs-sdk-secret'];

    this.logger.debug(
      `Client connected: SID=${client.id},AGENT=${agentId},PROJECT=${projectId}`,
    );

    if (typeof projectId !== 'string') {
      const message =
        'Missing header: X-AgentLabs-Project-Id, closing connection';

      this.logger.error('Client disconnected: MISSING_PROJECT_ID');
      client.send({
        message,
      });
      client.disconnect(true);
      return;
    }

    if (typeof agentId !== 'string') {
      const message =
        'Missing header: X-AgentLabs-Agent-Id, closing connection';
      this.logger.error('Client disconnected: MISSING_AGENT_ID');
      client.send({
        message,
      });
      client.disconnect(true);
      return;
    }

    if (typeof secret !== 'string') {
      const message =
        'Missing header: x-agentlabs-sdk-secret, closing connection';
      this.logger.error('Client disconnected: MISSING_SDK_SECRET');
      client.send({
        message,
      });
      client.disconnect(true);
      return;
    }

    /*
    const isAuthorized = await this.sdkSecretsService.verifySdkSecret(
      projectId,
      secret,
    );
	*/

    const isAuthorized = true;

    if (!isAuthorized) {
      const message = 'Invalid credentials, closing connection.';
      this.logger.error('Client disconnected: INVALID_CREDENTIALS');
      client.send({
        message,
      });
      client.disconnect(true);
      return;
    }

    const agent = await this.agentsService.findProjectAgent(projectId, agentId);

    if (!agent) {
      const message = `Agent not found: ID=${agentId},PROJECT_ID=${projectId}`;
      this.logger.error('Client disconnected: AGENT_NOT_FOUND');
      client.send({
        message,
      });
      client.disconnect(true);
      return;
    }

    if (this.agentConnectionManagerService.hasConnection(projectId, agentId)) {
      const message = `Agent ${agentId} is already connected to project ${projectId}`;

      this.logger.error('Client disconnected: ALREADY_CONNECTED');
      client.send({
        message,
      });
      client.disconnect(true);

      return;
    }

    this.agentConnectionManagerService.registerConnection({
      projectId,
      agentId,
      socket: client,
      ip: client.handshake.address,
    });

    client.send({
      message: `Agent ${agentId} connected successfully`,
    });
  }

  handleDisconnect(client: Socket) {
    this.agentConnectionManagerService.removeConnectionBySid(client.id);
    this.logger.debug(`Client disconnected: SID=${client.id}`);
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AgentMessageDto,
  ): Promise<BaseRealtimeMessageDto> {
    const conversation =
      await this.conversationsService.findConversationByIdWithAgent(
        payload.data.conversationId,
      );

    if (!conversation) {
      const message = `Conversation not found: ID=${payload.data.conversationId}`;

      this.logger.error(message);
      client.send({
        message,
      });

      return {
        message,
        timestamp: new Date().toISOString(),
        data: {},
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message,
        },
      };
    }

    try {
      await this.conversationMutexManager.acquire(conversation.id);

      const message = await this.messagesService.createMessage({
        conversationId: conversation.id,
        text: payload.data.text,
        source: 'AGENT',
        format: payload.data.format,
      });

      const frontendConnection =
        this.frontendConnectionManagerService.getConnection({
          memberId: conversation.memberId,
          projectId: conversation.agent.projectId,
          agentId: conversation.agent.id,
        });

      if (!frontendConnection) {
        const message = `Frontend connection not found: MEMBER_ID=${conversation.memberId},PROJECT_ID=${conversation.agent.projectId},AGENT_ID=${conversation.agent.id}`;

        this.logger.error(message);

        return {
          message,
          timestamp: new Date().toISOString(),
          data: {},
          error: {
            code: 'FRONTEND_CONNECTION_NOT_FOUND',
            message,
          },
        };
      }

      frontendConnection.socket.emit('chat-message', {
        timestamp: new Date().toISOString(),
        data: {
          conversationId: conversation.id,
          text: payload.data.text,
          format: payload.data.format,
          source: 'AGENT',
          messageId: message.id,
        },
      });

      return {
        message: 'Message sent successfully',
        timestamp: new Date().toISOString(),
        data: {},
      };
    } finally {
      this.conversationMutexManager.release(conversation.id);
    }
  }

  @SubscribeMessage('stream-chat-message-token')
  async handleStreamChatMessageToken(
    @MessageBody() payload: StreamChatMessageTokenDto,
  ) {
    await this.streamManager.handle({
      messageId: payload.data.messageId,
      conversationId: payload.data.conversationId,
      token: payload.data.text,
      format: payload.data.format,
    });
  }

  @SubscribeMessage('stream-chat-message-end')
  async handleStreamChatMessageEnd(@MessageBody() payload: any) {
    await this.streamManager.end(payload.data.messageId);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.logger.debug(`Client ${client.id} sent message: ${payload}`);
  }
}
