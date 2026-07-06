import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatResponse {
  answer: string;
  sources: string[];
}

export const assistantService = {
  async chat(
    message: string,
    history: AssistantChatMessage[] = []
  ): Promise<AssistantChatResponse> {
    const response = await axiosClient.post<ApiResponse<AssistantChatResponse>>(
      API_ENDPOINTS.ASSISTANT.CHAT,
      { message, history }
    );
    return response.data.data!;
  },
};
