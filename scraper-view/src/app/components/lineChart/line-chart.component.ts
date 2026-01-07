import { Component, computed, input, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Ad } from '../../models/ad.model';

@Component({
  selector: 'line-chart',
  imports: [BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {

  public data = input<Ad[]>([]);

  public chartConfiguration = computed(() => {

    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const dateMap = new Map<string, Date>();
    this.data().flatMap(ad =>
      ad.Price.map(price => price.date)
    ).forEach(date => {
      const dateStr = date.toLocaleDateString('es-ES', dateFormatOptions);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, date);
      }
    });

    const labels: string[] = Array.from(dateMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(entry => entry[0]);

    const datasets = Array.from(
      this.data().map(ad => {
        // Crear un mapa de fechas a valores para este anuncio
        const priceMap = new Map<string, number>();
        ad.Price.forEach(price => {
          const dateStr = price.date.toLocaleDateString('es-ES', dateFormatOptions);
          priceMap.set(dateStr, price.value || 0);
        });

        // Crear el array de datos alineado con labels
        const data = labels.map(label => priceMap.get(label) || 0);

        return {
          data,
          label: ad.Direction || 'Unknown',
          fill: true,
          tension: 0.3,
          spanGaps: true // Permite conectar puntos aunque falten datos intermedios
        }
      })
    );

    return {
      labels,
      datasets
    }

  });

  public options = signal(
    {
      responsive: true,
    }
  );

  public legend = signal(true);

}
