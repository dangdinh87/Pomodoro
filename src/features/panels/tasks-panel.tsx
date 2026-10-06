'use client';

import { PanelBody } from '@/components/ui/page-header';
import { TaskManagement } from '@/components/tasks/task-management';

// Guests use tasks right away: their first task starts a guest session.
export default function TasksPanel() {
  return (
    <PanelBody>
      <TaskManagement />
    </PanelBody>
  );
}
