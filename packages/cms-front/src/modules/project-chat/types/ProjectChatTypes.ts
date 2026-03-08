export interface ProjectChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ProjectChatSelectedFile {
  attachmentId: string;
  name: string;
  fullPath: string;
  mimeType?: string;
}

export interface ProjectChat {
  id: string;
  projectId: string;
  title: string | null;
  messages: ProjectChatMessage[] | null;
  selectedFiles: ProjectChatSelectedFile[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectChatRequest {
  projectId: string;
  title?: string;
  selectedFileIds?: string[];
}

export interface SendMessageRequest {
  message: string;
}

export interface UpdateSelectedFilesRequest {
  selectedFileIds: string[];
}

export interface ProjectChatApiResponse<T> {
  success: boolean;
  chat?: T;
  chats?: T[];
  error?: string;
}
