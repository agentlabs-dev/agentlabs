import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConversationsService } from 'src/conversations/conversations.service';
import { RequireAuthMethod } from 'src/iam/iam.decorators';
import { MemberAuthenticatedRequest } from 'src/iam/iam.types';
import { ChatMessagesService } from './chat-messages.service';

@ApiTags('chat-messages')
@Controller('chat-messages')
export class ChatMessagesController {
  constructor(
    private readonly agentMessagesService: ChatMessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @RequireAuthMethod('member-token')
  @Get('listByConversationId/:conversationId')
  async listByConversationId(
    @Param('conversationId') conversationId: string,
    @Req() req: MemberAuthenticatedRequest,
  ) {
    const isOwner = await this.conversationsService.isConversationOwner({
      conversationId,
      memberId: req.member.id,
    });

    if (!isOwner) {
      throw new ForbiddenException(
        'You are not allowed to access this conversation',
      );
    }

    return this.agentMessagesService.listByConversationId(conversationId);
  }
}
