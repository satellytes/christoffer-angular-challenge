import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { Task, PRIORITY_CONFIG, STATUS_CONFIG } from '../../models/task.model';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';

/**
 * Component displaying detailed view of a single task
 */
@Component({
  selector: 'app-task-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly taskSignal = signal<Task | null>(null);
  readonly task = this.taskSignal.asReadonly();

  // Computed values
  readonly priorityConfig = computed(() => {
    const task = this.task();
    return task ? PRIORITY_CONFIG[task.priority] : null;
  });

  readonly statusConfig = computed(() => {
    const task = this.task();
    return task ? STATUS_CONFIG[task.status] : null;
  });

  readonly isOverdue = computed(() => {
    const task = this.task();
    return task ? task.status === 'open' && task.dueDate < new Date() : false;
  });

  readonly formattedDueDate = computed(() => {
    const task = this.task();
    if (!task) return '';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(task.dueDate);
  });

  readonly formattedCreatedDate = computed(() => {
    const task = this.task();
    if (!task) return '';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(task.createdAt);
  });

  readonly daysUntilDue = computed(() => {
    const task = this.task();
    if (!task) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      const task = this.taskService.getTaskById(taskId);
      if (task) {
        this.taskSignal.set(task);
      } else {
        // Task not found, navigate back to list
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Navigate back to task list
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Toggle task status
   */
  toggleStatus(): void {
    const task = this.task();
    if (task) {
      const updatedTask = this.taskService.toggleTaskStatus(task.id);
      if (updatedTask) {
        this.taskSignal.set(updatedTask);
      }
    }
  }

  /**
   * Open edit dialog
   */
  openEditDialog(): void {
    const task = this.task();
    if (!task) return;

    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh task data
        const updatedTask = this.taskService.getTaskById(task.id);
        if (updatedTask) {
          this.taskSignal.set(updatedTask);
        }
      }
    });
  }

  /**
   * Delete task and navigate back
   */
  deleteTask(): void {
    const task = this.task();
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id);
      this.router.navigate(['/']);
    }
  }
}
