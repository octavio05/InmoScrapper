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
      plugins: {
        legend: {
          onClick: (e: any, legendItem: any, legend: any) => {

            const index = legendItem.datasetIndex;
            const ci = legend.chart;

            const dataset = ci.data.datasets[index];
            const uniqueId = dataset.id;

            if (ci.isDatasetVisible(index)) {

              ci.hide(index);
              legendItem.hidden = true;

            } else {

              ci.show(index);
              legendItem.hidden = false;

            }

            console.log(`Legend clicked (${uniqueId}): ${legendItem}`);

          }
        }
      }
    }
  );

  public legend = signal(true);

}
