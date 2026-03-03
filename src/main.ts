import { bootstrapApplication } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

Chart.register(...registerables);

Chart.defaults.font.family = 'Inter';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6B7280';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.elements.bar.borderRadius = 6;
Chart.defaults.scale.grid.color = '#F3F4F6';
(Chart.defaults.scale as any).border = { display: false };

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
