import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import styled from '@emotion/styled';
import { useDebouncedCallback } from 'use-debounce';
import {
  IconCheck,
  IconFile,
  IconPencil,
  IconPlus,
  IconRobot,
  IconTrash,
  IconX,
} from 'cms-ui/display';
import { Button } from 'cms-ui/input';
import { GRAY_SCALE_LIGHT } from 'cms-ui/theme';
import { v4 as uuidv4 } from 'uuid';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import type {
  ProjectChat,
  ProjectChatMessage,
  ProjectChatSelectedFile,
} from '@/project-chat/types/ProjectChatTypes';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledChatList = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledChatItem = styled.div<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.background.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledChatTitle = styled.span<{ isEditing?: boolean }>`
  flex: 1;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTitleInput = styled.input`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  max-width: 120px;
  outline: none;
  padding: 2px 4px;
`;

const StyledNewChatButton = styled.div`
  align-items: center;
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledIconButton = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  cursor: pointer;
  display: flex;
  opacity: 0.6;
  padding: 2px;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.medium};
    opacity: 1;
  }
`;

const StyledFileSelector = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFileChip = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.background.transparent.light};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, isSelected }) =>
    isSelected ? GRAY_SCALE_LIGHT.gray1 : theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue10 : theme.background.transparent.medium};
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue10 : theme.accent.tertiary};
  }
`;

const StyledMessagesContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledMessage = styled.div<{ role: 'user' | 'assistant' }>`
  align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${({ theme, role }) =>
    role === 'user' ? theme.color.blue : theme.background.secondary};
  border: ${({ theme, role }) =>
    role === 'assistant' ? `1px solid ${theme.border.color.light}` : 'none'};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme, role }) =>
    role === 'user' ? GRAY_SCALE_LIGHT.gray1 : theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  max-width: 80%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  white-space: normal;

  code {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    font-family: monospace;
    font-size: ${({ theme }) => theme.font.size.xs};
    line-height: 1.4;
    max-width: 100%;
    overflow: auto;
    padding: ${({ theme }) => theme.spacing(1)};
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  pre {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    margin: ${({ theme }) => theme.spacing(2)} 0;
    max-width: 100%;
    overflow-x: auto;
    padding: ${({ theme }) => theme.spacing(2)};

    code {
      background: none;
      border-radius: 0;
      padding: 0;
    }
  }

  p {
    line-height: 1.5;
    margin-block: ${({ theme, role }) =>
      role === 'user' ? '0' : theme.spacing(1)};
  }

  ul,
  ol {
    margin: ${({ theme }) => theme.spacing(1)} 0;
    padding-left: ${({ theme }) => theme.spacing(4)};
  }

  li {
    margin: ${({ theme }) => theme.spacing(0.5)} 0;
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.border.color.medium};
    color: ${({ theme }) => theme.font.color.secondary};
    margin: ${({ theme }) => theme.spacing(2)} 0;
    padding-left: ${({ theme }) => theme.spacing(2)};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    margin: ${({ theme }) => theme.spacing(2)} 0
      ${({ theme }) => theme.spacing(1)};
  }

  a {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  table {
    border-collapse: collapse;
    margin: ${({ theme }) => theme.spacing(2)} 0;
    width: 100%;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.border.color.light};
    padding: ${({ theme }) => theme.spacing(1)}
      ${({ theme }) => theme.spacing(2)};
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.background.tertiary};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }

  strong {
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
  }

  em {
    font-style: italic;
  }
`;

const StyledInputContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledTextArea = styled.textarea`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledSendButton = styled.button`
  align-self: flex-end;
  background-color: ${({ theme }) => theme.color.blue};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${GRAY_SCALE_LIGHT.gray1};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 32px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.blue10};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledFileSelectorLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

