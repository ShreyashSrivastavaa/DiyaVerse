/**
 * First-party Analytics Client for DiyaVerse.
 * Privacy-first: no IP storage, no fingerprinting.
 * Batches events, flushes on interval or visibilitychange, silent fail.
 */

const SESSION_KEY = "diyaverse_session_id";
const SESSION_TIMESTAMP_KEY = "diyaverse_session_last_active";
const VISITOR_KEY = "diyaverse_visitor_id";
const CONSENT_KEY = "diyaverse_consent_analytics";

export type EventName =
  | "page_viewed"
  | "cta_light_clicked"
  | "creator_opened"
  | "style_selected"
  | "wish_edited"
  | "surprise_me_clicked"
  | "diya_submit_attempted"
  | "diya_created"
  | "diya_creation_failed"
  | "wall_opened"
  | "wall_filter_changed"
  | "diya_opened"
  | "share_menu_opened"
  | "share_whatsapp_initiated"
  | "share_native_completed"
  | "link_copied"
  | "card_downloaded"
  | "language_changed"
  | "report_submitted"
  | "visitor_returned";

export interface EventPayload {
  name: EventName;
  ts: number;
  sessionId: string;
  visitorId?: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  locale?: string;
  props?: Record<string, unknown>;
}

class AnalyticsManager {
  private queue: EventPayload[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isBrowser = typeof window !== "undefined";

  constructor() {
    if (this.isBrowser) {
      this.initSession();
      this.setupListeners();
      this.startFlushTimer();
    }
  }

  private initSession(): string {
    const now = Date.now();
    const lastActive = parseInt(sessionStorage.getItem(SESSION_TIMESTAMP_KEY) || "0", 10);
    const thirtyMinutes = 30 * 60 * 1000;

    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId || now - lastActive > thirtyMinutes) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
    return sessionId;
  }

  public getSessionId(): string {
    if (!this.isBrowser) return "";
    return this.initSession();
  }

  public getVisitorId(): string | undefined {
    if (!this.isBrowser) return undefined;
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "true") {
      let visitorId = localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
      }
      return visitorId;
    }
    return undefined;
  }

  private setupListeners(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush(true);
      }
    });

    window.addEventListener("beforeunload", () => {
      this.flush(true);
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush(false);
      }
    }, 5000);
  }

  public track(name: EventName, props?: Record<string, unknown>, locale?: string): void {
    if (!this.isBrowser) return;

    try {
      const sessionId = this.getSessionId();
      const visitorId = this.getVisitorId();
      const path = window.location.pathname;

      let referrerHost: string | undefined = undefined;
      if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          if (refUrl.hostname !== window.location.hostname) {
            referrerHost = refUrl.hostname;
          }
        } catch {
          // invalid referrer URL, ignore
        }
      }

      const params = new URLSearchParams(window.location.search);

      const event: EventPayload = {
        name,
        ts: Date.now(),
        sessionId,
        visitorId,
        path,
        referrer: referrerHost,
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
        locale: locale || document.documentElement.lang || "en",
        props: props || {},
      };

      this.queue.push(event);

      if (this.queue.length >= 30) {
        this.flush(false);
      }
    } catch (e) {
      // Analytics must never throw or disrupt UX
      console.warn("Analytics track error:", e);
    }
  }

  public flush(useBeacon = false): void {
    if (!this.isBrowser || this.queue.length === 0) return;

    const batch = this.queue.splice(0, 30);
    const body = JSON.stringify({ events: batch });

    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently drop errors
      });
    }
  }
}

let analyticsInstance: AnalyticsManager | null = null;

export function getAnalytics(): AnalyticsManager {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager();
  }
  return analyticsInstance;
}

export function trackEvent(
  name: EventName,
  props?: Record<string, unknown>,
  locale?: string
): void {
  getAnalytics().track(name, props, locale);
}
