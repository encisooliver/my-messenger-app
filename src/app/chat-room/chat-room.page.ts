import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController, IonContent } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from "@angular/common";
import { ModalController } from '@ionic/angular';
import { Color } from 'wijmo/wijmo';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {
  @Input() receiverId: any;
  @Input() receiver: any;
  @Input() currentUser: any;
  @Input() messagesFrom: any;
  @Input() messageCollectionId: any;
  @ViewChild(IonContent) content: IonContent;

  headerDetail
  message = '';
  messages = [];
  isTyping = false;

  constructor(private socket: Socket,
    private modalCtrl: ModalController,
  ) {

    this.socket.fromEvent('private message').subscribe((message: any) => {
      this.headerDetail = this.currentUser + ", " + this.receiver;
      console.log('New message: ', message);

      for (var i = 0; i <= this.messages["length"] - 1; i++) {
        if (this.messages[i].type === 'typing-event') {
          this.messages.splice(this.messages.indexOf(this.messages[i]), 1);
        }
      }

      this.messages.push(message);
      setTimeout(() => {
        this.content.scrollToBottom(200);
      });
      console.log('New message: ', message);
    });
  }

  ngOnInit() {
    this.headerDetail = this.currentUser + ", " + this.receiver;
    this.socket.emit('inbox', { receiverId: this.receiverId });

    this.socket.fromEvent('message-inbox').subscribe((inbox: any) => {
      this.messages = [];
      console.log("Inbox sms: ", inbox.socket)
      this.messages = inbox.messagesFromInbox;
      setTimeout(() => {
        this.content.scrollToBottom(200);
      });
    });

    this.socket.fromEvent('typing-message').subscribe((message: any) => {
      let isTypingActivityExist = false
      let objTypingMessage;

      for (var i = 0; i <= this.messages["length"] - 1; i++) {
        if (this.messages[i].type === 'typing-event') {
          isTypingActivityExist = true;
          objTypingMessage = this.message[i];
          break;
        }
      }

      if (!isTypingActivityExist) {
        if (message.message.replace(/\s/g, '').length !== 0) {
          this.messages.push(message);
        }
      }

      if (isTypingActivityExist) {
        if (message.message === '') {
          this.messages.splice(this.messages.indexOf(objTypingMessage), 1);
        }
      }

      setTimeout(() => {
        this.content.scrollToBottom(200);
      });
    });
  }

  ionViewWillEnter() {

  }

  ionViewDidLeave() {
    this.socket.removeAllListeners('message-inbox');
    this.socket.removeAllListeners('private message');
  }

  async close() {
    this.messages = [];
    await this.modalCtrl.dismiss();
  }

  sendPrivateMessage() {

    let message = this.messageContentAchorTag(this.message);
    this.socket.emit('privateMsg', { receiverId: this.receiverId, receiver: this.receiver, message: message, createdAt: new Date() });
    this.messages.push({ "sender": this.currentUser, "receiverId": "", "receiver": "", "message": message, "createdAt": new Date() });
    this.message = '';
    setTimeout(() => {
      this.content.scrollToBottom(200);
    });
  }

  isDisabledSms = true;

  public messageTextAreaKeyPress(event: any) {
    let checkMessage = this.message;
    if (!checkMessage.replace(/\s/g, '').length) {
      console.log("Key press: ", checkMessage.replace(/\s/g, '').length);
      this.isDisabledSms = true;
    } else {
      this.isDisabledSms = false;
    }

    this.socket.emit('user typing', { sender: this.currentUser, receiverId: this.receiverId, message: this.message })
  }

  messageContentAchorTag(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a style='color:white;' href='$1'  target='_self'>$1</a> ");

  }

  checkText(text) {
    var exp = "((ht|f)tp(s?))(:((\/\/)(?!\/)))(((w){3}\.)?)([a-zA-Z0-9\-_]+(\.(com|edu|gov|int|mil|net|org|biz|info|name|pro|museum|co\.uk)))(\/(?!\/))(([a-zA-Z0-9\-_\/]*)?)([a-zA-Z0-9])+\.((jpg|jpeg|gif|png)(?!(\w|\W)))";
    return text.match(exp);
  }

}
