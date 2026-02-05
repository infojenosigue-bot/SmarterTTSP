import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import { ChatMessage, ChatSession } from '../models/chat.models';

const MOCK_SESSIONS: ChatSession[] = [
    {
        id: '1',
        title: 'Billing Analysis January',
        lastMessage: 'Show anomalies',
        timestamp: new Date('2026-01-30T09:00:00')
    },
    {
        id: '2',
        title: 'Engineering SOP Review',
        lastMessage: 'Explain welding defect',
        timestamp: new Date('2026-01-29T16:30:00')
    }
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
    '1': [
        {
            id: 'm1',
            role: 'user',
            content: 'Show billing anomalies for January',
            timestamp: new Date('2026-01-30T09:00:00')
        },
        {
            id: 'm2',
            role: 'assistant',
            content: 'Here are the top billing discrepancies detected:\n\n1. **Invoice #9928**: $5,000 (Expected $500)\n2. **Invoice #1021**: Duplicate entry found.\n\nWould you like to generate a report?',
            timestamp: new Date('2026-01-30T09:00:05')
        }
    ],
    '2': [
        {
            id: 'm3',
            role: 'user',
            content: 'Explain welding defect code W-402',
            timestamp: new Date('2026-01-29T16:30:00')
        },
        {
            id: 'm4',
            role: 'assistant',
            content: '### W-402: Incomplete Penetration\n\nThis defect occurs when the weld metal does not extend through the joint thickness. \n\n**Common Causes:**\n- Travel speed too high\n- Insufficient heat input\n- Improper joint design\n\nUse MCP tool `getSOP("W-402")` for mitigation procedures.',
            timestamp: new Date('2026-01-29T16:30:05')
        }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private sessionsSubject = new BehaviorSubject<ChatSession[]>(MOCK_SESSIONS);
    private activeSessionIdSubject = new BehaviorSubject<string | null>(null);
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);

    sessions$ = this.sessionsSubject.asObservable();
    activeSessionId$ = this.activeSessionIdSubject.asObservable();
    messages$ = this.messagesSubject.asObservable();
    isLoading$ = this.isLoadingSubject.asObservable();

    constructor() { }

    loadSession(sessionId: string) {
        this.activeSessionIdSubject.next(sessionId);
        const messages = MOCK_MESSAGES[sessionId] || [];
        this.messagesSubject.next(messages);
    }

    createNewSession() {
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: 'New Chat',
            lastMessage: '',
            timestamp: new Date()
        };

        // Update sessions
        const currentSessions = this.sessionsSubject.value;
        this.sessionsSubject.next([newSession, ...currentSessions]);

        // Set active
        this.activeSessionIdSubject.next(newId);
        this.messagesSubject.next([]);
    }

    sendMessage(content: string) {
        const sessionId = this.activeSessionIdSubject.value;
        if (!sessionId) return;

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, userMsg]);
        this.isLoadingSubject.next(true);

        // Update last message in session
        const sessions = this.sessionsSubject.value.map(s =>
            s.id === sessionId ? { ...s, lastMessage: content, timestamp: new Date() } : s
        );
        this.sessionsSubject.next(sessions);

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I am a mock AI. You said: "${content}". \n\n I can simulate Markdown code blocks:\n \`\`\`typescript\n const mock = "data"; \n \`\`\``,
                timestamp: new Date()
            };

            this.messagesSubject.next([...this.messagesSubject.value, aiMsg]);
            this.isLoadingSubject.next(false);

            // Update last message again
            const updatedSessions = this.sessionsSubject.value.map(s =>
                s.id === sessionId ? { ...s, lastMessage: aiMsg.content, timestamp: new Date() } : s
            );
            this.sessionsSubject.next(updatedSessions);

        }, 2000);
    }
}
