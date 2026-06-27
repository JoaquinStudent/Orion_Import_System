"use client";

import { useEffect, useRef } from "react";

const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

// ponytail: sin sitekey (dev) no se renderiza nada y el back tampoco verifica.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => void;
    };
  }
}

/** Widget de Cloudflare Turnstile. Llama onToken con el token (o "" al expirar). */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITEKEY) return;
    const el = ref.current;
    const SCRIPT_ID = "cf-turnstile-script";

    function render() {
      if (!window.turnstile || !el || el.dataset.rendered) return;
      el.dataset.rendered = "1";
      window.turnstile.render(el, {
        sitekey: SITEKEY,
        callback: (token: string) => cb.current(token),
        "expired-callback": () => cb.current(""),
        "error-callback": () => cb.current(""),
      });
    }

    if (document.getElementById(SCRIPT_ID)) {
      render();
    } else {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, []);

  if (!SITEKEY) return null;
  return <div ref={ref} className="my-2" />;
}
