import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings, ChevronDown, Bot, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.css',
})
export class ChatHeader {
  @Input() title: string = 'New Chat';
  @Input() model: string = 'GPT-4.5 Turbo';

  readonly icons = { Settings, ChevronDown, Bot, Sparkles };
}
