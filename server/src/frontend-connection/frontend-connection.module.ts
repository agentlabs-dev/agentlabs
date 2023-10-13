import { Module } from '@nestjs/common';
import { AgentMessagesModule } from 'src/agent-messages/agent-messages.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { FrontendConnectionManagerModule } from 'src/frontend-connection-manager/frontend-connection-manager.module';
import { MembersModule } from 'src/members/members.module';
import { ProjectBackendConnectionManagerModule } from 'src/project-backend-connection-manager/project-backend-connection-manager.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { FrontendConnectionGateway } from './frontend-connection.gateway';

@Module({
  imports: [
    ProjectBackendConnectionManagerModule,
    FrontendConnectionManagerModule,
    ConversationsModule,
    ProjectsModule,
    AgentMessagesModule,
    MembersModule,
  ],
  providers: [FrontendConnectionGateway],
})
export class FrontendConnectionModule {}
