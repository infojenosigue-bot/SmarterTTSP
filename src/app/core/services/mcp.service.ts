import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { McpTool } from '../models/chat.models';

const MOCK_TOOLS: McpTool[] = [
    { name: 'getEmployeeData', status: 'enabled', description: 'Fetch employee details by ID', category: 'data' },
    { name: 'getOrgChart', status: 'enabled', description: 'Retrieve organizational structure', category: 'data' },
    { name: 'queryBilling', status: 'disabled', description: 'Query recent billing invoices', category: 'utility' },
    { name: 'fetchDocument', status: 'enabled', description: 'Search and retrieve internal documents', category: 'system' }
];

@Injectable({
    providedIn: 'root'
})
export class McpService {
    private toolsSubject = new BehaviorSubject<McpTool[]>(MOCK_TOOLS);
    tools$ = this.toolsSubject.asObservable();

    constructor() { }

    toggleTool(name: string) {
        const tools = this.toolsSubject.value.map(tool => {
            if (tool.name === name) {
                return { ...tool, status: tool.status === 'enabled' ? 'disabled' : 'enabled' } as McpTool;
            }
            return tool;
        });
        this.toolsSubject.next(tools);
    }
}
