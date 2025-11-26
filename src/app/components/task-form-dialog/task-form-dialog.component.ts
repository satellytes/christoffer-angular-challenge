import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import {
  Task,
  TaskPriority,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
} from '../../models/task.model';

/**
 * Dialog component for creating and editing tasks
 */
@Component({
  selector: 'app-task-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly data = inject<{ task?: Task }>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditMode = signal(false);
  readonly taskForm!: FormGroup;
  readonly minDate = new Date();

  // Constants for template
  readonly priorities: { value: TaskPriority; config: typeof PRIORITY_CONFIG[TaskPriority] }[] = [
    { value: 'low', config: PRIORITY_CONFIG.low },
    { value: 'medium', config: PRIORITY_CONFIG.medium },
    { value: 'high', config: PRIORITY_CONFIG.high },
  ];

  readonly statuses: { value: TaskStatus; config: typeof STATUS_CONFIG[TaskStatus] }[] = [
    { value: 'open', config: STATUS_CONFIG.open },
    { value: 'completed', config: STATUS_CONFIG.completed },
  ];

  constructor() {
    const task = this.data?.task;
    this.isEditMode.set(!!task);

    this.taskForm = this.fb.group({
      title: [task?.title || '', [Validators.required, Validators.maxLength(200)]],
      description: [
        task?.description || '',
        [Validators.required, Validators.maxLength(2000)],
      ],
      dueDate: [task?.dueDate || null, [Validators.required]],
      priority: [task?.priority || 'medium', [Validators.required]],
      status: [task?.status || 'open', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.taskForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${this.getControlLabel(controlName)} is required`;
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.getControlLabel(controlName)} must be less than ${maxLength} characters`;
    }
    return '';
  }

  /**
   * Get human-readable control label
   */
  private getControlLabel(controlName: string): string {
    const labels: Record<string, string> = {
      title: 'Title',
      description: 'Description',
      dueDate: 'Due date',
      priority: 'Priority',
      status: 'Status',
    };
    return labels[controlName] || controlName;
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const task = this.data?.task;

    if (this.isEditMode() && task) {
      // Update existing task
      const updateDto: UpdateTaskDto = {
        title: formValue.title,
        description: formValue.description,
        dueDate: formValue.dueDate,
        priority: formValue.priority,
        status: formValue.status,
      };
      this.taskService.updateTask(task.id, updateDto);
    } else {
      // Create new task
      const createDto: CreateTaskDto = {
        title: formValue.title,
        description: formValue.description,
        dueDate: formValue.dueDate,
        priority: formValue.priority,
        status: formValue.status,
      };
      this.taskService.createTask(createDto);
    }

    this.dialogRef.close(true);
  }

  /**
   * Cancel and close dialog
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }
}
