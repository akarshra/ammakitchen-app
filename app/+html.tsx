import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            a, a:link, a:visited, a:hover, a:active, a[href^="tel"] {
              color: inherit !important;
              text-decoration: none !important;
              -webkit-text-fill-color: inherit !important;
            }
            body {
              background-color: #0B0F15;
              color: #FFFFFF;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
