import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div class="max-w-lg w-full text-center">
          <div class="text-6xl font-bold text-gray-900 dark:text-white mb-8">404</div>
          <div class="relative">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full animate-pulse"></div>
            </div>
            <svg
              class="w-32 h-32 mx-auto text-blue-500 relative"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mt-8">
            Page not found
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-4 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been removed or the link might be broken.
          </p>
          <a
            href="/"
            class="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
