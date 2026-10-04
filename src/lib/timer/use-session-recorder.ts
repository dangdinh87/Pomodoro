import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  recordSession,
  flushSessionQueue,
  type SessionPayload,
} from './session-recorder';
import { switchActiveTask as switchTask } from './switch-active-task';

/** Session recorder bound to the query cache: refreshes stats on success only. */
export function useSessionRecorder() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['history'] });
  }, [queryClient]);

  const record = useCallback(
    (payload: SessionPayload) => recordSession(payload, invalidate),
    [invalidate],
  );
  const flush = useCallback(() => flushSessionQueue(invalidate), [invalidate]);
  /** Changes the active task, first recording the focus segment of the previous one. */
  const switchActiveTask = useCallback(
    (nextTaskId: string | null) => switchTask(nextTaskId, record),
    [record],
  );

  return { record, flush, switchActiveTask };
}
