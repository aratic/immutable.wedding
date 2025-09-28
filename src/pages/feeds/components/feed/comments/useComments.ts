/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getComments } from '@remotes/comments';
import useSWR from 'swr';

export function useComments(id: number) {
  const { data, ...rest } = useSWR([id, 'getComments'], getComments, {
    suspense: true,
  });

  const comments = data ?? [];

  return {
    data: comments,
    isEmpty: comments.length === 0,
    hasOnlyOne: comments.length === 1,
    ...rest,
  };
}
