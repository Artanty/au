import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
  
@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-selector.component.html',
  styleUrl: './user-selector.component.scss'
})
export class UserSelectorComponent {

  @Input() selectedUsers: any[] = [];
  @Output() usersSelected = new EventEmitter<any[]>();
  
  allUsers: any[] = [];
  filteredUsers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    const data = { "id": 1 }
    await this.http.post<any[]>(`${process.env['AU_BACK_URL']}/provider/getProviderUsers`, data).toPromise()
      .then(res => {
        this.allUsers = res || [];
      });
    this.filteredUsers = this.allUsers;
  }

  searchUsers(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  selectUser(user: any) {
    this.usersSelected.emit([...this.selectedUsers, user]);
  }
}