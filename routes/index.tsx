import { Head } from "$fresh/runtime.ts";
import Board from "../islands/Board.tsx";
import { Header } from "../islands/Header.tsx";
import FloatingNotification from "../islands/notifications/FloatingNotification.tsx";
import { notificationsSignal } from "../core/signals/notificationSignals.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Chronoflow - Task Management with Time Tracking</title>
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      <main class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 w-full overflow-x-hidden">
        <Header />
        <div class="flex-1 w-full">
          <Board />
        </div>
        <div id="portal-root">
          {notificationsSignal.value.map((notification) => (
            <FloatingNotification
              key={notification.id}
              notification={notification}
              onDismiss={() => {
                notificationsSignal.value = notificationsSignal.value.filter(
                  (n) => n.id !== notification.id,
                );
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
