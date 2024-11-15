import { useCallback, useState, useEffect } from "preact/hooks";
import { JSX } from "preact";
import AddCardModal from "./AddCardModal.tsx";
import EditCardModal from "./EditCardModal.tsx";
import DeleteCardModal from "./DeleteCardModal.tsx";
import Sidebar from "./Sidebar.tsx";
import type { Card, Column, Label, DraggedCard, EditingCard } from "../types/index.ts";

const BOARD_UPDATE_EVENT = 'board-update';

export const dispatchBoardUpdate = (columns: Column[]) => {
  globalThis.dispatchEvent(new CustomEvent(BOARD_UPDATE_EVENT, { detail: { columns } }));
};

export const LABELS: Label[] = [
  { id: "bug", name: "Bug", color: "bg-red-500" },
  { id: "feature", name: "Feature", color: "bg-blue-500" },
  { id: "enhancement", name: "Enhancement", color: "bg-green-500" },
  { id: "documentation", name: "Documentation", color: "bg-purple-500" },
  { id: "design", name: "Design", color: "bg-yellow-500" },
  { id: "refactor", name: "Refactor", color: "bg-orange-500" },
];

export const COLUMNS: Omit<Column, 'cards'>[] = [
  { id: "todo", title: "To Do" },
  { id: "inProgress", title: "In Progress" },
  { id: "codeReview", title: "Code Review" },
  { id: "testing", title: "Testing" },
  { id: "done", title: "Done" },
];

export function clearStorage(setColumns: (cols: Column[]) => void) {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    const emptyColumns = COLUMNS.map(col => ({ ...col, cards: [] }));
    localStorage.setItem('chronoflowColumns', JSON.stringify(emptyColumns));
    setColumns(emptyColumns);
    dispatchBoardUpdate(emptyColumns);
  }
}

