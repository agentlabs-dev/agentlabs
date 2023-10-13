import { Module } from '@nestjs/common';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatMessagesService } from './chat-messages.service';

@Module({
  imports: [ConversationsModule],
  providers: [ChatMessagesService],
  exports: [ChatMessagesService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
