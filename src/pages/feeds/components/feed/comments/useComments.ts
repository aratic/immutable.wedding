/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getComments } from '@remotes/comments';
import useSWR from 'swr';

const commentsEnabled = process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true';

export function useComments(id: number) {
  const { data, ...rest } = useSWR(
    commentsEnabled ? [id, 'getComments'] : null,
    getComments,
    {
      suspense: true,
    }
  );

  const comments = data ?? [];

  return {
    data: comments,
    isEmpty: comments.length === 0,
    hasOnlyOne: comments.length === 1,
    ...rest,
  };
}
