export function pageview(url: string) {
  window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, { page_path: url });
}
