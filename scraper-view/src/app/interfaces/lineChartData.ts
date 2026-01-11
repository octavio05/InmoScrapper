export interface LineChartData {

    labels: string[];
    datasets: Dataset[];
}

export interface Dataset {

    data: number[];
    label: string;
    fill: boolean;
    tension: number;
    spanGaps: boolean;
    hidden: boolean;

}