import { Injectable, computed, signal } from '@angular/core';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilter,
  TaskSort,
  PRIORITY_CONFIG,
} from '../models/task.model';

/**
 * Service for managing tasks with signal-based state management
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Private signals for state management
  private readonly tasksSignal = signal<Task[]>([]);
  private readonly filterSignal = signal<TaskFilter>({});
  private readonly sortSignal = signal<TaskSort>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Public readonly signals
  readonly tasks = this.tasksSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();
  readonly sort = this.sortSignal.asReadonly();

  // Computed signal for filtered tasks
  readonly filteredTasks = computed(() => {
    const tasks = this.tasksSignal();
    const filter = this.filterSignal();

    return tasks.filter((task) => {
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Priority filter
      if (filter.priorities && filter.priorities.length > 0) {
        if (!filter.priorities.includes(task.priority)) {
          return false;
        }
      }

      // Status filter
      if (filter.statuses && filter.statuses.length > 0) {
        if (!filter.statuses.includes(task.status)) {
          return false;
        }
      }

      return true;
    });
  });

  // Computed signal for sorted and filtered tasks
  readonly sortedTasks = computed(() => {
    const tasks = [...this.filteredTasks()];
    const sort = this.sortSignal();

    return tasks.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          comparison = PRIORITY_CONFIG[a.priority].value - PRIORITY_CONFIG[b.priority].value;
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  });

  // Computed signal for task statistics
  readonly taskStats = computed(() => {
    const tasks = this.tasksSignal();
    return {
      total: tasks.length,
      open: tasks.filter((t) => t.status === 'open').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      highPriority: tasks.filter((t) => t.priority === 'high' && t.status === 'open').length,
    };
  });

  /**
   * Initialize service with sample data
   */
  initializeSampleData(): void {
    const sampleTasks: Task[] = [
      {
        id: this.generateId(),
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the task manager application',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: this.generateId(),
        title: 'Review pull requests',
        description: 'Review and approve pending pull requests from team members',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'medium',
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: this.generateId(),
        title: 'Update dependencies',
        description: 'Update all npm dependencies to their latest stable versions',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'low',
        status: 'open',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: this.generateId(),
        title: 'Fix responsive layout issues',
        description: 'Address reported issues with mobile and tablet layouts',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: this.generateId(),
        title: 'Setup CI/CD pipeline',
        description: 'Configure continuous integration and deployment pipeline',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
        priority: 'medium',
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        id: this.generateId(),
        title: 'Implement dark mode',
        description: 'Add dark mode theme support to the application',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        priority: 'low',
        status: 'open',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    this.tasksSignal.set(sampleTasks);
  }

  /**
   * Create a new task
   */
  createTask(dto: CreateTaskDto): Task {
    const newTask: Task = {
      id: this.generateId(),
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      priority: dto.priority,
      status: dto.status || 'open',
      createdAt: new Date(),
    };

    this.tasksSignal.update((tasks) => [...tasks, newTask]);
    return newTask;
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, dto: UpdateTaskDto): Task | null {
    let updatedTask: Task | null = null;

    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          updatedTask = { ...task, ...dto };
          return updatedTask;
        }
        return task;
      })
    );

    return updatedTask;
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): boolean {
    const initialLength = this.tasksSignal().length;
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
    return this.tasksSignal().length < initialLength;
  }

  /**
   * Get a task by ID
   */
  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find((task) => task.id === id);
  }

  /**
   * Toggle task status between open and completed
   */
  toggleTaskStatus(id: string): Task | null {
    let updatedTask: Task | null = null;

    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === id) {
          updatedTask = {
            ...task,
            status: task.status === 'open' ? 'completed' : 'open',
          };
          return updatedTask;
        }
        return task;
      })
    );

    return updatedTask;
  }

  /**
   * Update filter
   */
  updateFilter(filter: TaskFilter): void {
    this.filterSignal.set(filter);
  }

  /**
   * Clear filter
   */
  clearFilter(): void {
    this.filterSignal.set({});
  }

  /**
   * Update sort
   */
  updateSort(sort: TaskSort): void {
    this.sortSignal.set(sort);
  }

  /**
   * Generate a unique ID for tasks
   */
  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
