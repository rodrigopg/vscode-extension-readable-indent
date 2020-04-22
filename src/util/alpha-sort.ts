import findEntireWordIndex from './string-util';
import { strict } from 'assert';

const arraySort = (lineA: string, lineB: string): number => {
  const aLevel = getPriorityLevel(lineA.trim());
  const bLevel = getPriorityLevel(lineB.trim());

  if (aLevel !== bLevel) {
    return (aLevel < bLevel) ? -1 : 1;
  }

  return (lineA.trim() < lineB.trim()) ? -1 : 1;
};

export const customSort = (a: string[]): string[] => {
  const b = [...a].sort(arraySort);
  const preservedNewlines: string[] = a.map((s, idx) => {
    // if (s.trim() === '') {
    //   return '';
    // }

    return b.shift() || '';
  });

  return preservedNewlines;
};

export default customSort;

const getPriorityLevel = (s: string): Number => {
  let priorityWords: any = {
    'local': { level: 0 },
    'private': { level: 1 },
    'default': { level: 2 },
    'public': { level: 3 }
  };

  for (let word in priorityWords) {
    if (findEntireWordIndex(s, word) > -1) {
      return priorityWords[word].level;
    }
  }

  return 999;
};