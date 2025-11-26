/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task status
 */
export type TaskStatus = 'open' | 'completed';

/**
 * Task interface representing a single task
 */
export interface Task {
  /**
   * Unique identifier for the task
   */
  id: string;

  /**
   * Task title (required)
   */
  title: string;

  /**
   * Detailed description of the task
   */
  description: string;

  /**
   * Due date for the task
   */
  dueDate: Date;

  /**
   * Priority level of the task
   */
  priority: TaskPriority;

  /**
   * Current status of the task
   */
  status: TaskStatus;

  /**
   * Timestamp when the task was created
   */
  createdAt: Date;
}

/**
 * DTO for creating a new task (without id and createdAt)
 */
export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status?: TaskStatus;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}

/**
 * Task filter options
 */
export interface TaskFilter {
  searchTerm?: string;
  priorities?: TaskPriority[];
  statuses?: TaskStatus[];
}

/**
 * Task sort options
 */
export type TaskSortField = 'title' | 'dueDate' | 'priority' | 'createdAt' | 'status';
export type TaskSortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: TaskSortDirection;
}

/**
 * Priority display configuration
 */
export interface PriorityConfig {
  label: string;
  color: string;
  icon: string;
  value: number;
}

/**
 * Priority configuration map
 */
export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  low: {
    label: 'Low',
    color: '#4caf50',
    icon: 'arrow_downward',
    value: 1,
  },
  medium: {
    label: 'Medium',
    color: '#ff9800',
    icon: 'remove',
    value: 2,
  },
  high: {
    label: 'High',
    color: '#f44336',
    icon: 'arrow_upward',
    value: 3,
  },
};

/**
 * Status display configuration
 */
export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
}

/**
 * Status configuration map
 */
export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  open: {
    label: 'Open',
    color: '#2196f3',
    icon: 'radio_button_unchecked',
  },
  completed: {
    label: 'Completed',
    color: '#4caf50',
    icon: 'check_circle',
  },
};
