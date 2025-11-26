import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import {
  TaskPriority,
  TaskStatus,
  TaskSortField,
  TaskSortDirection,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';

/**
 * Component displaying a list of tasks with search, filter, and sort capabilities
 */
@Component({
  selector: 'app-task-list',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    TaskCardComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // Local state for form inputs
  readonly searchTermSignal = signal('');
  readonly selectedPrioritiesSignal = signal<TaskPriority[]>([]);
  readonly selectedStatusesSignal = signal<TaskStatus[]>([]);
  readonly sortFieldSignal = signal<TaskSortField>('createdAt');
  readonly sortDirectionSignal = signal<TaskSortDirection>('desc');

  // Service signals
  readonly tasks = this.taskService.sortedTasks;
  readonly filter = this.taskService.filter;

  // Constants for template
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high'];
  readonly statuses: TaskStatus[] = ['open', 'completed'];
  readonly priorityConfig = PRIORITY_CONFIG;
  readonly statusConfig = STATUS_CONFIG;

  readonly sortFields: { value: TaskSortField; label: string }[] = [
    { value: 'title', label: 'Title' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'createdAt', label: 'Created' },
    { value: 'status', label: 'Status' },
  ];

  // Computed signal for empty state
  readonly isEmpty = computed(() => this.tasks().length === 0);
  readonly hasActiveFilter = computed(() => {
    const filter = this.filter();
    return !!(
      filter.searchTerm ||
      (filter.priorities && filter.priorities.length > 0) ||
      (filter.statuses && filter.statuses.length > 0)
    );
  });

  /**
   * Update search term and apply filter
   */
  onSearchChange(searchTerm: string): void {
    this.searchTermSignal.set(searchTerm);
    this.applyFilter();
  }

  /**
   * Toggle priority filter
   */
  togglePriorityFilter(priority: TaskPriority): void {
    this.selectedPrioritiesSignal.update((priorities) => {
      const index = priorities.indexOf(priority);
      if (index >= 0) {
        return priorities.filter((p) => p !== priority);
      } else {
        return [...priorities, priority];
      }
    });
    this.applyFilter();
  }

  /**
   * Toggle status filter
   */
  toggleStatusFilter(status: TaskStatus): void {
    this.selectedStatusesSignal.update((statuses) => {
      const index = statuses.indexOf(status);
      if (index >= 0) {
        return statuses.filter((s) => s !== status);
      } else {
        return [...statuses, status];
      }
    });
    this.applyFilter();
  }

  /**
   * Check if priority is selected
   */
  isPrioritySelected(priority: TaskPriority): boolean {
    return this.selectedPrioritiesSignal().includes(priority);
  }

  /**
   * Check if status is selected
   */
  isStatusSelected(status: TaskStatus): boolean {
    return this.selectedStatusesSignal().includes(status);
  }

  /**
   * Apply current filter to task service
   */
  private applyFilter(): void {
    this.taskService.updateFilter({
      searchTerm: this.searchTermSignal() || undefined,
      priorities: this.selectedPrioritiesSignal().length > 0
        ? this.selectedPrioritiesSignal()
        : undefined,
      statuses: this.selectedStatusesSignal().length > 0
        ? this.selectedStatusesSignal()
        : undefined,
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTermSignal.set('');
    this.selectedPrioritiesSignal.set([]);
    this.selectedStatusesSignal.set([]);
    this.taskService.clearFilter();
  }

  /**
   * Update sort
   */
  onSortChange(): void {
    this.taskService.updateSort({
      field: this.sortFieldSignal(),
      direction: this.sortDirectionSignal(),
    });
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection(): void {
    this.sortDirectionSignal.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    this.onSortChange();
  }

  /**
   * Open create task dialog
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Task was created successfully
      }
    });
  }

  /**
   * Navigate to task detail
   */
  viewTaskDetail(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  /**
   * Handle task deletion
   */
  onTaskDeleted(taskId: string): void {
    // Task is already deleted by TaskCardComponent
    // This is just for potential additional logic
  }

  /**
   * Handle task status toggle
   */
  onTaskStatusToggled(taskId: string): void {
    // Task status is already toggled by TaskCardComponent
    // This is just for potential additional logic
  }
}
