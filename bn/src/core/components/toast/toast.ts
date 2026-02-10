import { Component, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

enum ToastTypeColorEnum {
  Error = 'border-red-600',
  Info = 'border-cyan-500',
  Success = 'border-emerald-500',
  Note = 'border-neutral-700',
}

type ToastProps = {
  typeColor: ToastTypeColorEnum;
  message: string;
};

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  actualMessage = signal<ToastProps | undefined>(undefined);
  private readonly messages$ = new BehaviorSubject<ToastProps[]>([]);
  messages = this.messages$.asObservable();
  showTime = 3000;

  constructor() {
    this.messages$.subscribe((b) => {
      this.show(b);
    });
  }

  error(message: string) {
    this.addMessage(ToastTypeColorEnum.Error, message);
  }

  success(message: string) {
    this.addMessage(ToastTypeColorEnum.Success, message);
  }

  info(message: string) {
    this.addMessage(ToastTypeColorEnum.Info, message);
  }

  note(message: string) {
    this.addMessage(ToastTypeColorEnum.Note, message);
  }

  private show(mssgs: ToastProps[]) {
    this.actualMessage.set(mssgs[0]);

    for (let m of mssgs) {
      setTimeout(() => {
        this.actualMessage.set(m);
      }, this.showTime);
    }

    setTimeout(() => {
      this.actualMessage.set(undefined);
    }, this.showTime);
  }

  private addMessage(typeColor: ToastTypeColorEnum, message: string) {
    this.messages$.next([...this.messages$.value, { typeColor, message }]);
  }
}

@Component({
  templateUrl: './toast.html',
  selector: 'app-toast',
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
