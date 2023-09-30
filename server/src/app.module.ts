import { Module } from '@nestjs/common';
import { AgentChatModule } from './agent-chat/agent-chat.module';
import { AgentConnectionManagerModule } from './agent-connection-manager/agent-connection-manager.module';
import { AgentConnectionModule } from './agent-connection/agent-connection.module';
import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMethodsModule } from './auth-methods/auth-methods.module';
import { ConfigModule } from './config/config.module';
import { FrontendConnectionManagerModule } from './frontend-connection-manager/frontend-connection-manager.module';
import { FrontendConnectionModule } from './frontend-connection/frontend-connection.module';
import { IamModule } from './iam/iam.module';
import { MembersModule } from './members/members.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    IamModule,
    ProjectsModule,
    AgentsModule,
    AuthMethodsModule,
    AgentConnectionManagerModule,
    FrontendConnectionManagerModule,
    AgentConnectionModule,
    FrontendConnectionModule,
    AgentChatModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
