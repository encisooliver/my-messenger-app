import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ObservableArray } from 'wijmo/wijmo';
import { Subject } from 'rxjs';

export interface User {
  Id: string;
  User: string;
  UIId: string;
}

const USER_KEY = "user";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  public userSubject = new Subject<ObservableArray>();
  public userObservable = this.userSubject.asObservable();

  addUser(user: User): Promise<any> {
    return this.storage.get(USER_KEY).then((users: User[]) => {
      if (users) {
        users.push(user);
        return this.storage.set(USER_KEY, users);
      } else {
        return this.storage.set(USER_KEY, [user]);
      }
    });
  }

  getUsers(): Promise<User[]> {
    return this.storage.get(USER_KEY);
  }

  getUserDetail(uiid: String) {
    let UserObservableArray = new ObservableArray();
    this.userSubject.next(UserObservableArray);

    return this.storage.get(USER_KEY).then(
      response => {
        var results = response;

        if (results["length"] > 0) {
          for (var i = 0; i <= results["length"] - 1; i++) {
            if (results[i].uiid == uiid) {
              console.log(`${new Date().getTime()}`, " Current: ", results[i].username)
              UserObservableArray.push(results[i].username);
              break;
            }
          }
        }

        this.userSubject.next(UserObservableArray);
      });
  }

  updateItem(user: User): Promise<any> {
    return this.storage.get(USER_KEY).then((users: User[]) => {
      if (!users || users.length === 0) {
        return null;
      }
      let newUsers: User[] = [];
      for (let i of users) {
        if (i.UIId === user.UIId) {
          newUsers.push(user);
        } else {
          newUsers.push(i);
        }
      }

      return this.storage.set(USER_KEY, newUsers);
    });
  }

  deleteUser(uiid: string) {
    return this.storage.get(USER_KEY).then((users: User[]) => {
      if (!users || users.length === 0) {
        return null;
      }
      let toKeep: User[] = [];

      for (let user of users) {
        if (user.UIId !== uiid) {
          toKeep.push(user);
        }
      }

      return this.storage.set(USER_KEY, toKeep);
    });
  }
}
