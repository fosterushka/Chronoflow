export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    isChecked: boolean;
}

export interface Meeting {
    id: string;
    platform: "zoom" | "google" | "teams" | "other";
    url: string;
    title: string;
    scheduledFor?: string;
    duration?: number;
}

export interface RelatedItem {
    id: string;
    type: "task" | "file" | "link";
    title: string;
    url?: string;
    taskId?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
}

export interface AuditEntry {
    id: string;
    timestamp: number;
    type: 'create' | 'update' | 'move' | 'status_change' | 'comment';
    field?: string;
    oldValue?: any;
    newValue?: any;
    userId?: string;
    columnId?: string;
}

export interface Card {
    id?: string;
    title: string;
    description: string;
    labels: string[];
    dueDate?: string;
    estimatedTime?: number;
    timeSpent?: number;
    checklist?: ChecklistItem[];
    meetings?: Meeting[];
    relatedItems?: RelatedItem[];
    github?: {
        repo: string;
        assignees: string[];
        cachedContributors: string[];
    };
    auditHistory?: AuditEntry[];
    createdAt?: number;
    updatedAt?: number;
    createdBy?: string;
    lastUpdatedBy?: string;
}

export interface GitHubData {
    repo: string;
    assignees: string[];
    cachedContributors: string[];
}

export interface CardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (card: Card) => void;
    labels: Label[];
    card?: Card | null;
    mode: "add" | "edit";
}

export type TabType = "task" | "github" | "context" | "audit";
