'use client'

import { useState } from "react";
import LeftBar from "./components/LeftBar";
import MainArea from "./components/MainArea";

export type PageId = 'design' | 'r1-r2' | 'r3-r4';

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>('design');

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftBar activePage={activePage} onPageChange={setActivePage} />
      <MainArea activePage={activePage} />
    </div>
  );
}
