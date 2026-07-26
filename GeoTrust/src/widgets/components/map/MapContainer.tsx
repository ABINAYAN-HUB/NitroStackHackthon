"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapWidgetSSR = dynamic(() => import("./MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-paper border border-border/30 flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
    </div>
  ),
});

interface Props {
  address: string;
  isContradicted?: boolean;
}

export default function MapContainer({ address, isContradicted = false }: Props) {
  return <MapWidgetSSR address={address} isContradicted={isContradicted} />;
}
