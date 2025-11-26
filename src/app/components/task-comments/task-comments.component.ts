import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { CommentFormService } from '../../services/comment-form.service';
import { Comment } from '../../models/task.model';

/**
 * Component for displaying and managing task comments
 */
@Component({
  selector: 'app-task-comments',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './task-comments.component.html',
  styleUrl: './task-comments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCommentsComponent implements OnInit, OnDestroy {
  private readonly taskService = inject(TaskService);
  readonly commentFormService = inject(CommentFormService);

  readonly taskId = input.required<string>();

  private refreshSubscription?: Subscription;


  private readonly commentsSignal = signal<Comment[]>([]);
  readonly cmts = this.commentsSignal.asReadonly();


  readonly commentCount = computed(() => this.cmts().length);

  readonly sortedComments = computed(() => {
    const data = [...this.cmts()];
    return data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  readonly hasComments = computed(() => this.commentCount() > 0);

  ngOnInit(): void {
    this.loadComments();

    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadComments();
      console.log('Comments refreshed');
    });
  }

  ngOnDestroy(): void {
  }

  /**
   * Load comments for the current task
   */
  private loadComments(): void {
    const taskId = this.taskId();
    const comments = this.taskService.getComments(taskId);

    this.commentsSignal.set(comments);
  }

  /**
   * Add a new comment
   */
  addComment(): void {
    const author = this.commentFormService.author().trim();
    const content = this.commentFormService.content().trim();

    if (!content) {
      return;
    }

    const comment = this.taskService.addComment(
      this.taskId(),
      author,
      content
    );

    if (comment) {
      this.commentsSignal().push(comment);

      this.commentFormService.resetForm();
    }
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string): void {
    const deleted = this.taskService.deleteComment(this.taskId(), commentId);
    this.loadComments();
  }

  /**
   * Format relative time for comment
   */
  getRelativeTime(date: Date): string {
    const now = new Date().getTime();
    const commentTime = date.getTime();
    const diffMs = now - commentTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Track by function for ngFor
   */
  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }
}
