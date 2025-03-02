import { Head } from "$fresh/runtime.ts";
import Board from "../islands/Board.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Chronoflow - Task Management with Time Tracking</title>
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Board />
      </main>
    </>
  );
}
