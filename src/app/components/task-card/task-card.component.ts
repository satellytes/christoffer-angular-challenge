import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Task, PRIORITY_CONFIG, STATUS_CONFIG } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';

/**
 * Component displaying a single task as a card
 */
@Component({
  selector: 'app-task-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  // Inputs
  readonly task = input.required<Task>();

  // Outputs
  readonly taskClick = output<string>();
  readonly taskDeleted = output<string>();
  readonly taskStatusToggled = output<string>();

  // Computed values
  readonly priorityConfig = computed(() => PRIORITY_CONFIG[this.task().priority]);
  readonly statusConfig = computed(() => STATUS_CONFIG[this.task().status]);
  readonly isOverdue = computed(() => {
    const task = this.task();
    return task.status === 'open' && task.dueDate < new Date();
  });
  readonly formattedDueDate = computed(() => {
    const date = this.task().dueDate;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  });
  readonly daysUntilDue = computed(() => {
    const task = this.task();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });
  readonly dueDateLabel = computed(() => {
    const days = this.daysUntilDue();
    if (days < 0) {
      return `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else if (days <= 7) {
      return `Due in ${days} days`;
    } else {
      return this.formattedDueDate();
    }
  });

  /**
   * Handle card click
   */
  onCardClick(event: MouseEvent): void {
    // Only emit if not clicking on a button
    const target = event.target as HTMLElement;
    if (!target.closest('button')) {
      this.taskClick.emit(this.task().id);
    }
  }

  /**
   * Toggle task status
   */
  onToggleStatus(event: Event): void {
    event.stopPropagation();
    this.taskService.toggleTaskStatus(this.task().id);
    this.taskStatusToggled.emit(this.task().id);
  }

  /**
   * Open edit dialog
   */
  onEdit(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { task: this.task() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Task was updated successfully
      }
    });
  }

  /**
   * Delete task
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${this.task().title}"?`)) {
      this.taskService.deleteTask(this.task().id);
      this.taskDeleted.emit(this.task().id);
    }
  }

  /**
   * Handle keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.taskClick.emit(this.task().id);
    }
  }
}
