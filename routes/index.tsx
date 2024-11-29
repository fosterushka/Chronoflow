import { Head } from "$fresh/runtime.ts";
import Board from "../islands/Board.tsx";
import { Header } from "../islands/Header.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Chronoflow</title>
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header stats={[]} />
        <Board />
      </main>
    </>
  );
}
