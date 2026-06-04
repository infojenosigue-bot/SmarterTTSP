export type Role = 'user' | 'assistant' | 'system';

export interface User {
    domainAccount: string;
    fullName: string;
    companyEmail: string;
    department: string;
    team: string;
    teamId: number;
    role: string;
    employeeId: number;
    // UI extended properties
    isAuthenticated?: boolean;
    avatarUrl?: string;
    id?: string;
    name?: string; // mapped from fullName
    email?: string; // mapped from companyEmail
}

// Check if response is just the User object
export type AuthResponse = User;

export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    attachments?: ChatAttachment[];
    isTyping?: boolean; // For UI loading state
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: any;
}

export interface ToolResult {
    toolCallId: string;
    result: any;
}

export interface ChatAttachment {
    id: string;
    name: string;
    type: 'file' | 'image' | 'code';
    url?: string;
    preview?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    tags?: string[];
}

export interface McpTool {
    name: string;
    description?: string;
    status: 'enabled' | 'disabled';
    icon?: string;
    category?: 'data' | 'utility' | 'system';
    inputSchema?: string;
    serverId?: string;
    lastResult?: any;
}

export interface McpToolRequest {
    toolName: string;
    arguments: Record<string, any>;
}

export interface McpToolResponse {
    toolName: string;
    result: any;
    status: 'success' | 'error';
}

export type ModelId = 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gpt-4-turbo';

export interface ChatModel {
    id: ModelId;
    name: string;
    description: string;
    icon?: string;
    provider: 'Google' | 'OpenAI' | 'Anthropic';
}

export const AVAILABLE_MODELS: ChatModel[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fastest and most cost-effective model for high-frequency tasks',
        provider: 'Google'
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Best performing model for complex reasoning and coding',
        provider: 'Google'
    }
];
