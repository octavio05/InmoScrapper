import { Component, inject, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { AdService } from '../../services/ad.service';

@Component({
  selector: 'line-chart-component',
  imports: [BaseChartDirective],
  templateUrl: './line-chart-component.html',
  styleUrl: './line-chart-component.css',
})
export class LineChartComponent {

  public adServices = inject(AdService);

  public data = signal(
    {
      datasets: [
        {
          data: this.adServices.data(),
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
