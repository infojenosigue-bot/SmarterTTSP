import { Component, signal } from '@angular/core';
import { AppLayout } from './layout/app-layout/app-layout';

@Component({
  selector: 'app-root',
  imports: [AppLayout],
  template: `<app-app-layout />`,
})
export class App {
  protected readonly title = signal('TTSPbot');
}
