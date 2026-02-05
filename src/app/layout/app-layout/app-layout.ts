import { Component } from '@angular/core';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { RightToolsPanel } from '../../features/tools/right-tools-panel/right-tools-panel';
import { ChatPanel } from '../../features/chat/chat-panel/chat-panel';

@Component({
  selector: 'app-app-layout',
  imports: [Sidebar, RightToolsPanel, ChatPanel],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {

}
