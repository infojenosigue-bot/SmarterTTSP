import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError, map, finalize, firstValueFrom } from 'rxjs';
import { ChatMessage, ChatSession, ChatModel, AVAILABLE_MODELS, ModelId } from '../models/chat.models';
import { HttpClient } from '@angular/common/http';
import { McpService } from './mcp.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private sessionsSubject = new BehaviorSubject<ChatSession[]>([]);
    private activeSessionIdSubject = new BehaviorSubject<string | null>(null);
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private selectedModelSubject = new BehaviorSubject<ChatModel>(AVAILABLE_MODELS[0]);

    private readonly API_BASE_URL = 'https://localhost:44333/api/chat';
    // Excel MCP endpoint is now managed by backend configuration

    sessions$ = this.sessionsSubject.asObservable();
    activeSessionId$ = this.activeSessionIdSubject.asObservable();
    messages$ = this.messagesSubject.asObservable();
    isLoading$ = this.isLoadingSubject.asObservable();
    selectedModel$ = this.selectedModelSubject.asObservable();

    private isExcelMcpEnabledSubject = new BehaviorSubject<boolean>(false);
    isExcelMcpEnabled$ = this.isExcelMcpEnabledSubject.asObservable();

    constructor(
        private http: HttpClient,
        private mcpService: McpService
    ) {
        this.loadSessions();
    }

    loadSessions() {
        this.http.get<ChatSession[]>(`${this.API_BASE_URL}/sessions`).subscribe({
            next: (sessions) => {
                this.sessionsSubject.next(sessions);
            },
            error: (err) => {
                console.error('Failed to load sessions', err);
            }
        });
    }

    loadSession(sessionId: string) {
        this.activeSessionIdSubject.next(sessionId);
        this.isLoadingSubject.next(true);
        this.messagesSubject.next([]); // Clear previous messages while loading

        this.http.get<ChatMessage[]>(`${this.API_BASE_URL}/sessions/${sessionId}/messages`).pipe(
            finalize(() => this.isLoadingSubject.next(false))
        ).subscribe({
            next: (messages) => {
                this.messagesSubject.next(messages);
            },
            error: (err) => {
                console.error(`Failed to load messages for session ${sessionId}`, err);
                this.messagesSubject.next([]);
            }
        });
    }

    createNewSession() {
        const newId = this.generateUUID();
        const newSession: ChatSession = {
            id: newId,
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date()
        };

        // Optimistically add to list
        const currentSessions = this.sessionsSubject.value;
        this.sessionsSubject.next([newSession, ...currentSessions]);

        // Set active
        this.activeSessionIdSubject.next(newId);
        this.messagesSubject.next([]);
    }

    setModel(modelId: ModelId) {
        const model = AVAILABLE_MODELS.find(m => m.id === modelId);
        if (model) {
            this.selectedModelSubject.next(model);
        }
    }

    toggleExcelMcp() {
        const newValue = !this.isExcelMcpEnabledSubject.value;
        this.isExcelMcpEnabledSubject.next(newValue);
        // The backend will open/close the SSE connection as needed; frontend only toggles a flag.
    }

    async sendMessage(content: string) {
        let sessionId = this.activeSessionIdSubject.value;
        if (!sessionId) {
            this.createNewSession();
            sessionId = this.activeSessionIdSubject.value;
        }

        // Add user message locally immediately
        const userMsg: ChatMessage = {
            id: this.generateUUID(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, userMsg]);
        this.isLoadingSubject.next(true);

        // Update last message in session locally
        const sessions = this.sessionsSubject.value.map(s =>
            s.id === sessionId ? { ...s, lastMessage: content, timestamp: new Date() } : s
        );
        this.sessionsSubject.next(sessions);

        // Get enabled tools
        const enabledTools = this.mcpService.getEnabledToolDefinitions();
        const enabledToolNames = new Set<string>(enabledTools.map(t => t.name));

        // legacy names are treated as normal toggleable tools; only include those enabled
        const legacyNames = ['queryKnowledgeBase', 'readDocument'];
        const toolNamesSet = new Set<string>(enabledToolNames);
        legacyNames.forEach(n => {
            if (enabledToolNames.has(n)) {
                toolNamesSet.add(n);
            }
        });

        // fetch latest list of tools from server
        let serverNames: string[] = [];
        try {
            // note: the MCP tools endpoint lives under /api/mcp, not /api/chat
            serverNames = await firstValueFrom(this.http.get<string[]>(`https://localhost:44333/api/mcp/tools`));
            serverNames.forEach(n => {
                // Respect legacy tool toggles (queryKnowledgeBase/readDocument);
                // keep other server tools available as before.
                if (legacyNames.includes(n) && !enabledToolNames.has(n)) {
                    return;
                }
                toolNamesSet.add(n);
            });
        } catch (e) {
            console.warn('Failed to fetch server tools list', e);
        }

        const allToolNames = Array.from(toolNamesSet);

        const toolDefs: any[] = [];
        // start with enabled tool definitions (they already contain schema)
        toolDefs.push(...enabledTools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
        })));
        // for legacy names that are enabled but not present in fetched definitions, supply minimal definitions
        legacyNames.forEach(name => {
            if (enabledToolNames.has(name) && !enabledTools.some(t => t.name === name)) {
                toolDefs.push({
                    name,
                    description: name === 'queryKnowledgeBase' ? 'Legacy: query knowledge base' : 'Legacy: read a stored document',
                    inputSchema: name === 'queryKnowledgeBase' ?
                        { type: 'object', properties: { query: { type: 'string' }, topK: { type: 'integer' } }, required: ['query'] } :
                        { type: 'object', properties: { fileName: { type: 'string' } }, required: ['fileName'] }
                });
            }
        });

        // also add empty definitions for any server-only names not yet defined
        serverNames.forEach(name => {
            // Skip disabled legacy tools here, too.
            if (legacyNames.includes(name) && !enabledToolNames.has(name)) {
                return;
            }
            if (!toolDefs.some(d => d.name === name)) {
                toolDefs.push({ name, description: 'MCP Excel tool', inputSchema: null });
            }
        });

        // Prepare API payload
        const payload = {
            sessionId: sessionId,
            message: content,
            model: this.selectedModelSubject.value.id,
            tools: allToolNames,
            toolDefinitions: toolDefs
        };

        this.http.post<any>(`${this.API_BASE_URL}/send`, payload).subscribe({
            next: (response) => {
                if (sessionId) {
                    this.processResponse(response, sessionId);
                } else {
                    console.error('Session ID is missing');
                }
            },
            error: (err) => {
                console.error('ChatService: Error sending message', err);
                const errorMsg: ChatMessage = {
                    id: this.generateUUID(),
                    role: 'assistant',
                    content: `Error: ${err.message || 'Unknown error occurred'}`,
                    timestamp: new Date()
                };
                this.messagesSubject.next([...this.messagesSubject.value, errorMsg]);
                this.isLoadingSubject.next(false);
            }
        });
    }

    private async processResponse(response: any, sessionId: string) {
        let aiResponseContent = '';
        let toolCalls: any[] = [];

        if (typeof response === 'string') {
            try {
                const parsed = JSON.parse(response);
                aiResponseContent = parsed.reply || parsed.message || parsed.content || response;
                if (parsed.tool_calls) toolCalls = parsed.tool_calls;
                if (parsed.toolCalls) toolCalls = parsed.toolCalls; // Handle camelCase from backend
            } catch (e) {
                aiResponseContent = response;
            }
        } else {
            aiResponseContent = response.reply || response.message || response.content || '';
            if (response.tool_calls) toolCalls = response.tool_calls;
            if (response.toolCalls) toolCalls = response.toolCalls; // Handle camelCase from backend

            // Fallback if content is missing but tool calls exist
            if (!aiResponseContent && toolCalls.length > 0) {
                // Determine if there is a specific message about tool usage
                // otherwise defaulting to "Using Excel tools..."
                aiResponseContent = "Using Excel tools...";
            } else if (!aiResponseContent) {
                aiResponseContent = JSON.stringify(response);
            }
        }

        const aiMsg: ChatMessage = {
            id: this.generateUUID(),
            role: 'assistant',
            content: aiResponseContent,
            timestamp: new Date(),
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined
        };

        this.messagesSubject.next([...this.messagesSubject.value, aiMsg]);

        // Update last message
        const updatedSessions = this.sessionsSubject.value.map(s =>
            s.id === sessionId ? { ...s, lastMessage: aiMsg.content, timestamp: new Date() } : s
        );
        this.sessionsSubject.next(updatedSessions);

        // If there are tool calls, execute them
        if (toolCalls.length > 0 && sessionId) {
            await this.executeToolCalls(sessionId, toolCalls);
        } else {
            this.isLoadingSubject.next(false);
        }
    }

    private async executeToolCalls(sessionId: string, toolCalls: any[]) {
        const enabledToolNames = new Set<string>(this.mcpService.getEnabledTools());

        for (const call of toolCalls) {
            const toolName = call.function?.name || call.name || 'unknown';

            if (!enabledToolNames.has(toolName)) {
                console.warn(`Tool '${toolName}' is disabled, skipping invocation.`);
                continue;
            }

            try {
                // Determine format. Some LLMs return object with 'function' prop
                const toolArgs = call.function?.arguments ?
                    (typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments)
                    : call.arguments;

                console.log(`Executing tool: ${toolName}`, toolArgs);

                this.mcpService.invokeTool(toolName, toolArgs).subscribe({
                    next: (result) => {
                        console.log(`Tool result for ${toolName}:`, result);
                        this.sendToolResult(sessionId, call.id, toolName, result);
                    },
                    error: (err) => {
                        console.error(`Tool execution failed for ${toolName}:`, err);
                        this.sendToolResult(sessionId, call.id, toolName, { error: err.message });
                    }
                });

            } catch (e: any) {
                console.error('Error processing tool call', e);
                // ALWAYS send an error result back. Otherwise the backend might hang waiting for exactly this tool_call_id
                this.sendToolResult(sessionId, call.id, toolName, { error: `Failed to parse arguments: ${e.message}` });
            }
        }
    }

    private sendToolResult(sessionId: string, toolCallId: string, toolName: string, result: any) {
        // Send the result back to the LLM as a new message
        // The role depends on the backend/LLM. Usually 'tool' or 'function'.
        // We'll trust the backend handles a generic message with role 'tool' if we send it.

        const resultString = typeof result === 'string' ? result : JSON.stringify(result);

        // const payload = {
        //     sessionId: sessionId,
        //     role: 'tool',
        //     tool_call_id: toolCallId,
        //     name: toolName,
        //     content: resultString
        // };

        const payload = {
        sessionId: sessionId,
        message: resultString,
        toolCallId: toolCallId,
        toolName: toolName
    };

        // We might need to append this to local messages for UI visibility or debugging
        // For now, let's just send it to backend and wait for the MAIN AI response

        this.http.post<any>(`${this.API_BASE_URL}/send`, payload).subscribe({
            next: (response) => {
                this.processResponse(response, sessionId);
            },
            error: (err) => {
                this.isLoadingSubject.next(false);
                console.error('Error sending tool result', err);
            }
        });
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
