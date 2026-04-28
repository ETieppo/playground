import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodePreviewComponent } from './preview/preview.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CodePreviewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('color_gen');
}
