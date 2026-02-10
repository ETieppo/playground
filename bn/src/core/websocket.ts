import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Subject, take } from 'rxjs';
import { SOCKET_URI } from '../main';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private socket?: WebSocket;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  public connected = new BehaviorSubject<boolean>(false);
  readonly connected$ = this.connected.asObservable();

  constructor() {
    if (this.connected.value === false) this.connect();
  }

  private connect() {
    try {
      this.socket = new WebSocket(`${SOCKET_URI}`);
      this.socket.onopen = () => {
        this.connected.next(true);
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        this.messagesSubject.next(data);
      };

      this.socket.onclose = () => {
        console.log('Desconectado');
      };
      this.socket.onerror = (err) => {
        console.error('Error connecting to server socket: ', err);
      };
    } catch (err) {
      console.error('Error connecting to server socket: ', err);
    }
  }

  private send(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
      throw Error('Conexão ñ estabelecida!');
    this.socket?.send(JSON.stringify(message));
  }

  public sendMessage(message: string) {
    this.connected$.pipe(filter(Boolean), take(1)).subscribe(() => this.sendMessage(message));
  }

  disconnect() {
    this.socket?.close();
  }
}