// Helper to validate UUID format
const isValidUUID = (str: string | undefined | null): str is string => {
  if (!str) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Generate a title from the first message
const generateTitleFromMessage = (message: string): string => {
  const words = message.trim().split(/\s+/).slice(0, 6);
  let title = words.join(' ');
  if (title.length > 30) {
    title = title.substring(0, 30) + '...';
  } else if (message.trim().split(/\s+/).length > 6) {
    title += '...';
  }
  return title || 'New Chat';
};

export const ProjectChatCard = () => {
  const targetRecord = useTargetRecord();
  const projectId = targetRecord?.id;

  const { attachments, loading: attachmentsLoading } =
    useAttachments(targetRecord);

  const [chats, setChats] = useState<ProjectChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Memoize active chat lookup
  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId],
  );

  const getAuthHeaders = useCallback(() => {
    const tokenPair = getTokenPair();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenPair?.accessOrWorkspaceAgnosticToken?.token ?? ''}`,
    };
  }, []);

  // Fetch chats for this project
  const fetchChats = useCallback(async () => {
    if (!isValidUUID(projectId)) {
      return;
    }

    try {
      const response = await fetch(
        `${REST_API_BASE_URL}/project-chats/project/${projectId}`,
        { headers: getAuthHeaders() },
      );
      const data = await response.json();

      if (data.success === true && Array.isArray(data.chats)) {
        const validChats = data.chats.filter((chat: ProjectChat) =>
          isValidUUID(chat.id),
        );
        setChats(validChats);
        if (validChats.length > 0 && activeChatId === null) {
          setActiveChatId(validChats[0].id);
          setSelectedFileIds(
            validChats[0].selectedFiles?.map(
              (f: ProjectChatSelectedFile) => f.attachmentId,
            ) || [],
          );
        }
      }
    } catch {
      // Silent fail - user will see empty state
    }
  }, [projectId, getAuthHeaders, activeChatId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Focus title input when editing
  useEffect(() => {
    if (editingChatId !== null && titleInputRef.current !== null) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingChatId]);

  // OPTIMISTIC: Create new chat
  const createNewChat = useCallback(async () => {
    if (!isValidUUID(projectId)) {
      return;
    }

    // Create optimistic chat with temp ID
    const tempId = uuidv4();
    const optimisticChat: ProjectChat = {
      id: tempId,
      projectId,
      title: 'New Chat',
      messages: [],
      selectedFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setChats((prev) => [optimisticChat, ...prev]);
    setActiveChatId(tempId);
    setSelectedFileIds([]);

    try {
      const response = await fetch(`${REST_API_BASE_URL}/project-chats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId,
          title: 'New Chat',
          selectedFileIds: [],
        }),
      });

      const data = await response.json();

      if (
        data.success === true &&
        data.chat !== null &&
        isValidUUID(data.chat.id)
      ) {
        // Replace temp chat with real one
        setChats((prev) => prev.map((c) => (c.id === tempId ? data.chat : c)));
        setActiveChatId(data.chat.id);
      } else {
        // Rollback on failure
        setChats((prev) => prev.filter((c) => c.id !== tempId));
        setActiveChatId(null);
      }
    } catch {
      // Rollback on error
      setChats((prev) => prev.filter((c) => c.id !== tempId));
      setActiveChatId(null);
    }
  }, [projectId, getAuthHeaders]);

  // OPTIMISTIC: Delete chat
  const deleteChat = useCallback(
    async (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isValidUUID(chatId)) {
        return;
      }

      // Store for rollback
      const chatIndex = chats.findIndex((c) => c.id === chatId);
      const deletedChat = chats[chatIndex];

      // Optimistic update
      const newChats = chats.filter((c) => c.id !== chatId);
      setChats(newChats);

      if (activeChatId === chatId) {
        setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
        if (newChats.length > 0) {
          setSelectedFileIds(
            newChats[0].selectedFiles?.map((f) => f.attachmentId) || [],
          );
        }
      }

      try {
        await fetch(`${REST_API_BASE_URL}/project-chats/${chatId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch {
        // Rollback on error
        if (deletedChat !== undefined) {
          setChats((prev) => {
            const restored = [...prev];
            restored.splice(chatIndex, 0, deletedChat);
            return restored;
          });
        }
      }
    },
    [chats, activeChatId, getAuthHeaders],
  );

  // Switch chat (instant, no API call needed)
  const switchChat = useCallback(
    (chat: ProjectChat) => {
      if (chat.id === activeChatId) return;
      setActiveChatId(chat.id);
      setSelectedFileIds(chat.selectedFiles?.map((f) => f.attachmentId) || []);
    },
    [activeChatId],
  );

  // Debounced API call for file selection
  const debouncedUpdateFiles = useDebouncedCallback(
    async (chatId: string, newSelection: string[]) => {
      try {
        const response = await fetch(
          `${REST_API_BASE_URL}/project-chats/${chatId}/files`,
          {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ selectedFileIds: newSelection }),
          },
        );

        const data = await response.json();

        if (data.success === true && data.chat !== null) {
          setChats((prev) =>
            prev.map((c) => (c.id === data.chat.id ? data.chat : c)),
          );
        }
      } catch {
        // Silent fail - local state already updated
      }
    },
    300,
  );

  // Toggle file selection with optimistic UI update
  const toggleFileSelection = useCallback(
    (attachmentId: string) => {
      if (!isValidUUID(attachmentId) || activeChat === null) {
        return;
      }

      const newSelection = selectedFileIds.includes(attachmentId)
        ? selectedFileIds.filter((id) => id !== attachmentId)
        : [...selectedFileIds, attachmentId].slice(0, 5);

      // Immediate UI update
      setSelectedFileIds(newSelection);

      // Debounced API call
      debouncedUpdateFiles(activeChat.id, newSelection);
    },
    [selectedFileIds, activeChat, debouncedUpdateFiles],
  );

  // Start editing title
  const startEditingTitle = useCallback(
    (chatId: string, currentTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingChatId(chatId);
      setEditingTitle(currentTitle || 'New Chat');
    },
    [],
  );

  // Save title
  const saveTitle = useCallback(async () => {
    if (editingChatId === null || editingTitle.trim() === '') {
      setEditingChatId(null);
      return;
    }

    const newTitle = editingTitle.trim();

    // Optimistic update
    setChats((prev) =>
      prev.map((c) => (c.id === editingChatId ? { ...c, title: newTitle } : c)),
    );
    setEditingChatId(null);

    try {
      await fetch(`${REST_API_BASE_URL}/project-chats/${editingChatId}/title`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newTitle }),
      });
    } catch {
      // Silent fail - optimistic update already applied
    }
  }, [editingChatId, editingTitle, getAuthHeaders]);

  // Handle title input keydown
  const handleTitleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        saveTitle();
      } else if (e.key === 'Escape') {
        setEditingChatId(null);
      }
    },
    [saveTitle],
  );

  // Auto-generate title after first message
  const updateChatTitleIfNeeded = useCallback(
    async (chatId: string, userMessage: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (
        chat === undefined ||
        (chat.messages !== undefined && chat.messages.length > 0)
      ) {
        return; // Only auto-title on first message
      }

      const newTitle = generateTitleFromMessage(userMessage);

      // Optimistic update
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)),
      );

      // Persist to server
      try {
        await fetch(`${REST_API_BASE_URL}/project-chats/${chatId}/title`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ title: newTitle }),
        });
      } catch {
        // Silent fail
      }
    },
    [chats, getAuthHeaders],
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || activeChat === null || isStreaming) return;

    if (!isValidUUID(activeChat.id)) {
      return;
    }

    const userMessage = inputValue.trim();
    const isFirstMessage =
      !activeChat.messages || activeChat.messages.length === 0;

    setInputValue('');
    setIsStreaming(true);
    setStreamingContent('');

    // Auto-generate title on first message
    if (isFirstMessage) {
      updateChatTitleIfNeeded(activeChat.id, userMessage);
    }

    // Optimistically add user message
    const userMessageEntry: ProjectChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...(activeChat.messages || []), userMessageEntry];
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id ? { ...c, messages: updatedMessages } : c,
      ),
    );

    try {
      const response = await fetch(
        `${REST_API_BASE_URL}/project-chats/${activeChat.id}/messages`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ message: userMessage }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to send message';

        const errorMessageEntry: ProjectChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? { ...c, messages: [...updatedMessages, errorMessageEntry] }
              : c,
          ),
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let hasError = false;

      if (reader !== undefined) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'error') {
                  // Handle error from server
                  hasError = true;
                  fullContent += `\n\nError: ${data.content}`;
                  setStreamingContent(fullContent);
                } else if (data.type === 'done') {
                  // Stream complete
                  break;
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      const assistantMessage: ProjectChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: hasError && fullContent === '' ? 'An error occurred' : fullContent,
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? { ...c, messages: [...updatedMessages, assistantMessage] }
            : c,
        ),
      );
    } catch (error) {
      // Show error message to user
      const errorMessageEntry: ProjectChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`,
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? { ...c, messages: [...updatedMessages, errorMessageEntry] }
            : c,
        ),
      );
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [
    inputValue,
    activeChat,
    isStreaming,
    getAuthHeaders,
    updateChatTitleIfNeeded,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return (
    <StyledContainer>
      {/* Chat list */}
      <StyledChatList>
        <StyledNewChatButton onClick={createNewChat}>
          <IconPlus size={14} />
          New Chat
        </StyledNewChatButton>
        {chats.map((chat) => (
          <StyledChatItem
            key={chat.id}
            isActive={activeChatId === chat.id}
            onClick={() => switchChat(chat)}
          >
            <IconRobot size={14} />
            {editingChatId === chat.id ? (
              <>
                <StyledTitleInput
                  ref={titleInputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={saveTitle}
                  onClick={(e) => e.stopPropagation()}
                />
                <StyledIconButton onClick={saveTitle}>
                  <IconCheck size={12} />
                </StyledIconButton>
              </>
            ) : (
              <>
                <StyledChatTitle>{chat.title || 'New Chat'}</StyledChatTitle>
                <StyledIconButton
                  onClick={(e) =>
                    startEditingTitle(chat.id, chat.title || '', e)
                  }
                >
                  <IconPencil size={12} />
                </StyledIconButton>
                <StyledIconButton onClick={(e) => deleteChat(chat.id, e)}>
                  <IconTrash size={12} />
                </StyledIconButton>
              </>
            )}
          </StyledChatItem>
        ))}
      </StyledChatList>

      {/* File selector */}
      {activeChat && (
        <StyledFileSelector>
          <StyledFileSelectorLabel>
            {attachmentsLoading
              ? 'Loading files...'
              : (attachments?.length ?? 0) > 0
                ? `Select up to 5 files as context (${selectedFileIds.length}/5):`
                : 'No files attached. Add files in the Files tab.'}
          </StyledFileSelectorLabel>
          {(attachments ?? []).map((attachment) => (
            <StyledFileChip
              key={attachment.id}
              isSelected={selectedFileIds.includes(attachment.id)}
              onClick={() => toggleFileSelection(attachment.id)}
            >
              <IconFile size={12} />
              {attachment.name || 'Unnamed file'}
              {selectedFileIds.includes(attachment.id) && <IconX size={10} />}
            </StyledFileChip>
          ))}
        </StyledFileSelector>
      )}

      {/* Messages */}
      {activeChat ? (
        <>
          <StyledMessagesContainer>
            {(!activeChat.messages || activeChat.messages.length === 0) &&
              !isStreaming && (
                <StyledEmptyState>
                  <IconRobot size={48} />
                  <span>Start a conversation about your project files</span>
                  <span style={{ fontSize: '12px' }}>
                    Select files above to add them as context for the AI
                  </span>
                </StyledEmptyState>
              )}
            {activeChat.messages?.map((message, index) => (
              <StyledMessage
                key={message.id || `msg-${index}`}
                role={message.role}
              >
                {message.role === 'assistant' ? (
                  <LazyMarkdownRenderer text={message.content} />
                ) : (
                  message.content
                )}
              </StyledMessage>
            ))}
            {isStreaming && streamingContent && (
              <StyledMessage role="assistant">
                <LazyMarkdownRenderer text={streamingContent} />
              </StyledMessage>
            )}
          </StyledMessagesContainer>
          <StyledInputContainer>
            <StyledTextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your project files..."
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <StyledSendButton
              onClick={sendMessage}
              disabled={!inputValue.trim() || isStreaming}
            >
              {isStreaming ? 'Sending...' : 'Send'}
            </StyledSendButton>
          </StyledInputContainer>
        </>
      ) : (
        <StyledEmptyState>
          <IconRobot size={48} />
          <div>No chats yet</div>
          <Button
            title="Start a new chat"
            Icon={IconPlus}
            onClick={createNewChat}
          />
        </StyledEmptyState>
      )}
    </StyledContainer>
  );
};
