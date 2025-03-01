import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chronoflow</title>
        <meta
          name="description"
          content="A task management application designed for development teams, featuring advanced time tracking, Git integration, and workflow optimization."
        />
        <meta name="theme-color" content="#FFDB1E" />

        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Chronoflow" />
        <meta
          property="og:description"
          content="A task management application designed for development teams, featuring advanced time tracking, Git integration, and workflow optimization."
        />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        {/* PWA related tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/favicon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/favicon-192x192.png"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
