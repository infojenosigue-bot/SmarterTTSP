import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<'light' | 'dark'>('dark');

    constructor() {
        // Load from local storage or system preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            this.theme.set(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme.set('dark');
        }

        // Apply effect
        effect(() => {
            const currentTheme = this.theme();
            localStorage.setItem('theme', currentTheme);

            if (currentTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    toggleTheme() {
        this.theme.update(t => t === 'dark' ? 'light' : 'dark');
    }
}
