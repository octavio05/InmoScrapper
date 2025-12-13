import { Component, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-line-chart-coponent',
  imports: [BaseChartDirective],
  templateUrl: './line-chart-coponent.html',
  styleUrl: './line-chart-coponent.css',
})
export class LineChartCoponent {

  public data = signal(
    {
      datasets: [
        {
          data: [10, 50, 30, 70, 45, 90],
          label: 'Ventas 2024',
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          fill: true,
          tension: 0.3
        }
      ],
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    }
  );

  public options = signal(
    {
      responsive: true,
    }
  );

  public legend = signal(true);

}
