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
