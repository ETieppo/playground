import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export const SOCKET_URI = 'ws://localhost:5147/ws';
export const DEFAULT_EMPTY = '--';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
