import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MascotState =
  | 'happy'
  | 'focused'
  | 'encouraging'
  | 'sleepy'
  | 'excited'
  | 'worried'
  | 'sad'
  | 'celebrating';

export type MascotEvent =
  | 'TASK_COMPLETE'
  | 'SESSION_START'
  | 'SESSION_END'
  | 'BREAK_START'
  | 'ACHIEVEMENT_UNLOCK'
  | 'STREAK_RISK'
  | 'STREAK_LOST'
  | 'MILESTONE_REACHED'
  | 'CLICK'
  | 'GREETING';

export type MessageType = 'tip' | 'reminder' | 'celebration' | 'greeting';

export interface MascotMessage {
  id: string;
  type: MessageType;
  text: string;
  expression: MascotState;
  duration?: number;
}

interface MascotStore {
  currentState: MascotState;
  previousState: MascotState;
  isAnimating: boolean;
  reducedMotion: boolean;
  isMinimized: boolean;
  currentMessage: MascotMessage | null;
  messageQueue: MascotMessage[];

  // Actions
  setState: (state: MascotState) => void;
  triggerTemporary: (state: MascotState, durationMs: number) => void;
  setReducedMotion: (value: boolean) => void;
  handleEvent: (event: MascotEvent) => void;
  setMinimized: (value: boolean) => void;
  showMessage: (message: MascotMessage) => void;
  dismissMessage: () => void;
  queueMessage: (message: MascotMessage) => void;
  processQueue: () => void;
}

// Timeout reference for temporary state changes
let temporaryTimeout: ReturnType<typeof setTimeout> | null = null;
let messageTimeout: ReturnType<typeof setTimeout> | null = null;

export const useMascotStore = create<MascotStore>()(
  persist(
    (set, get) => ({
      currentState: 'happy',
      previousState: 'happy',
      isAnimating: false,
      reducedMotion: false,
      isMinimized: false,
      currentMessage: null,
      messageQueue: [],

      setState: (state) =>
        set({
          previousState: get().currentState,
          currentState: state,
        }),

      triggerTemporary: (state, durationMs) => {
        // Clear any existing timeout
        if (temporaryTimeout) {
          clearTimeout(temporaryTimeout);
        }

        const prev = get().currentState;
        set({ currentState: state, isAnimating: true });

        temporaryTimeout = setTimeout(() => {
          set({ currentState: prev, isAnimating: false });
          temporaryTimeout = null;
        }, durationMs);
      },

      setReducedMotion: (value) => set({ reducedMotion: value }),

      setMinimized: (value) => set({ isMinimized: value }),

      showMessage: (message) => {
        // Clear any existing message timeout
        if (messageTimeout) {
          clearTimeout(messageTimeout);
        }

        set({
          currentMessage: message,
          currentState: message.expression,
        });

        // Auto-dismiss if message has duration
        if (message.duration) {
          messageTimeout = setTimeout(() => {
            get().dismissMessage();
          }, message.duration);
        }
      },

      dismissMessage: () => {
        if (messageTimeout) {
          clearTimeout(messageTimeout);
          messageTimeout = null;
        }

        set({ currentMessage: null });

        // Process next message in queue
        const { messageQueue, processQueue } = get();
        if (messageQueue.length > 0) {
          setTimeout(processQueue, 300);
        }
      },

      queueMessage: (message) => {
        const { currentMessage, showMessage, messageQueue } = get();

        if (!currentMessage) {
          // Show immediately if no current message
          showMessage(message);
        } else {
          // Add to queue
          set({ messageQueue: [...messageQueue, message] });
        }
      },

      processQueue: () => {
        const { messageQueue, showMessage } = get();

        if (messageQueue.length > 0) {
          const [nextMessage, ...rest] = messageQueue;
          set({ messageQueue: rest });
          showMessage(nextMessage);
        }
      },

      handleEvent: (event) => {
        const { setState, triggerTemporary, queueMessage } = get();

        switch (event) {
          case 'TASK_COMPLETE':
            triggerTemporary('happy', 2000);
            queueMessage({
              id: `task-${Date.now()}`,
              type: 'celebration',
              text: 'Tuyệt vời! Hoàn thành task rồi! 🎉',
              expression: 'celebrating',
              duration: 4000,
            });
            break;
          case 'SESSION_START':
            setState('focused');
            break;
          case 'SESSION_END':
            triggerTemporary('encouraging', 3000);
            queueMessage({
              id: `session-end-${Date.now()}`,
              type: 'celebration',
              text: 'Một pomodoro nữa hoàn thành! Giỏi lắm! 🍅',
              expression: 'excited',
              duration: 4000,
            });
            break;
          case 'BREAK_START':
            setState('sleepy');
            queueMessage({
              id: `break-${Date.now()}`,
              type: 'tip',
              text: 'Nghỉ ngơi xứng đáng! Đứng dậy vận động nhé! ☕',
              expression: 'happy',
              duration: 4000,
            });
            break;
          case 'ACHIEVEMENT_UNLOCK':
            triggerTemporary('excited', 3000);
            break;
          case 'STREAK_RISK':
            setState('worried');
            break;
          case 'STREAK_LOST':
            triggerTemporary('sad', 5000);
            break;
          case 'MILESTONE_REACHED':
            triggerTemporary('celebrating', 5000);
            queueMessage({
              id: `milestone-${Date.now()}`,
              type: 'celebration',
              text: 'Wow! Một cột mốc mới! Bạn thật tuyệt vời! ⭐',
              expression: 'celebrating',
              duration: 5000,
            });
            break;
          case 'CLICK':
            // Handled by component directly
            break;
          case 'GREETING':
            // Handled by component directly
            break;
        }
      },
    }),
    {
      name: 'mascot-state',
      partialize: (state) => ({
        reducedMotion: state.reducedMotion,
        isMinimized: state.isMinimized,
      }),
    }
  )
);