export function exportData(columns: Column[]) {
  const data = JSON.stringify(columns, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chronoflow-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(
  file: File | undefined,
  setColumns: (cols: Column[]) => void
) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);
      
      // Validate the data structure
      if (Array.isArray(data) && data.every(col => 
        col.id && col.title && Array.isArray(col.cards) &&
        col.cards.every((card: any) => card.id && card.title)
      )) {
        // Initialize timeSpent and other missing properties
        const processedData = data.map((col: Column) => ({
          ...col,
          cards: col.cards.map(card => ({
            ...card,
            timeSpent: card.timeSpent || 0,
            isTracking: false,
            lastTrackingStart: undefined,
          })),
        }));

        localStorage.setItem('chronoflowColumns', JSON.stringify(processedData));
        setColumns(processedData);
        dispatchBoardUpdate(processedData);
      } else {
        alert('Invalid file format');
      }
    } catch (error) {
      alert('Error importing file');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

export default function Board() {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedData = localStorage.getItem('chronoflowColumns');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((col: Column) => ({
          ...col,
          cards: col.cards.map(card => ({
            ...card,
            timeSpent: card.timeSpent || 0,
            isTracking: false,
            lastTrackingStart: undefined,
          })),
        }));
      }
      return COLUMNS.map(col => ({ ...col, cards: [] }));
    }
    return COLUMNS.map(col => ({ ...col, cards: [] }));
  });

  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<{ card: Card; columnId: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setColumns(prevColumns => {
      let hasUpdates = false;
      const newColumns = prevColumns.map(column => ({
        ...column,
        cards: column.cards.map(card => {
          if (card.isTracking) {
            hasUpdates = true;
            const elapsedTime = Math.floor((currentTime - (card.lastTrackingStart || 0)) / 1000);
            return {
              ...card,
              timeSpent: (card.timeSpent || 0) + elapsedTime,
              lastTrackingStart: currentTime,
            };
          }
          return card;
        }),
      }));
      return hasUpdates ? newColumns : prevColumns;
    });
  }, [currentTime]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('chronoflowColumns', JSON.stringify(columns));
      dispatchBoardUpdate(columns);
    }
  }, [columns]);

  useEffect(() => {
    const handleBoardUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.columns) {
        setColumns(customEvent.detail.columns);
      }
    };

    globalThis.addEventListener(BOARD_UPDATE_EVENT, handleBoardUpdate);
    return () => globalThis.removeEventListener(BOARD_UPDATE_EVENT, handleBoardUpdate);
  }, []);

  const handleDragStart = useCallback((card: Card, columnId: string) => {
    setDraggedCard({ card, columnId });
  }, []);

  const handleDragOver = useCallback((e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedCard) return;

    const { card, columnId: sourceColumnId } = draggedCard;
    if (sourceColumnId === targetColumnId) return;

    // When moving to Done column, stop tracking if active
    if (targetColumnId === 'done' && card.isTracking) {
      card.isTracking = false;
      card.lastTrackingStart = undefined;
    }

    setColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            cards: column.cards.filter(c => c.id !== card.id)
          };
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            cards: [...column.cards, card]
          };
        }
        return column;
      });
    });
    
    setDraggedCard(null);
  }, [draggedCard]);

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    setColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            cards: column.cards.filter(card => card.id !== cardId),
          };
        }
        return column;
      });
    });
  }, []);

  const toggleTracking = useCallback((columnId: string, cardId: string) => {
    // Don't allow tracking in Done column
    if (columnId === 'done') return;

    setColumns(prevColumns => {
      const targetCard = prevColumns
        .find(col => col.id === columnId)
        ?.cards.find(card => card.id === cardId);

      if (targetCard && !targetCard.isTracking) {
        return prevColumns.map(column => ({
          ...column,
          cards: column.cards.map(card => {
            if (card.id === cardId && column.id === columnId) {
              return {
                ...card,
                isTracking: true,
                lastTrackingStart: Date.now(),
              };
            } else if (card.isTracking) {
              return {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
              };
            }
            return card;
          }),
        }));
      } else {
        return prevColumns.map(column => ({
          ...column,
          cards: column.cards.map(card => 
            card.id === cardId && column.id === columnId
              ? { ...card, isTracking: false, lastTrackingStart: undefined }
              : card
          ),
        }));
      }
    });
  }, []);

  const openAddModal = useCallback((columnId: string) => {
    setActiveColumn(columnId);
    setIsAddModalOpen(true);
  }, []);

  const handleAddCard = useCallback((cardData: Omit<Card, "id" | "timeSpent" | "isTracking">) => {
    if (!activeColumn) return;

    const newCard: Card = {
      ...cardData,
      id: crypto.randomUUID(),
      timeSpent: 0,
      isTracking: false,
    };

    setColumns((prevColumns: any[]) => {
      return prevColumns.map((column: { id: any; cards: any; }) => {
        if (column.id === activeColumn) {
          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }
        return column;
      });
    });

    setIsAddModalOpen(false);
    setActiveColumn(null);
  }, [activeColumn]);

  const handleEditCard = useCallback((updatedCard: Card) => {
    if (!editingCard) return;

    setColumns((prevColumns: any[]) => {
      return prevColumns.map((column: { id: any; cards: any[]; }) => {
        if (column.id === editingCard.columnId) {
          return {
            ...column,
            cards: column.cards.map((card: { id: string; }) => 
              card.id === updatedCard.id ? updatedCard : card
            ),
          };
        }
        return column;
      });
    });

    setIsEditModalOpen(false);
    setEditingCard(null);
  }, [editingCard]);

  const openEditModal = useCallback((card: Card, columnId: string) => {
    setEditingCard({ card, columnId });
    setIsEditModalOpen(true);
  }, []);

  const getStatistics = useCallback(() => {
    const totalTasks = columns.reduce((acc: any, col: { cards: string | any[]; }) => acc + col.cards.length, 0);
    const completedTasks = columns.find((col: { id: string; }) => col.id === "done")?.cards.length || 0;
    const totalEstimatedTime = columns.reduce((acc: any, col: { cards: any[]; }) => 
      acc + col.cards.reduce((sum: any, card: { estimatedTime: any; }) => sum + (card.estimatedTime || 0), 0), 0
    );
    const totalTimeSpent = columns.reduce((acc: any, col: { cards: any[]; }) => 
      acc + col.cards.reduce((sum: any, card: { timeSpent: any; }) => sum + (card.timeSpent || 0), 0), 0
    );
    
    return { 
      totalTasks, 
      completedTasks, 
      totalEstimatedTime: totalEstimatedTime || 0,
      totalTimeSpent: totalTimeSpent || 0
    };
  }, [columns]);

  const formatTime = useCallback((seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }, []);

  const hasExceededEstimatedTime = (card: Card) => {
    if (!card.estimatedTime) return false;
    const estimatedTimeInSeconds = card.estimatedTime * 60;
    return card.timeSpent > estimatedTimeInSeconds;
  };

  const isNearingEstimatedTime = (card: Card) => {
    if (!card.estimatedTime) return false;
    const estimatedTimeInSeconds = card.estimatedTime * 60;
    const halfTime = estimatedTimeInSeconds / 2;
    return card.timeSpent >= halfTime && card.timeSpent <= estimatedTimeInSeconds;
  };

  const getTimeBasedColor = (card: Card, columnId: string) => {
    if (hasExceededEstimatedTime(card)) {
      return 'bg-red-50/80 dark:bg-red-900/30 ring-2 ring-red-500/50';
    }
    if (isNearingEstimatedTime(card)) {
      return 'bg-amber-50/80 dark:bg-amber-900/30 ring-1 ring-amber-500/50';
    }
    return 'bg-gray-50/80 dark:bg-gray-700/50';
  };

  const handleDeleteCard = (card: Card, columnId: string) => {
    setDeletingCard({ card, columnId });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCard = () => {
    if (!deletingCard) return;

    setColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column.id === deletingCard.columnId) {
          return {
            ...column,
            cards: column.cards.filter(card => card.id !== deletingCard.card.id),
          };
        }
        return column;
      });
    });

    setIsDeleteModalOpen(false);
    setDeletingCard(null);
  };

  const stats = getStatistics();

  return (
    <div class="flex h-screen">
      <Sidebar 
        stats={stats}
        activeTask={
          columns.some(col => col.cards.some(card => card.isTracking))
            ? {
                title: columns.find(col => 
                  col.cards.some(card => card.isTracking)
                )?.cards.find(card => 
                  card.isTracking
                )?.title || ""
              }
            : undefined
        }
      />
      
      <div class="flex-1 p-6 overflow-hidden bg-gray-100/50 dark:bg-gray-900">
        <div class="flex gap-6 h-full min-h-0">
          {columns.map(column => (
            <div
              key={column.id}
              class="flex-1 flex flex-col bg-gray-200/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm min-w-[280px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div class="p-4 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <div class={`w-2 h-2 rounded-full ${
                    column.id === 'todo' ? 'bg-indigo-500' :
                    column.id === 'inProgress' ? 'bg-amber-500' :
                    column.id === 'codeReview' ? 'bg-purple-500' :
                    column.id === 'testing' ? 'bg-blue-500' :
                    'bg-emerald-500'
                  }`}></div>
                  <h2 class="font-medium text-gray-700 dark:text-gray-200">
                    {column.title}
                  </h2>
                  <span class="text-sm text-gray-500 dark:text-gray-500">
                    {column.cards.length}
                  </span>
                </div>
                {column.id !== 'done' && (
                  <button
                    onClick={() => openAddModal(column.id)}
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              <div class="overflow-y-auto flex-1 p-4 space-y-3">
                {column.cards.map(card => (
                  <div
                    key={card.id}
                    class={`group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-500 cursor-move
                      ${getTimeBasedColor(card, column.id)}
                      ${card.isTracking ? 'ring-2 ring-emerald-500/20' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(card, column.id)}
                    onClick={() => openEditModal(card, column.id)}
                  >
                    <div class="p-3">
                      <div class="flex flex-wrap gap-1.5 mb-2">
                        {card.labels.map(labelId => {
                          const label = LABELS.find(l => l.id === labelId);
                          return label ? (
                            <span key={label.id} class={`${label.color} bg-opacity-10 dark:bg-opacity-20 text-xs px-2 py-0.5 rounded-full`}>
                              {label.name}
                            </span>
                          ) : null;
                        })}
                      </div>

                      <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {card.title}
                      </h3>
                      
                      {card.description && (
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {card.description}
                        </p>
                      )}

                      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div class="space-x-3">
                          {card.dueDate && (
                            <span class="inline-flex items-center gap-1">
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {card.dueDate}
                            </span>
                          )}
                          {card.estimatedTime && (
                            <span class={`inline-flex items-center gap-1 ${hasExceededEstimatedTime(card) ? 'text-red-500 dark:text-red-400' : ''}`}>
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {Math.floor(card.estimatedTime / 60)}h {card.estimatedTime % 60}m
                            </span>
                          )}
                        </div>

                        {column.id !== 'done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTracking(column.id, card.id);
                            }}
                            class={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-2 py-1 rounded text-xs font-medium ${
                              card.isTracking
                                ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            }`}
                          >
                            {card.isTracking ? "Stop" : "Start"}
                          </button>
                        )}
                      </div>

                      <div class="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {card.estimatedTime && (
                          <div>
                            Est: {Math.floor(card.estimatedTime / 60)}h {card.estimatedTime % 60}m
                          </div>
                        )}
                        <div>
                          Time spent: {formatTime(card.timeSpent)}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card, column.id);
                        }}
                        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveColumn(null);
        }}
        onSubmit={handleAddCard}
        labels={LABELS}
      />

      {editingCard && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleEditCard}
          card={editingCard.card}
          labels={LABELS}
        />
      )}

      {deletingCard && (
        <DeleteCardModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingCard(null);
          }}
          onConfirm={confirmDeleteCard}
          card={deletingCard.card}
        />
      )}
    </div>
  );
}
