// @ts-nocheck
import React from 'react'
import { TaskItem } from './components/task-item'
import { SortableTaskItem } from './components/sortable-task-item'

describe('Task Optimization', () => {
  it('TaskItem is memoized', () => {
    // @ts-ignore
    expect(TaskItem.$$typeof).toBe(Symbol.for('react.memo'))
  })

  it('SortableTaskItem is memoized', () => {
    // @ts-ignore
    expect(SortableTaskItem.$$typeof).toBe(Symbol.for('react.memo'))
  })
})
