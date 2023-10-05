import { Injectable } from '@nestjs/common';
import { AgentConversation } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAgentChatConversationPayload,
  FindAllConversationsPayload,
} from './agent-chat-conversations.types';

@Injectable()
export class AgentChatConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllConversations({
    memberId,
    agentId,
  }: FindAllConversationsPayload): Promise<AgentConversation[]> {
    return await this.prisma.agentConversation.findMany({
      where: {
        agentId,
        memberId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isConversationOwner({
    memberId,
    conversationId,
  }: {
    memberId: string;
    conversationId: string;
  }) {
    const count = await this.prisma.agentConversation.count({
      where: {
        id: conversationId,
        memberId,
      },
    });

    return count > 0;
  }

  async createConversation(
    payload: CreateAgentChatConversationPayload,
  ): Promise<AgentConversation> {
    const conversation = await this.prisma.agentConversation.create({
      data: {
        memberId: payload.memberId,
        agentId: payload.agentId,
      },
    });

    return conversation;
  }

  async findConversationById(id: string): Promise<AgentConversation | null> {
    const conversation = await this.prisma.agentConversation.findUnique({
      where: {
        id,
      },
    });

    return conversation;
  }

  async findConversationByIdWithMessages(id: string) {
    const conversation = await this.prisma.agentConversation.findUnique({
      where: {
        id,
      },
      include: {
        messages: true,
      },
    });

    return conversation;
  }

  async findConversationByIdWithAgent(id: string) {
    const conversation = await this.prisma.agentConversation.findUnique({
      where: {
        id,
      },
      include: {
        agent: true,
      },
    });

    return conversation;
  }
}
