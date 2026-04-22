import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { McpTool } from '../models/chat.models';

// kept for backwards compatibility if UI ever needs to display connection info
export interface McpServerConfig {
    id: string;
    url: string;
    status: 'connected' | 'disconnected' | 'error';
}

@Injectable({
    providedIn: 'root'
})
export class McpService {
    private http = inject(HttpClient);
    // URL of the ASP.NET backend; assume same origin in production
    private backendUrl = 'https://localhost:44333/api/mcp';

    private toolsSubject = new BehaviorSubject<McpTool[]>([]);
    tools$ = this.toolsSubject.asObservable();

    // optional; UI can show connection state if desired
    private connectionsSubject = new BehaviorSubject<McpServerConfig[]>([
        { id: 'backend', url: this.backendUrl, status: 'connected' }
    ]);
    connections$ = this.connectionsSubject.asObservable();

    constructor() {
        // back end is assumed reachable; we can optionally check health here
        this.refreshTools();
    }

    // client no longer manages multiple connections – backend handles SSE
    // helper methods for adding/removing are no longer necessary; they can remain stubs if UI calls them
    async addConnection(url: string): Promise<void> {
        console.warn('addConnection is deprecated; use backend configuration instead');
    }

    removeConnection(url: string) {
        console.warn('removeConnection is deprecated');
    }

    private updateConnectionStatus(id: string, status: McpServerConfig['status']) {
        const updated = this.connectionsSubject.value.map(c =>
            c.id === id ? { ...c, status } : c
        );
        this.connectionsSubject.next(updated);
    }

    refreshTools() {
        // request tool list from backend
        this.http.get<string[]>(`${this.backendUrl}/tools`).pipe(
            map(names => names.map(name => {
                let description = 'MCP Tool';
                if (name === 'queryKnowledgeBase') description = 'Legacy: query knowledge base. Use to search internal knowledge snippets for precise answers; avoid for common trivia questions.';
                else if (name === 'readDocument') description = 'Legacy: read a stored document. Use to fetch specific document content by file name from the knowledge corpus.';
                return {
                    name,
                    status: 'enabled' as const,
                    description,
                    category: 'system',
                    serverId: 'backend'
                } as McpTool;
            })),
            catchError(err => {
                console.error('Failed to fetch tools from backend', err);
                // update status if needed
                this.connectionsSubject.next([{ id: 'backend', url: this.backendUrl, status: 'error' }]);
                return of([]);
            })
        ).subscribe(tools => this.toolsSubject.next(tools));
    }

    toggleTool(name: string) {
        const updatedTools: McpTool[] = this.toolsSubject.value.map(t =>
            t.name === name
                ? { ...t, status: t.status === 'enabled' ? 'disabled' : 'enabled' }
                : t
        );
        this.toolsSubject.next(updatedTools);
    }


    getEnabledTools(): string[] {
        return this.toolsSubject.value
            .filter(t => t.status === 'enabled')
            .map(t => t.name);
    }

    getEnabledToolDefinitions(): McpTool[] {
        return this.toolsSubject.value.filter(t => t.status === 'enabled');
    }

    invokeTool(toolName: string, parameters: any): Observable<any> {
        const tool = this.toolsSubject.value.find(t => t.name === toolName);

        let obs$: Observable<any>;

        if (tool) {
            obs$ = this.http.post<any>(`${this.backendUrl}/invoke`, { toolName, parameters }).pipe(
                map(res => res?.result ?? res),
                catchError(err => throwError(() => new Error(err.message || 'Invocation failed')))
            );
        } else {
            obs$ = throwError(() => new Error(`Tool ${toolName} not registered`));
        }

        return obs$.pipe(
            tap({
                next: (result: any) => {
                    const updatedTools = this.toolsSubject.value.map(t =>
                        t.name === toolName ? { ...t, lastResult: result } : t
                    );
                    this.toolsSubject.next(updatedTools);
                },
                error: (err: any) => {
                    const updatedTools = this.toolsSubject.value.map(t =>
                        t.name === toolName ? { ...t, lastResult: { error: err.message || 'Execution failed' } } : t
                    );
                    this.toolsSubject.next(updatedTools);
                }
            })
        );
    }
}
