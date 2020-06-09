import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  message = '';
  messages = [];
  currentUser = '';

  constructor(private socket: Socket, private toastCtrl: ToastController) { }

  ngOnInit() {
    // this.socket.connect();

    let name = `User-${new Date().getTime()}`;
    // let name = `sample`;

    this.currentUser = name;

    this.socket.emit('set-name', name);

    this.socket.fromEvent('users-changed').subscribe(data => {
      console.log('get data: ', data);
      let user = data['user'];
      console.log('get user: ', user);
      if (data['event'] == 'left') {
        this.showToast(`User left: ${user}`);
      } else {
        this.showToast(`User joined: ${user}`);
      }
    });

    this.socket.fromEvent('message').subscribe(message => {
      console.log('New message: ', message);
      this.messages.push(message);
    });

    // From chat-room codes
    // this.socket.emit('inbox', { receiverId: this.receiverId });

    // this.socket.fromEvent('message-inbox').subscribe((inbox: any) => {
    //   this.messages = [];
    //   console.log("Inbox sms: ", inbox.socket)
    //   this.messages = inbox.messagesFromInbox;
    //   setTimeout(() => {
    //     this.content.scrollToBottom(200);
    //   });
    // });

    // this.socket.fromEvent('private message').subscribe((message: any) => {
    //   console.log('New message: ', message);
    //   // add condition // check if message already exist
    //   this.messages.push(message);
    //   setTimeout(() => {
    //     this.content.scrollToBottom(200);
    //   });
    //   console.log('New message: ', message);
    // });

  }

  sendMessage(){
    this.socket.emit('send-message', {text: this.message});
    this.message = '';
  }

  ionViewWillLeave(){
    this.socket.disconnect();
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
  

}
