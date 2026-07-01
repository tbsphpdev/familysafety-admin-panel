import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { DashboardActions } from 'src/app/store/Dashboard/dashboard.actions';
import { selectDashboard, selectDashboardLoading } from 'src/app/store/Dashboard/dashboard.selector';
import { Dashboard, RecentTransaction, RecentUser } from 'src/app/store/Dashboard/dashboard.model';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  providers: [DecimalPipe],
  standalone: false
})
export class IndexComponent {

  marketverviewChart: any;
  planPieChart: any;
  renewalsPlanChart: any;
  revenueByYearChart: any;
  usersByCountryChart: any;
  revenueByCountryChart: any;
  downloadsByMonthChart: any;
  downloadsByCountryChart: any;
  usersByDeviceChart: any;
  recentTransactions: RecentTransaction[] = [];
  recentUsers: RecentUser[] = [];
  dashboardData?: Dashboard | null;
  isLoading = true;
  totalMonthlyRevenue = 0;
  totalRevenueByYear = 0;
  totalUsersByCountry = 0;
  totalDownloadsByMonth = 0;
  totalDownloadsByCountry = 0;
  usersByCountryAxisTicks: Array<{ value: number; position: number }> = [];
  downloadsByCountryAxisTicks: Array<{ value: number; position: number }> = [];

