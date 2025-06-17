// Global API call throttling utility
class APIThrottle {
  private static instance: APIThrottle;
  private callLog = new Map<string, number>();
  private readonly THROTTLE_DURATION = 15000; // 15 seconds between same API calls

  static getInstance(): APIThrottle {
    if (!APIThrottle.instance) {
      APIThrottle.instance = new APIThrottle();
    }
    return APIThrottle.instance;
  }

  shouldThrottle(endpoint: string): boolean {
    const now = Date.now();
    const lastCall = this.callLog.get(endpoint);
    
    if (lastCall && (now - lastCall) < this.THROTTLE_DURATION) {
      console.log(`🚫 API throttled: ${endpoint} (last call ${(now - lastCall)/1000}s ago)`);
      return true;
    }
    
    this.callLog.set(endpoint, now);
    return false;
  }

  clearThrottle(endpoint?: string): void {
    if (endpoint) {
      this.callLog.delete(endpoint);
    } else {
      this.callLog.clear();
    }
  }
}

export default APIThrottle; 