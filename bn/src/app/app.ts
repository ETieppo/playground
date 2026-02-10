import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../core/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, MatIconModule],
  templateUrl: './app-layout.html',
  styleUrl: '../globals.css',
})
export class App {}
