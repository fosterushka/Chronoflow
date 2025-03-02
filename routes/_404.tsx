import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="h-screen flex flex-col">
        <Header />
        <div class="flex-1 p-6 bg-gradient-to-b from-gray-100/50 to-gray-200/50 dark:from-gray-900 dark:to-gray-800">
          <div class="max-w-4xl mx-auto h-full flex items-center justify-center">
            <div class="w-full relative">
              {/* Decorative elements */}
              <div class="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-lg animate-pulse delay-150" />

              <div class="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-12">
                <div class="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Left side - Content */}
                  <div class="flex-1 text-center md:text-left">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                      <span class="text-4xl font-bold text-white">404</span>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">
                      Oops! Lost in{" "}
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                        Time
                      </span>
                    </h1>
                    <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
                      The page you're looking for seems to have slipped through
                      a time warp.
                    </p>
                    <div class="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                      <a
                        href="/"
                        class="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                      >
                        <svg
                          class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
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
                        Return Home
                      </a>
                    </div>
                  </div>

                  {/* Right side - Decorative illustration */}
                  <div class="relative w-64 h-64 flex-shrink-0">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full animate-pulse" />
                    <div class="absolute inset-4 bg-gradient-to-br from-indigo-500/40 to-purple-600/40 rounded-full animate-pulse delay-75" />
                    <div class="absolute inset-0 flex items-center justify-center">
                      <svg
                        class="w-32 h-32 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
