import { useState } from 'react';
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/stores/task-store';

interface UseTaskDndProps {
  tasks: Task[];
  onReorder: (
    taskOrders: { id: string; displayOrder: number }[],
  ) => Promise<void>;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function useTaskDnd({
  tasks,
  onReorder,
  onUpdateStatus,
}: UseTaskDndProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    // Check if it's a cross-column drag (kanban mode)
    const overId = over.id as string;
    const activeId = active.id as string;

    // 1. If overId is a status (column), update task status
    const statusIds: TaskStatus[] = ['todo', 'doing', 'done'];
    if (statusIds.includes(overId as TaskStatus)) {
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== overId && onUpdateStatus) {
        await onUpdateStatus(activeId, overId as TaskStatus);
      }
      return;
    }

    // 2. If overId is another task, check its status for cross-column move
    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (activeTask && overTask && activeTask.status !== overTask.status) {
      if (onUpdateStatus) {
        await onUpdateStatus(activeId, overTask.status);
      }
      return;
    }

    // 3. Otherwise, it's a reorder within the same list
    const oldIndex = tasks.findIndex((t) => t.id === activeId);
    const newIndex = tasks.findIndex((t) => t.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

    // Calculate new display orders
    const taskOrders = reorderedTasks.map((task, index) => ({
      id: task.id,
      displayOrder: index,
    }));

    await onReorder(taskOrders);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDragging(false);
  };

  return {
    sensors,
    activeId,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
