import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';

export interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  accessLevel: 'view' | 'edit' | 'admin';
  sharedAt: Date;
}


@Component({
  selector: 'app-shared-with',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-with.component.html',
  styleUrl: './shared-with.component.scss'
})
export class SharedWithComponent implements OnInit, OnDestroy {
  @Input() entityType!: string;
  @Input() entityId!: string;
  @Input() currentUserId!: string;

  sharedUsers$!: Observable<SharedUser[]>;
  loading = false;
  error: string | null = null;

  private entityTypeMap: { [key: string]: string } = {
    'document': 'documents',
    'folder': 'folders',
    'project': 'projects',
    'file': 'files'
  };

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSharedUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSharedUsers(): void {
    this.loading = true;
    this.error = null;

    const urlPath = this.entityTypeMap[this.entityType] || this.entityType;
    const url = `/api/${urlPath}/${this.entityId}/shared-users`;

    this.sharedUsers$ = this.http.post<SharedUser[]>(url, {}).pipe(
      catchError(error => {
        this.error = 'Failed to load shared users';
        this.loading = false;
        console.error('Error loading shared users:', error);
        return of([]);
      }),
      switchMap(users => {
        this.loading = false;
        return of(users);
      }),
      takeUntil(this.destroy$)
    );
  }

  getAccessLevelIcon(accessLevel: string): string {
    const icons = {
      'view': '👁️',
      'edit': '✏️',
      'admin': '⚙️'
    };
    return icons[accessLevel as keyof typeof icons] || '👤';
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }

  refresh(): void {
    this.loadSharedUsers();
  }
}