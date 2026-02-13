import Image from "next/image";
import LeftBar from "./components/LeftBar";
import MainArea from "./components/MainArea";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <LeftBar />
      <MainArea />
    </div>
  );
}
