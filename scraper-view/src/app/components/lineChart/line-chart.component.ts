import { Component, computed, inject, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { LineChartData } from '../../interfaces/lineChartData';
import { ChartConfigurationService } from '../../services/chart-configuration.service';

@Component({
  selector: 'line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {

  private chartConfigurationService = inject(ChartConfigurationService);

  public data = input<LineChartData>();

  public chartConfiguration = computed(() => {

    return this.data;

  });

  public options = signal(
    {
      responsive: true,
      plugins: {
        legend: {
          onClick: (e: any, legendItem: any, legend: any) => this.toggleDataSetVisible(legendItem, legend)
        }
      }
    }
  );

  public legend = signal(true);

  private toggleDataSetVisible(legendItem: any, legend: any) {

    const datasetIndex = legendItem.datasetIndex;
    const ci = legend.chart;

    const dataset = ci.data.datasets[datasetIndex];
    const uniqueId = dataset.id;

    if (ci.isDatasetVisible(datasetIndex)) {

      ci.hide(datasetIndex);
      legendItem.hidden = true;

    } else {

      ci.show(datasetIndex);
      legendItem.hidden = false;

    }

    this.chartConfigurationService.updateVisibility(uniqueId, legendItem.hidden);

  }

}
