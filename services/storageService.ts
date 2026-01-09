
/**
 * Global Shared Storage Service
 * Uses a public REST KV store to synchronize reports and metadata across all users.
 */

const BUCKET_ID = 'research_radar_v1_global_storage_6a2f9b';
const BASE_URL = `https://kvdb.io/${BUCKET_ID}`;

export const GlobalStorage = {
  /**
   * Fetches a report from the shared global storage.
   */
  async getReport(dateKey: string): Promise<any | null> {
    try {
      const response = await fetch(`${BASE_URL}/report_${dateKey}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn("Global storage fetch failed:", e);
      return null;
    }
  },

  /**
   * Saves a report to the shared global storage.
   */
  async saveReport(dateKey: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/report_${dateKey}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      await this.addToGlobalIndex(dateKey);
      return response.ok;
    } catch (e) {
      console.error("Global storage save failed:", e);
      return false;
    }
  },

  /**
   * Manages a global index of dates that have reports.
   */
  async getGlobalIndex(): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/report_index`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  async addToGlobalIndex(dateKey: string): Promise<void> {
    const currentIndex = await this.getGlobalIndex();
    if (!currentIndex.includes(dateKey)) {
      const updated = [...currentIndex, dateKey].sort((a, b) => b.localeCompare(a));
      await fetch(`${BASE_URL}/report_index`, {
        method: 'POST',
        body: JSON.stringify(updated),
      });
    }
  },

  /**
   * Fetches the cumulative Gemini API call count.
   */
  async getCallCount(): Promise<number> {
    try {
      const response = await fetch(`${BASE_URL}/api_call_count`);
      if (!response.ok) return 0;
      const text = await response.text();
      return parseInt(text, 10) || 0;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Increments the cumulative Gemini API call count.
   */
  async incrementCallCount(): Promise<number> {
    try {
      const current = await this.getCallCount();
      const next = current + 1;
      await fetch(`${BASE_URL}/api_call_count`, {
        method: 'POST',
        body: next.toString(),
      });
      return next;
    } catch (e) {
      return 0;
    }
  }
};
