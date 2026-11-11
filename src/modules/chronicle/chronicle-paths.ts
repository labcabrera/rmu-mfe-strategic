import { ChronicleChapter } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Route of a chapter of the chronicle of a campaign (workspace spec 102). */
export const chapterPath = (gameId: string, chapterId: string): string =>
  `/strategic/games/view/${gameId}/chronicle/${chapterId}`;

/** React Query key of the chapters of a campaign. */
export const chronicleKey = (gameId: string) => ['chronicle', gameId];

/** The chapters with one moved a place up (-1) or down (1); the same array when it cannot move. */
export const moveChapter = <T>(chapters: T[], index: number, delta: -1 | 1): T[] => {
  const target = index + delta;
  if (index < 0 || index >= chapters.length || target < 0 || target >= chapters.length) return chapters;
  const copy = [...chapters];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
};

/** The chapters before and after one, for the reading navigation. */
export const neighbours = (chapters: ChronicleChapter[] | undefined, id: string) => {
  const index = chapters?.findIndex((chapter) => chapter.id === id) ?? -1;
  if (!chapters || index < 0) return { previous: undefined, next: undefined };
  return { previous: chapters[index - 1], next: chapters[index + 1] };
};
