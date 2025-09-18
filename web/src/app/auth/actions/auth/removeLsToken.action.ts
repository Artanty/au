import { Inject, Injectable } from '@angular/core';
import { HOST_NAME } from 'typlib';
import { IAuthAction } from '../../models/action.model';

@Injectable()
export class RemoveProductAuthTokenAction implements IAuthAction {
  constructor(@Inject(HOST_NAME) private readonly hostName: string) {}

  public execute() {
    // localStorage.removeItem(`${this.hostName}__accessToken`);
    // localStorage.removeItem(`${this.hostName}__refreshToken`);
    removeLocalStorageValue('accessToken')
    removeLocalStorageValue('refreshToken')
    // return true
  }
}

/**
   * Remove a value from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful, false if failed
   */
  const removeLocalStorageValue = (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage value:', error);
      return false;
    }
  }
