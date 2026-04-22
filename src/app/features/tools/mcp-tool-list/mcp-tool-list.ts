import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../../core/services/mcp.service';
import { McpTool } from '../../../core/models/chat.models';

@Component({
  selector: 'app-mcp-tool-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mcp-tool-list.html',
  styleUrl: './mcp-tool-list.css',
})
export class McpToolList {
  private mcpService = inject(McpService);

  tools$ = this.mcpService.tools$;
  connections$ = this.mcpService.connections$; // may contain a single backend entry

  toggleTool(toolName: string) {
    this.mcpService.toggleTool(toolName);
  }

  refreshTools() {
    this.mcpService.refreshTools();
  }

  // server configuration is now managed by the backend; nothing to do here
}
