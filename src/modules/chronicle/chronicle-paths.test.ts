import { describe, expect, it } from 'vitest';
import { ChronicleChapter } from '@labcabrera-rmu/rmu-react-shared-lib';
import { chapterPath, moveChapter, neighbours } from './chronicle-paths';

const chapter = (id: string) => ({ id }) as ChronicleChapter;

describe('chronicle paths (workspace spec 102)', () => {
  it('moves a chapter one place and leaves the edges alone', () => {
    const list = ['a', 'b', 'c'];
    expect(moveChapter(list, 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveChapter(list, 1, 1)).toEqual(['a', 'c', 'b']);
    expect(moveChapter(list, 0, -1)).toBe(list);
    expect(moveChapter(list, 2, 1)).toBe(list);
  });

  it('finds the chapters around one', () => {
    const list = [chapter('a'), chapter('b'), chapter('c')];
    expect(neighbours(list, 'b')).toEqual({ previous: list[0], next: list[2] });
    expect(neighbours(list, 'a').previous).toBeUndefined();
    expect(neighbours(undefined, 'a')).toEqual({ previous: undefined, next: undefined });
  });

  it('builds the route of a chapter', () => {
    expect(chapterPath('g', 'c')).toBe('/strategic/games/view/g/chronicle/c');
  });
});
