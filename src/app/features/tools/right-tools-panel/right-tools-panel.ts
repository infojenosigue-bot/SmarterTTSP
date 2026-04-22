import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Database, Wrench, FileText, Settings, X, Moon, Sun, Trash2, Loader2, Upload } from 'lucide-angular';
import { McpService } from '../../../core/services/mcp.service';
import { ThemeService } from '../../../core/services/theme.service';
import { KnowledgeService, DocumentMetadata } from '../../../core/services/knowledge.service';
import { ChatService } from '../../../core/services/chat.service';
import { BehaviorSubject, catchError, finalize, interval, of, startWith, switchMap, takeWhile, tap, map } from 'rxjs';

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
  private knowledgeService = inject(KnowledgeService);
  private chatService = inject(ChatService);

  tools$ = this.mcpService.tools$;
  // derived stream of comma-separated enabled tools
  enabledToolNames$ = this.tools$.pipe(
    map(tools => tools
      .filter(t => t.status === 'enabled')
      .map(t => t.name)
      .join(', '))
  );
  theme = this.themeService.theme;
  isExcelMcpEnabled$ = this.chatService.isExcelMcpEnabled$;

  // Documents State
  private refreshDocuments$ = new BehaviorSubject<void>(undefined);

  // Poll every 3 seconds if there are documents processing
  documents$ = this.refreshDocuments$.pipe(
    switchMap(() => this.knowledgeService.getDocuments().pipe(
      catchError(err => {
        console.error('Failed to items', err);
        return of([] as DocumentMetadata[]);
      })
    )),
    switchMap(initialDocs => {
      // If any doc is processing, start polling
      const hasProcessing = initialDocs.some(d => d.status !== 'Ready');
      if (hasProcessing) {
        return interval(3000).pipe(
          startWith(0),
          switchMap(() => this.knowledgeService.getDocuments().pipe(
            catchError(() => of(initialDocs)) // Fallback to last known state
          )),
          takeWhile((docs: DocumentMetadata[]) => docs.some((d: DocumentMetadata) => d.status !== 'Ready'), true) // Continue until all ready
        );
      }
      return of(initialDocs);
    })
  );

  isUploading = false;
  activeTab: 'tools' | 'knowledge' = 'tools';

  readonly icons = { Database, Wrench, FileText, Settings, X, Moon, Sun, Trash2, Loader2, Upload };

  toggleTool(name: string) {
    this.mcpService.toggleTool(name);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleExcelMcp() {
    this.chatService.toggleExcelMcp();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isUploading = true;
      this.knowledgeService.uploadDocument(file).pipe(
        finalize(() => {
          this.isUploading = false;
          // Clear input
          input.value = '';
        })
      ).subscribe({
        next: () => {
          this.refreshDocuments$.next();
        },
        error: (err) => console.error('Upload failed', err)
      });
    }
  }

  deleteDocument(id: string) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.knowledgeService.deleteDocument(id).subscribe({
        next: () => this.refreshDocuments$.next(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
