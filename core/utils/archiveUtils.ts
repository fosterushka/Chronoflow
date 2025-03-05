import { Card, Column } from "../types/index.ts";

interface ArchivedCard extends Card {
  deletedAt: number;
  originalColumnId: string;
}

const ARCHIVE_KEY = "chronoflow_archive";
const ARCHIVE_DAYS_LIMIT = 1;

export const archiveCard = (card: Card, columnId: string) => {
  const archive = getArchive();
  const archivedCard: ArchivedCard = {
    ...card,
    deletedAt: Date.now(),
    originalColumnId: columnId,
  };

  archive.push(archivedCard);
  cleanupOldArchives();
  saveArchive(archive);
};

export const restoreCard = (
  cardId: string,
): { card: Card; columnId: string } | null => {
  const archive = getArchive();
  const archivedCard = archive.find((card) => card.id === cardId);

  if (!archivedCard) return null;

  const newArchive = archive.filter((card) => card.id !== cardId);
  saveArchive(newArchive);

  const { deletedAt, originalColumnId, ...restoredCard } = archivedCard;
  return {
    card: restoredCard,
    columnId: originalColumnId,
  };
};

export const getArchive = (): ArchivedCard[] => {
  if (typeof localStorage === "undefined") return [];

  const archived = localStorage.getItem(ARCHIVE_KEY);
  return archived ? JSON.parse(archived) : [];
};

const saveArchive = (archive: ArchivedCard[]) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
};

const cleanupOldArchives = () => {
  const archive = getArchive();
  const cutoffTime = Date.now() - (ARCHIVE_DAYS_LIMIT * 24 * 60 * 60 * 1000);

  const newArchive = archive.filter((card) => card.deletedAt > cutoffTime);
  saveArchive(newArchive);
};

export const getRecentlyDeletedCards = (): ArchivedCard[] => {
  const archive = getArchive();
  return archive.sort((a, b) => b.deletedAt - a.deletedAt);
};

export const clearArchive = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ARCHIVE_KEY);
};
