import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController, ModalController, IonContent } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ObservableArray } from 'wijmo/wijmo';

export interface User {
  Id: string;
  User: string;
  UIId: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  constructor(
    private socket: Socket,
    private router: Router,
  ) { }

  @ViewChild(IonContent) content: IonContent;

  public userObservableArray: ObservableArray = new ObservableArray();
  public subUser: any;

  private connections: User[] = [];
  private objUser: User;

  private socketDetail: any;

  privateprivateprivateMsg = [];

  private isfromChat = false;
  private isActiveChat = false;

  private socketId = '';
  private user: '';
  private currentUser = '';
  private currentUserUIId = '';

  messages = [];
  message = '';
  noOfMessages = 0;

  ngOnInit() {
    this.socket.connect();

    this.socket.fromEvent('user-detail-return').subscribe((data: any) => {
      this.socketId = data.id;
      console.log('socket id: ', this.socketId);
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

    this.socket.fromEvent('message-notification').subscribe((message: any) => {
      let noOfMessages: Element = document.getElementById(message.senderId);
      noOfMessages.innerHTML = message.messageCollectionId;
    });

    this.socket.fromEvent('private message').subscribe((message: any) => {
      console.log('New message: ', message);
      this.messages.push(message);
      setTimeout(() => {
        this.content.scrollToBottom(200);
      });
      console.log('New message: ', message);
    });
  }

  addSocket() {
    this.isActiveChat = true;
    this.currentUser = this.user;
    this.currentUserUIId = this.user + `${new Date().getTime()}`;
    this.connections = null;
    this.socket.emit('set-name', { User: this.user, UIId: this.currentUserUIId });
    console.log("FIRE!");
  }

  receiverId = '';
  receiver = '';

  showModal(userId, user) {
    this.receiverId = userId;
    this.receiver = user;

    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    this.socket.emit('inbox', { receiverId: userId });

    this.socket.fromEvent('message-inbox').subscribe((inbox: any) => {
      this.messages = [];
      console.log("Inbox sms: ", inbox.socket)
      this.messages = inbox.messagesFromInbox;
      setTimeout(() => {
        this.content.scrollToBottom(200);
      });
    });
  }

  sendPrivateMessage() {
    this.socket.emit('privateMsg', { receiverId: this.receiverId, receiver: this.receiver, message: this.message, createdAt: new Date() });
    this.messages.push({ "sender": this.currentUser, "receiverId": "", "receiver": "", "message": this.message, "createdAt": new Date() });
    this.message = '';
    setTimeout(() => {
      this.content.scrollToBottom(200);
    });
  }

  closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
  }
}
