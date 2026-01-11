import { Component, computed, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { LineChartData } from '../../interfaces/lineChartData';

@Component({
  selector: 'line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {

  public data = input<LineChartData>();

  public chartConfiguration = computed(() => {

    return this.data;

  });

  public options = signal(
    {
      responsive: true,
    }
  );

  public legend = signal(true);

}
