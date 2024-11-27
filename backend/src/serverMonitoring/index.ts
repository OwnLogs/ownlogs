import { performance, PerformanceEntry } from 'perf_hooks';
import ServerMonitoringDAO from '../db/ServerMonitoringDAO';

export async function monitorServers() {
  const servers = await ServerMonitoringDAO.getAllMonitoredServers();

  for (const server of servers) {
    if (!server.publicUrl || !server.id) return;
    const serverStatusData = await checkServerStatus(server.publicUrl);
    // Insert data into the database
    await ServerMonitoringDAO.createServerMonitoring(server.id, serverStatusData);
  }
}

const checkServerStatus = async (url: string) => {
  const request = new UptimeRequest({
    url: url
  });
  await request.fire();
  return request.toDocument();
};

class UptimeRequest {
  method: string;
  url: string;
  timeout: number;
  response: Response | null;
  timestamp: Date = new Date();
  performance: PerformanceEntry | null;
  error: string | null;
  hasTimedOut: boolean | null;

  constructor({ url, method, timeout }: { url: string; method?: string; timeout?: number }) {
    // config
    this.method = method || 'HEAD';
    this.url = url;
    this.timeout = timeout || 1000;

    // results / measurements
    this.response = null;
    this.performance = null;
    this.error = null;
    this.hasTimedOut = null;
  }

  async fire() {
    this.timestamp = new Date();

    // Prepare performance measures
    const start = `start`;
    const ended = `ended`;
    const controller = new AbortController();

    // Set timeout for the request
    const timeout = setTimeout(() => {
      this.hasTimedOut = true;
      controller.abort();
    }, this.timeout);

    try {
      performance.mark(start);
      this.response = await fetch(this.url, {
        method: this.method,
        priority: 'high',
        redirect: 'error',
        signal: controller.signal
      });
    } catch (error: any) {
      this.error = error.message;
    } finally {
      performance.mark(ended);
      clearTimeout(timeout);

      // Measure performance between start and ended marks
      try {
        performance.measure(this.url, start, ended);
        // Retrieve the performance entry
        const entries = performance.getEntriesByName(this.url);
        if (entries.length > 0) {
          this.performance = entries[0] as PerformanceEntry;
        }
      } catch (error: any) {
        this.error = error.message;
      }

      // Clean up marks and measures to avoid memory leaks
      performance.clearMarks(start);
      performance.clearMarks(ended);
      performance.clearMeasures(this.url);
    }
  }

  toDocument() {
    return {
      timestamp: this.timestamp,
      duration: this.performance?.duration ?? 0,
      hasTimedOut: !!this.hasTimedOut,
      error: this.error
    };
  }
}
