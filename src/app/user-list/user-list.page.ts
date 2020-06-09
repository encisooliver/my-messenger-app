import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ObservableArray } from 'wijmo/wijmo';
import { StorageService, User } from '../ionic-storage-service/storage.service';
import { ChatRoomPage } from '../chat-room/chat-room.page';
import { read } from 'fs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {


  public userObservableArray: ObservableArray = new ObservableArray();
  public subUser: any;

  isValid = true;

  private connections: User[] = [];
  private objUser: User;

  private socketDetail: any;

  private privateprivateprivateMsg = [];

  private isfromChat = false;
  private isActiveChat = false;

  private socketId = '';
  private user: '';
  private currentUser = '';
  private currentUserUIId = '';

  private modal: any = null;
  messages = [];
  message = '';
  noOfMessages = 0;
  isChatBoxOpen = false;

  constructor(
    private socket: Socket,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
  }

  async showModal(userId, userName) {
    this.isChatBoxOpen = true;
    let collectionId = userId + this.socketId;
    this.clearMessageNo(userId);
    this.modal = await this.modalCtrl.create({
      component: ChatRoomPage,
      componentProps: {
        receiverId: userId,
        receiver: userName,
        currentUser: this.currentUser,
        messageCollectionId: collectionId,
      }
    })
    await this.modal.present();
    await this.modal.onDidDismiss().then(() => {
      this.isChatBoxOpen = false;
      this.noOfMessages = 0;
    });
  }

  private filterMessages(messages: any, receiver) {
    let objMessage: any;
    if (messages.length > 0) {
      for (var i; i <= messages.length - 1; i++) {
        if (messages[i].senderId === receiver) {
          objMessage.push(messages[i]);
        }
      }
      return objMessage;
    }
  }


  ngOnInit() {
    this.socket.connect();

    this.socket.fromEvent('new connection').subscribe((data: any) => {
      console.log('new connection: ', data);
      this.activatedRoute.params.subscribe(params => {
        this.currentUserUIId = params["currentUserUIId"];
      });
      this.getUserFromStorage(this.currentUserUIId);
    });

    this.socket.fromEvent('user-detail-return').subscribe((data: any) => {
      this.socketId = data.id;
      console.log('socket id: ', this.socketId);
      this.addToStorage(data);
    });

    this.socket.fromEvent('users-changed').subscribe((data: any) => {
      let connectionObservableArray: ObservableArray = new ObservableArray();
      this.connections = [];

      if (data.clients["length"] > 0) {
        for (var i = 0; i <= data.clients["length"] - 1; i++) {
          if (data.clients[i].username !== undefined && data.clients[i].username !== '' && data.clients[i].uiid !== this.currentUserUIId) {
            connectionObservableArray.push({ Id: data.clients[i].id, User: data.clients[i].username, UIId: data.clients[i].uiid, Room: data.clients[i].room, ToUIId: data.clients[i].touiid });
          }
        }
      }
      this.connections = connectionObservableArray;
      console.log('Connections: ', connectionObservableArray);

    });

    this.socket.fromEvent('set-name-response').subscribe((response: any) => {
      console.log(response.error);
      if (response.error) {
        this.showToastSetNameError(response.responseMessage);
      } else {
        this.isActiveChat = true;
      }
    });

    this.socket.fromEvent('message-notification').subscribe((message: any) => {
      let noOfMessages: Element = document.getElementById(message.senderId);
      let noOfSms;
      if (!this.isChatBoxOpen) {
        let noOfSms = ++this.noOfMessages;
        noOfMessages.innerHTML = noOfSms.toString();
      } else {
        noOfMessages.innerHTML = '';
      }
    });
  }

  userNameKeyPress(event: any) {
    if (this.user.replace(/\s/g, '').length > 0) {
      this.isValid = false;
    } else {
      this.isValid = true;
    }
  }

  clearMessageNo(senderId) {
    let noOfMessages: Element = document.getElementById(senderId);
    noOfMessages.innerHTML = '';
  }


  addToStorage(user: User) {
    this.storageService.addUser(user).then(data => {
    });
  }

  OnPageReload() {
    this.activatedRoute.params.subscribe(params => {
      this.isfromChat = params["fromchat"];
      this.user = params["socketUserName"];
      this.currentUserUIId = params["currentUserUIId"];
      this.socketId = params["socketId"];
    });

    if (this.isfromChat) {
      this.isfromChat = false;
    }
  }

  addSocket() {
    this.currentUser = this.user;
    this.currentUserUIId = this.user + `${new Date().getTime()}`;
    this.connections = null;
    this.socket.emit('set-name', { User: this.user, UIId: this.currentUserUIId });
    console.log("FIRE!");
  }

  private getUserFromStorage(uIId) {
    this.storageService.getUserDetail(uIId);
    this.subUser = this.storageService.userObservable.subscribe(
      data => {
        let userObservableArray = new ObservableArray();
        userObservableArray.push(data);
        this.userObservableArray = userObservableArray;
      }
    );
  }

  async showToastSetNameError(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000,
      color: "danger"
    });
    toast.present();
  }
}
