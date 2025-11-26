import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TaskService } from './services/task.service';
import { TaskFilter } from './models/task.model';

/**
 * Root component of the application
 * Provides navigation and layout structure
 */
@Component({
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Sidenav state
  private readonly sidenavOpenedSignal = signal(true);
  private readonly isMobileSignal = signal(false);

  readonly sidenavOpened = this.sidenavOpenedSignal.asReadonly();
  readonly stats = this.taskService.taskStats;
  readonly currentFilter = this.taskService.filter;

  // Compute sidenav mode based on screen size
  readonly sidenavMode = computed(() => {
    return this.isMobileSignal() ? 'over' : 'side';
  });

  // Computed signals for active quick filters
  readonly isHighPriorityFilterActive = computed(() => {
    const filter = this.currentFilter();
    return (
      filter.priorities?.length === 1 &&
      filter.priorities[0] === 'high' &&
      filter.statuses?.length === 1 &&
      filter.statuses[0] === 'open'
    );
  });

  readonly isOpenFilterActive = computed(() => {
    const filter = this.currentFilter();
    return (
      filter.statuses?.length === 1 &&
      filter.statuses[0] === 'open' &&
      !filter.priorities
    );
  });

  readonly isCompletedFilterActive = computed(() => {
    const filter = this.currentFilter();
    return (
      filter.statuses?.length === 1 &&
      filter.statuses[0] === 'completed' &&
      !filter.priorities
    );
  });

  ngOnInit(): void {
    // Initialize sample data
    this.taskService.initializeSampleData();

    // Observe breakpoint changes
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        const isMobile = result.matches;
        this.isMobileSignal.set(isMobile);
        // Auto-close sidenav on mobile
        if (isMobile) {
          this.sidenavOpenedSignal.set(false);
        } else {
          this.sidenavOpenedSignal.set(true);
        }
      });
  }

  /**
   * Toggle sidenav open/closed
   */
  toggleSidenav(): void {
    this.sidenavOpenedSignal.update((opened) => !opened);
  }

  /**
   * Close sidenav on mobile devices
   */
  closeSidenavOnMobile(): void {
    if (this.isMobileSignal()) {
      this.sidenavOpenedSignal.set(false);
    }
  }

  /**
   * Apply quick filter from sidebar (with toggle functionality)
   */
  applyQuickFilter(filterType: string): void {
    // Check if this filter is already active
    let isActive = false;
    switch (filterType) {
      case 'high-priority':
        isActive = this.isHighPriorityFilterActive();
        break;
      case 'open':
        isActive = this.isOpenFilterActive();
        break;
      case 'completed':
        isActive = this.isCompletedFilterActive();
        break;
    }

    // If already active, clear filter. Otherwise, apply it.
    if (isActive) {
      this.taskService.clearFilter();
    } else {
      let filter: TaskFilter = {};
      switch (filterType) {
        case 'high-priority':
          filter = { priorities: ['high'], statuses: ['open'] };
          break;
        case 'open':
          filter = { statuses: ['open'] };
          break;
        case 'completed':
          filter = { statuses: ['completed'] };
          break;
      }
      this.taskService.updateFilter(filter);
    }
  }
}
