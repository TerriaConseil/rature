import { Outlet } from "react-router";

import Providers from '@/providers/index.tsx';

export function Layout() {
  return (
    <Providers>
      <div className="flex flex-col min-h-full text-fg antialiased bg-linear-to-b from-gray-200 to-surface dark:from-surface dark:to-gray-900">
        <Outlet />
      </div>
    </Providers>
  );
}
