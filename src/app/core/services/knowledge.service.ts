import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentMetadata {
    id: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
    status: string;
    allowedRoles: string[];
    chunksTotal?: number;
    chunksProcessed?: number;
    progress?: number;
}

@Injectable({
    providedIn: 'root'
})
export class KnowledgeService {
    private http = inject(HttpClient);
    //private apiUrl = 'https://localhost:44333/api/knowledge';
    private apiUrl = 'http://srb096189:8081/api/knowledge';

    getDocuments(): Observable<DocumentMetadata[]> {
        return this.http.get<DocumentMetadata[]>(this.apiUrl);
    }

    uploadDocument(file: File): Observable<DocumentMetadata> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<DocumentMetadata>(`${this.apiUrl}/upload`, formData);
    }

    deleteDocument(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
