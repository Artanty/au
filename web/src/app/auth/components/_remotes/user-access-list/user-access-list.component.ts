import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { dd } from '../../../utilites/dd';
import { PersonAvatarComponent } from '../person-avatar/person-avatar.component';
import { GuiDirective } from '../web-component-wrapper/gui.directive';
import { UserSelectorComponent } from '../user-selector/user-selector.component';

@Component({
  selector: 'app-user-access-list',
  standalone: true,
  imports: [CommonModule, PersonAvatarComponent, GuiDirective, UserSelectorComponent],
  templateUrl: './user-access-list.component.html',
  styleUrl: './user-access-list.component.scss'
})
export class UserAccessListComponent {
  
  public userList: any[] = []
  @Output() itemActionAway = new EventEmitter<any>();
  @Input() set users(data: any[]) {
    console.log(data)
    this.userList = data.map((el, i) => {
      el.role = 'view'
      
      return el
    });
  }
  
  menuItems = [
    { id: 'DELETE', name: 'Удалить' },
  ];
  onItemSelect(user: any, selectedAction: any) {
    this.itemActionAway.emit({ user, selectedAction: selectedAction.id })
  }
}
