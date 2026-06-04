import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-angular';
import { ChatMessage as ChatMessageModel } from '../../../core/models/chat.models';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MarkdownModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {
  @Input() message!: ChatMessageModel;

  readonly icons = { User, Bot, Copy, ThumbsUp, ThumbsDown };
}
