import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Database, Wrench, FileText, Settings, X, Moon, Sun } from 'lucide-angular';
import { McpService } from '../../../core/services/mcp.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-right-tools-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './right-tools-panel.html',
  styleUrl: './right-tools-panel.css',
})
export class RightToolsPanel {
  private mcpService = inject(McpService);
  private themeService = inject(ThemeService);

  tools$ = this.mcpService.tools$;
  theme = this.themeService.theme;

  activeTab: 'tools' | 'knowledge' = 'tools';

  readonly icons = { Database, Wrench, FileText, Settings, X, Moon, Sun };

  toggleTool(name: string) {
    this.mcpService.toggleTool(name);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
