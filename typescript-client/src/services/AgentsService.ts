/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAgentDto } from '../models/CreateAgentDto';
import type { CreatedAgentDto } from '../models/CreatedAgentDto';
import type { DeletedAgentResponseDto } from '../models/DeletedAgentResponseDto';
import type { DidAgentEverConnectResponse } from '../models/DidAgentEverConnectResponse';
import type { GetAgentResponseDto } from '../models/GetAgentResponseDto';
import type { ListAgentsResponseDto } from '../models/ListAgentsResponseDto';
import type { UpdateAgentDto } from '../models/UpdateAgentDto';
import type { UpdatedAgentDto } from '../models/UpdatedAgentDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AgentsService {

    /**
     * @returns CreatedAgentDto
     * @throws ApiError
     */
    public static createAgent({
        requestBody,
    }: {
        requestBody: CreateAgentDto,
    }): CancelablePromise<CreatedAgentDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns DidAgentEverConnectResponse
     * @throws ApiError
     */
    public static didEverConnect({
        agentId,
    }: {
        agentId: string,
    }): CancelablePromise<DidAgentEverConnectResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/agents/didEverConnect/{agentId}',
            path: {
                'agentId': agentId,
            },
        });
    }

    /**
     * @returns UpdatedAgentDto
     * @throws ApiError
     */
    public static updateAgent({
        agentId,
        requestBody,
    }: {
        agentId: string,
        requestBody: UpdateAgentDto,
    }): CancelablePromise<UpdatedAgentDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/update/{agentId}',
            path: {
                'agentId': agentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `You are not authorized to access this resource`,
            },
        });
    }

    /**
     * @returns DeletedAgentResponseDto
     * @throws ApiError
     */
    public static deleteAgent({
        agentId,
    }: {
        agentId: string,
    }): CancelablePromise<DeletedAgentResponseDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/agents/delete/{agentId}',
            path: {
                'agentId': agentId,
            },
            errors: {
                401: `You are not authorized to access this resource`,
            },
        });
    }

    /**
     * @returns ListAgentsResponseDto
     * @throws ApiError
     */
    public static listForProject({
        projectId,
    }: {
        projectId: string,
    }): CancelablePromise<ListAgentsResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/listForProject/{projectId}',
            path: {
                'projectId': projectId,
            },
            errors: {
                401: `You are not authorized to access this resource`,
            },
        });
    }

    /**
     * @returns GetAgentResponseDto
     * @throws ApiError
     */
    public static getById({
        agentId,
    }: {
        agentId: string,
    }): CancelablePromise<GetAgentResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/getById/{agentId}',
            path: {
                'agentId': agentId,
            },
            errors: {
                401: `You are not authorized to access this resource`,
            },
        });
    }

}
