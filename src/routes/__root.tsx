import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AgeGate, AGE_GATE_SCRIPT } from "@/components/site/AgeGate";
import { Header, Footer } from "@/components/site/Chrome";
import { supabase } from "@/integrations/supabase/client";
import { isModuleLoadError, recoverModuleLoad } from '@/lib/module-recovery';
import { PrefsProvider, useI18n } from "@/lib/i18n";

const SITE_URL = "https://mistresssofia.site";
const SITE_DESCRIPTION =
  "Mistress Sofia, a mature, sensual and sadistic professional Dominatrix. Private sessions and selective long-term service. 18+ only.";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">{t("Error 404")}</p>
      <h1 className="mt-4 text-5xl sm:text-6xl">{t("Page not found")}</h1>
      <div className="gold-rule my-8 w-full max-w-xs" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("The page you are looking for does not exist or has been moved.")}
      </p>
      <Link to="/" className="btn-crimson mt-10">
        {t("Go home")}
      </Link>
    </section>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if (isModuleLoadError(error)) {
      try { recoverModuleLoad(error, window.sessionStorage, () => window.location.reload()); } catch { /* Manual retry remains available. */ }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 text-4xl">This page didn't load</h1>
        <div className="gold-rule my-6" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Please try again, or head back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isModuleLoadError(error)) {
                window.location.reload();
                return;
              }
              void router.invalidate();
              reset();
            }}
            className="btn-crimson"
          >
            Try again
          </button>
          <a href="/" className="btn-gold">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Every route must make an explicit sitemap decision. The root itself is never listed.
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mistress Sofia — Professional Dominatrix" },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Mistress Sofia" },
      { name: "theme-color", content: "#09090b" },
      { name: "color-scheme", content: "dark" },
      // Adult-content label so parental-control and filtering software can recognise the site.
      { name: "rating", content: "RTA-5042-1996-1400-1577-RTA" },
      { property: "og:site_name", content: "Mistress Sofia" },
      { property: "og:title", content: "Mistress Sofia — Professional Dominatrix" },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      // Link-preview image: must be a full address, 1200x630 (file lives in /public).
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Mistress Sofia — Professional Dominatrix" },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "256x256" },
    ],
    // Runs before the page is first painted: marks a recently confirmed adult as verified
    // so the age gate never flashes for them (and always shows for everyone else).
    scripts: [{ children: AGE_GATE_SCRIPT }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the age-gate script sets data-age on <html> before React starts.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <PrefsProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <AgeGate />
        <Header />
        <main><Outlet /></main>
        <Footer />
      </PrefsProvider>
    </QueryClientProvider>
  );
}
