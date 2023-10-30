import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireAuthMethod } from '../iam/iam.decorators';
import { UserAuthenticatedRequest } from '../iam/iam.types';
import { TelemetryService } from '../telemetry/telemetry.service';
import { CreateSdkSecretDto } from './dtos/create.sdk-secret.dto';
import { CreatedSdkSecretDto } from './dtos/created.sdk-secret.dto';
import { ListSdkSecretDto } from './dtos/list.sdk-secret.dto';
import { RevokeSdkSecretDto } from './dtos/revoke.sdk-secret.dto';
import { SdkSecretsService } from './sdk-secrets.service';

@ApiTags('sdk-secrets')
@ApiBearerAuth()
@Controller('sdk-secrets')
export class SdkSecretsController {
  constructor(
    private readonly sdkSecretsService: SdkSecretsService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @ApiUnauthorizedResponse({
    description: 'You are not authorized to perform this action',
  })
  @RequireAuthMethod('user-token')
  @Post('/create')
  async create(
    @Req() req: UserAuthenticatedRequest,
    @Body() dto: CreateSdkSecretDto,
  ): Promise<CreatedSdkSecretDto> {
    const { user } = req;

    const result = await this.sdkSecretsService.createSecret({
      ...dto,
      creatorId: user.id,
    });

    if (result.ok) {
      this.telemetryService.trackConsoleUser({
        event: 'SDK Secret Created',
        userId: user.id,
        properties: {
          projectId: dto.projectId,
        },
      });
      return result.value;
    }

    switch (result.error) {
      case 'ProjectNotFound':
        throw new UnauthorizedException({
          code: 'ProjectNotFound',
          message: 'Project not found',
        });

      case 'NotAProjectUser':
        throw new UnauthorizedException({
          code: 'NotAProjectUser',
          message: 'You are not a member of this project',
        });
    }
  }

  @ApiUnauthorizedResponse({
    description: 'You are not authorized to perform this action',
  })
  @RequireAuthMethod('user-token')
  @Get('/listForProject/:projectId')
  async listForProject(
    @Req() req: UserAuthenticatedRequest,
    @Param('projectId') projectId: string,
  ): Promise<ListSdkSecretDto> {
    const { user } = req;

    const result = await this.sdkSecretsService.listForProject({
      userId: user.id,
      projectId: projectId,
    });

    if (result.ok) {
      return result.value;
    }

    switch (result.error) {
      case 'ProjectNotFound':
        throw new UnauthorizedException({
          code: 'ProjectNotFound',
          message: 'Project not found',
        });

      case 'NotAProjectUser':
        throw new UnauthorizedException({
          code: 'NotAProjectUser',
          message: 'You are not a member of this project',
        });
    }
  }

  @ApiUnauthorizedResponse({
    description: 'You are not authorized to perform this action',
  })
  @RequireAuthMethod('user-token')
  @Delete('/revokeById/:secretId')
  async revokedById(
    @Req() req: UserAuthenticatedRequest,
    @Param('secretId') secretId: string,
  ): Promise<RevokeSdkSecretDto> {
    const { user } = req;

    const result = await this.sdkSecretsService.revokeById({
      userId: user.id,
      secretId: secretId,
    });

    if (result.ok) {
      return result.value;
    }

    switch (result.error) {
      case 'ProjectNotFound':
        throw new UnauthorizedException({
          code: 'ProjectNotFound',
          message: 'Project not found',
        });

      case 'NotAProjectUser':
        throw new UnauthorizedException({
          code: 'NotAProjectUser',
          message: 'You are not a member of this project',
        });
    }
  }
}
