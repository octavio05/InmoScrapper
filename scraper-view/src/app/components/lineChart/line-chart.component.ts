import { Component, computed, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Ad } from '../../interfaces/ad';

@Component({
  selector: 'line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {

  public data = input<Ad[]>([]);

  public chartConfiguration = computed(() => {

    let labels: string[] = [];
    let datasets: any[] = [];

    this.data().forEach(ad => {

      labels = [...new Set([...labels, ...ad.Price.map(price => (price.date || 'Unknown').toString())])];
      datasets.push({
        data: ad.Price.map(price => price.value || 0),
        label: ad.Direction || 'Unknown',
        fill: true,
        tension: 0.3,
      });

    });

    return {
      labels,
      datasets,
    };

  });

  public options = signal(
    {
      responsive: true,
    }
  );

  public legend = signal(true);

}
