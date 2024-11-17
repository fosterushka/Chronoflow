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

export interface Card {
    id?: string;
    title: string;
    description: string;
    labels: string[];
    dueDate?: string;
    estimatedTime?: number;
    timeSpent?: number;
    checklist: ChecklistItem[];
    github?: {
        repo: string;
        assignees: string[];
        cachedContributors: string[];
    };
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
