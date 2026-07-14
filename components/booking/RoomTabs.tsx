"use client";

import { ROOMS } from "@/lib/constants";

export default function RoomTabs({
  activeRoomId,
  onChange,
}: {
  activeRoomId: string;
  onChange: (roomId: string) => void;
}) {
  return (
    <div className="flex gap-2 border-b border-slate-200">
      {ROOMS.map((room) => (
        <button
          key={room.id}
          onClick={() => onChange(room.id)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
            activeRoomId === room.id
              ? "border-vri-terracotta text-vri-terracotta"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {room.name}
        </button>
      ))}
    </div>
  );
}
