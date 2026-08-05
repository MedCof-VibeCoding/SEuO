import Script from "next/script";

import { env } from "~/env";

/**
 * Instala o tracking oficial do Microsoft Clarity quando o projeto está configurado.
 */
export function ClarityTracking() {
  const projectId = env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script",${JSON.stringify(projectId)});
      `}
    </Script>
  );
}