  private readonly pieDefaults = {
    chart: { type: 'pie', height: 260 },
    legend: {
      position: 'bottom',
      formatter: (seriesName: string, opts: any) => {
        const percent = opts.w.globals.seriesPercent?.[opts.seriesIndex]?.[0];
        return percent != null ? `${seriesName} - ${Number(percent).toFixed(1)}%` : seriesName;
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val >= 5 ? val.toFixed(1) + '%' : '',
      style: { fontSize: '12px', fontWeight: '600' },
      dropShadow: { enabled: false }
    },
    plotOptions: { pie: { dataLabels: { offset: -25, minAngleToShowLabel: 10 } } },
    states: {
      hover: { filter: { type: 'none' } },
      active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } }
    }
  };

  constructor(public store: Store) { }

  ngOnInit(): void {
    this._marketverviewChart('["--tb-primary", "--tb-secondary"]');

    this.planPieChart = { ...this.pieDefaults, series: [], labels: [], colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink"]') };
    this.renewalsPlanChart = { ...this.pieDefaults, series: [], labels: [], colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink"]') };

    this.revenueByYearChart = {
      series: [{ name: 'Revenue (USD)', data: [] }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, dataLabels: { position: 'top' } } },
      states: { normal: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      dataLabels: { enabled: true, formatter: (v: any) => '$' + Number(v).toFixed(0), offsetY: -20, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: { categories: [] },
      yaxis: { labels: { formatter: (v: any) => '$' + Number(v).toFixed(0) } },
      grid: { padding: { top: -10, bottom: -10 } },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    this.usersByCountryChart = {
      series: [{ name: 'Users', data: [] }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } } },
      states: { normal: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      dataLabels: { enabled: true, offsetX: 15, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: { categories: [] },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    this.revenueByCountryChart = {
      ...this.pieDefaults,
      series: [],
      labels: [],
      colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink","--tb-warning","--tb-danger","--tb-secondary","--tb-dark"]')
    };

    this.usersByDeviceChart = {
      ...this.pieDefaults,
      series: [],
      labels: [],
      colors: this.getChartColorsArray('["--tb-pink","--tb-primary"]')
    };

    this.downloadsByMonthChart = {
      series: [{ name: 'Install', data: Array(12).fill(0) }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, dataLabels: { position: 'top' } } }, states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } }, dataLabels: { enabled: true, formatter: (v: any) => v > 0 ? v : '', offsetY: -20, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
      yaxis: { labels: { formatter: (v: any) => Math.round(v) } },
      grid: { padding: { top: 20, bottom: -10 } },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    this.downloadsByCountryChart = {
      series: [{ name: 'Install', data: [] }],
      chart: { type: 'bar', height: 350, width: '100%', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } } },
      states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      dataLabels: { enabled: true, offsetX: 15, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: { categories: [] },
      grid: { padding: { top: -10, bottom: -10 } },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    this.store.dispatch(DashboardActions.loadDashboard());
    this.store.select(selectDashboardLoading).subscribe((loading) => {
      this.isLoading = loading;
    });
    this.store.select(selectDashboard).subscribe((dashboard) => {
      this.dashboardData = dashboard;
      this.recentTransactions = dashboard?.recent_transactions ? [...dashboard.recent_transactions] : [];
      this.recentUsers = dashboard?.recent_users ? [...dashboard.recent_users] : [];
      this._updateDashboardCharts(dashboard);
    });
  }

  private computeAxisScale(maxVal: number): { axisMax: number; tickAmount: number } {
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    let step = 1;
    for (const s of steps) {
      if (Math.ceil(maxVal / s) <= 6) { step = s; break; }
    }
    const ticks = Math.ceil(maxVal / step) + 1;
    return { axisMax: ticks * step, tickAmount: ticks };
  }

  private computeAxisTicks(maxVal: number): { axisMax: number; tickAmount: number; ticks: Array<{ value: number; position: number }> } {
    const value = Math.max(Number(maxVal) || 1, 1);
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    let step = 1;
    for (const s of steps) {
      if (Math.ceil(value / s) <= 6) { step = s; break; }
    }
    const labelRoom = value >= 10 ? step : 1;
    const axisMax = Math.ceil((value + labelRoom) / step) * step;
    const intervals = Math.max(axisMax / step, 1);
    const ticks = Array.from({ length: intervals + 1 }, (_, index) => {
      const tickValue = Math.round(index * step);
      return {
        value: tickValue,
        position: axisMax > 0 ? (tickValue / axisMax) * 100 : 0,
      };
    });
    return { axisMax, tickAmount: intervals, ticks };
  }

  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(" ", "");
          return color;
        }
        else return newValue;;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  private _updateDashboardCharts(dashboard: Dashboard | null) {
    if (!dashboard) {
      return;
    }

    this.totalMonthlyRevenue = (dashboard.monthly_revenue?.months ?? []).reduce((sum, m) => sum + (Number(m.revenue) || 0), 0);
    this.totalRevenueByYear = (dashboard.revenue_by_year ?? []).reduce((sum, r) => sum + (r.revenue_usd || 0), 0);
    this.totalUsersByCountry = (dashboard.users_by_country ?? []).reduce((sum, c) => sum + (c.count || 0), 0);
    this.totalDownloadsByMonth = (dashboard.downloads_by_month?.months ?? []).reduce((sum, m) => sum + (m.downloads || 0), 0);
    this.totalDownloadsByCountry = (dashboard.downloads_by_country ?? []).reduce((sum, c) => sum + (c.downloads || 0), 0);

    const monthlyRevenue = [...(dashboard.monthly_revenue?.months ?? [])]
      .sort((a, b) => a.month_number - b.month_number);
    const monthLabels = monthlyRevenue.map((item) => item.month.slice(0, 3));
    const monthRevenue = monthlyRevenue.map((item) => Number(item.revenue) || 0);
    const weekLabels = dashboard.revenue.by_week?.map((item) => item.week) ?? [];
    const weekRevenue = dashboard.revenue.by_week?.map((item) => item.revenue) ?? [];

    if (monthLabels.length > 0) {
      this.marketverviewChart = {
        ...this.marketverviewChart,
        series: [{ name: `${dashboard.monthly_revenue?.year || ''} Revenue`, data: monthRevenue }],
        xaxis: { ...this.marketverviewChart.xaxis, categories: monthLabels },
      };
    } else if (weekLabels.length > 0) {
      this.marketverviewChart = {
        ...this.marketverviewChart,
        series: [{ name: 'Revenue', data: weekRevenue }],
        xaxis: { ...this.marketverviewChart.xaxis, categories: weekLabels },
      };
    }

    // Plan pie chart
    const planLabels = dashboard.revenue.by_plan?.map(p => p.plan_name) ?? [];
    const planSeries = dashboard.revenue.by_plan?.map(p => p.revenue) ?? [];
    this.planPieChart = {
      ...this.pieDefaults,
      series: planSeries,
      labels: planLabels,
      colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink"]')
    };

    // Renewals plan chart
    const renewalLabels = dashboard.renewals?.by_plan?.map(p => p.plan_name) ?? [];
    const renewalSeries = dashboard.renewals?.by_plan?.map(p => p.count) ?? [];
    this.renewalsPlanChart = {
      ...this.pieDefaults,
      series: renewalSeries,
      labels: renewalLabels,
      colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink"]')
    };

    // Revenue by year chart
    const yearLabels = (dashboard.revenue_by_year ?? []).map(r => String(r.year));
    const yearRevenue = (dashboard.revenue_by_year ?? []).map(r => r.revenue_usd);
    this.revenueByYearChart = {
      series: [{ name: 'Revenue (USD)', data: yearRevenue }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, dataLabels: { position: 'top' } } },
      states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      dataLabels: { enabled: true, formatter: (v: any) => '$' + Number(v).toFixed(0), offsetY: -20, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: { categories: yearLabels },
      yaxis: { labels: { formatter: (v: any) => '$' + Number(v).toFixed(0) } },
      grid: { padding: { top: 20, bottom: -10 } },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    // Users by country chart
    const countryUserLabels = (dashboard.users_by_country ?? []).map(c => c.country_name);
    const countryUserCounts = (dashboard.users_by_country ?? []).map(c => c.count);
    const usersCount = countryUserLabels.length;
    const usersCountryHeight = usersCount * 45 + 40;
    const usersMaxVal = Math.max(...countryUserCounts, 0);
    const { axisMax: usersAxisMax, tickAmount: usersTickAmount, ticks: usersAxisTicks } = this.computeAxisTicks(usersMaxVal);
    this.usersByCountryAxisTicks = usersAxisTicks;
    this.usersByCountryChart = {
      series: [{ name: 'Users', data: countryUserCounts }],
      chart: { type: 'bar', height: usersCountryHeight, width: '100%', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } } },
      states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      dataLabels: { enabled: true, offsetX: 15, style: { fontSize: '11px', colors: ['#304758'] } },
      xaxis: {
        categories: countryUserLabels,
        min: 0,
        max: usersAxisMax,
        tickAmount: usersTickAmount,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: { padding: { bottom: -8, right: 28 } },
      colors: this.getChartColorsArray('["--tb-primary"]')
    };

    // Revenue by country chart
    const countryRevLabels = (dashboard.revenue_by_country ?? []).map(c => c.country_name);
    const countryRevData = (dashboard.revenue_by_country ?? []).map(c => c.revenue_usd);
    this.revenueByCountryChart = {
      ...this.pieDefaults,
      series: countryRevData,
      labels: countryRevLabels,
      colors: this.getChartColorsArray('["--tb-primary","--tb-info","--tb-pink","--tb-warning","--tb-danger","--tb-secondary","--tb-dark"]')
    };

    // Users by device chart
    const deviceLabels = (dashboard.users_by_device ?? []).map(d => d.device_name);
    const deviceData = (dashboard.users_by_device ?? []).map(d => d.count);
    this.usersByDeviceChart = {
      ...this.pieDefaults,
      series: deviceData,
      labels: deviceLabels,
      colors: this.getChartColorsArray('["--tb-pink","--tb-primary"]')
    };

    // Downloads by month chart
    const dlMonths = [...(dashboard.downloads_by_month?.months ?? [])]
      .sort((a, b) => a.month_number - b.month_number);
    const dlLabels = dlMonths.map(m => m.month.slice(0, 3));
    const dlData = dlMonths.map(m => m.downloads);
    if (dlLabels.length > 0) {
      this.downloadsByMonthChart = {
        series: [{ name: 'Total Install', data: dlData }],
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, dataLabels: { position: 'top' } } },
        states: { normal: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
        dataLabels: { enabled: true, formatter: (v: any) => v > 0 ? v : '', offsetY: -20, style: { fontSize: '11px', colors: ['#304758'] } },
        xaxis: { categories: dlLabels },
        yaxis: { labels: { formatter: (v: any) => Math.round(v) } },
        grid: { padding: { top: -10, bottom: -10 } },
        colors: this.getChartColorsArray('["--tb-primary"]')
      };
    }

    // Downloads by country chart
    const dlCountryLabels = (dashboard.downloads_by_country ?? []).map(c => c.country);
    const dlCountryData = (dashboard.downloads_by_country ?? []).map(c => c.downloads);
    if (dlCountryLabels.length > 0) {
      const dlCount = dlCountryLabels.length;
      const dlCountryHeight = Math.max(dlCount * 45 + 40, 350);
      const dlCountryRadius = Math.min(6, Math.max(2, Math.floor(200 / dlCountryLabels.length)));
      const dlMaxVal = Math.max(...dlCountryData, 0);
      const { axisMax: dlAxisMax, tickAmount: dlTickAmount, ticks: dlAxisTicks } = this.computeAxisTicks(dlMaxVal || 1);
      this.downloadsByCountryAxisTicks = dlAxisTicks;
      this.downloadsByCountryChart = {
        series: [{ name: 'Total Install', data: dlCountryData }],
        chart: { type: 'bar', height: dlCountryHeight, width: '100%', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: dlCountryRadius, dataLabels: { position: 'top' } } },
        states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
        dataLabels: { enabled: true, offsetX: 15, style: { fontSize: '11px', colors: ['#304758'] } },
        xaxis: {
          categories: dlCountryLabels,
          min: 0,
          max: dlAxisMax,
          tickAmount: dlTickAmount,
          labels: { show: false },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        grid: { padding: { top: -10, bottom: -8, right: 28 } },
        colors: this.getChartColorsArray('["--tb-primary"]')
      };
    } else {
      this.downloadsByCountryAxisTicks = [];
    }
  }

  private _marketverviewChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.marketverviewChart = {
      series: [{ name: 'Revenue', data: Array(12).fill(0) }],
      chart: { type: 'bar', height: 328, stacked: false, toolbar: { show: false } },
      stroke: { width: 5, colors: "#000", lineCap: 'round' },
      grid: {
        show: true,
        borderColor: '#000',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: false } },
      },
      plotOptions: {
        bar: {
          columnWidth: '30%',
          borderRadius: 5,
          lineCap: 'round',
          borderRadiusOnAllStackedSeries: true,
          dataLabels: { position: 'top' }
        },
      },
      states: { hover: { filter: { type: 'none' } }, active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } } },
      colors: colors,
      fill: { opacity: 1 },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { fontSize: '11px', colors: ['#304758'] },
        formatter: (v: any) => v > 0 ? '$' + Number(v).toFixed(0) : '',
      },
      yaxis: {
        labels: {
          show: true,
          formatter: function (y: any) { return "$" + Number(y || 0).toFixed(0); }
        },
      },
      tooltip: { enabled: false },
      legend: { show: false, position: 'top', horizontalAlign: 'right' },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: { rotate: -90 },
        axisTicks: { show: true },
        axisBorder: { show: true, stroke: { width: 1 } },
      }
    };

    const observer = new MutationObserver(() => {
      this._marketverviewChart('["--tb-primary", "--tb-secondary"]');
      this._updateDashboardCharts(this.dashboardData || null);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  openUserInNewTab(id: any): void {
    if (id) { window.open('/users/' + id, '_blank'); }
  }

  getInitials(name?: string): string {
    if (!name) { return ''; }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) { return parts[0].substring(0, 2).toUpperCase(); }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
