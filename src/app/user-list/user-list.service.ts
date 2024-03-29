import { Injectable } from "@angular/core";
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable()


export class ChatService{

    private socket = io('http://localhost:3001');

    joinRoom(data)
    {
        this.socket.emit('join',data);
    } 

    newUserJoined()
    {
        let observable = new Observable<{user:String, message:String}>(observer=>{
            this.socket.on('new user joined', (data)=>{
                observer.next(data);
            });
            return () => {this.socket.disconnect();}
        });

        return observable;
    }

    leaveRoom(data){
        this.socket.emit('leave',data);
    }

    // addUserToRoom(data){
    //     this.socket.emit('set-name', data);
    // }

    // addedUser()
    // {
    //     let observable = new Observable<{user:String, message:String}>(observer=>{
    //         this.socket.on('new user joined', (data)=>{
    //             observer.next(data);
    //         });
    //         return () => {this.socket.disconnect();}
    //     });

    //     return observable;
    // }

    userLeftRoom(){
        let observable = new Observable<{user:String, message:String}>(observer=>{
            this.socket.on('left room', (data)=>{
                observer.next(data);
            });
            return () => {this.socket.disconnect();}
        });

        return observable;
    }

    sendMessage(data)
    {
        this.socket.emit('message',data);
    }

    newMessageReceived(){
        let observable = new Observable<{user:String, message:String}>(observer=>{
            this.socket.on('new message', (data)=>{
                observer.next(data);
            });
            return () => {this.socket.disconnect();}
        });

        return observable;
    }
}