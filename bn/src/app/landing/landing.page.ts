import { Component, inject, OnInit, signal } from '@angular/core';
import { DEFAULT_EMPTY } from '../../main';
import { WsService } from '../../core/websocket';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../core/components/toast/toast';

@Component({
  selector: 'app-landing',
  imports: [MatIconModule],
  templateUrl: './landing.page.html',
})
export class LandingPage implements OnInit {
  private readonly ws = inject(WsService);
  protected readonly title = signal('Batalha Naval');
  protected readonly loading = signal(true);
  protected readonly DEFAULT_EMPTY = DEFAULT_EMPTY;
  players = signal<PlayeProps[]>([new PlayeProps('nome', 0)]);
  showAllPlayers = signal(false);
  playedGames = signal(0);

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  private loadHomeData() {
    this.ws.sendMessage('ola');
  }
}

class PlayeProps {
  username: string;
  wins: number;

  constructor(username: string, wins: number) {
    this.username = username;
    this.wins = wins;
  }
}
