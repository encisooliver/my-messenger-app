import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatAppService {

  constructor(private socket: Socket,) { 

    
  }

  sendMessage(data)
    {
        this.socket.emit('message',data);
    }

    newMessageReceived(){
        let observable = new Observable<{user:String, message:String}>(observer=>{
            this.socket.on('private message', (data)=>{
                observer.next(data);
            });
        });
        return observable;
    }

}
