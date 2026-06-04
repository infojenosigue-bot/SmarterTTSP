import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings, ChevronDown, Bot, Sparkles, Check, Database, Power, X, Zap, Cloud, Cpu, Layers, Settings2 } from 'lucide-angular';
import { ChatModel } from '../../../core/models/chat.models';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.css',
})
export class ChatHeader {
  @Input() title: string = 'New Chat';
  @Input() models: ChatModel[] = [];
  @Input() selectedModel?: ChatModel;
  @Output() modelSelected = new EventEmitter<ChatModel>();

  showModelDropdown = false;
  showSettingsDropdown = false;

  readonly icons = { Settings, ChevronDown, Bot, Sparkles, Check, Database, Power, X, Zap, Cloud, Cpu, Layers, Settings2 };

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
    if (this.showModelDropdown) this.showSettingsDropdown = false;
  }

  toggleSettingsDropdown() {
    this.showSettingsDropdown = !this.showSettingsDropdown;
    if (this.showSettingsDropdown) this.showModelDropdown = false;
  }

  selectModel(model: ChatModel) {
    this.selectedModel = model;
    this.modelSelected.emit(model);
    this.showModelDropdown = false;
  }
}
