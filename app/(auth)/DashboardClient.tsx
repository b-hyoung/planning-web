"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/isMobile";
import { MobileFallback } from "@/components/MobileFallback";
import { Scene } from "@/components/scene/Scene";
import { TodayCard } from "@/components/scene/TodayCard";
import { FloatingCards } from "@/components/scene/FloatingCards";
import { WeekCardsArc } from "@/components/scene/WeekCardsArc";
import { useCameraMode, type CameraMode } from "@/components/scene/useCameraMode";
import { SceneErrorBoundary } from "@/components/scene/SceneErrorBoundary";
import { CardModal } from "@/components/CardModal";
import type { CardData } from "@/components/CardItem";

interface Props {
  weekStartIso: string;
  weekCards: CardData[];
  todayCardId: string | null;
  unresolvedIssues: { id: string; title: string }[];
}

function CameraMover({ mode }: { mode: CameraMode }) {
  useCameraMode(mode);
  return null;
}

export function DashboardClient({ weekCards, todayCardId, unresolvedIssues }: Props) {
  const isMobile = useIsMobile();
  const [forceDesktop, setForceDesktop] = useState(false);
  const [mode, setMode] = useState<CameraMode>("today");
  const [editing, setEditing] = useState<CardData | null>(null);

  const todayCard = weekCards.find((c) => c.id === todayCardId) ?? null;
  const otherCards = weekCards.filter((c) => c.id !== todayCardId);

  if (isMobile && !forceDesktop) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => setForceDesktop(true)}
            className="text-xs text-neutral-400 underline hover:text-neutral-600"
          >
            3D 강제 보기
          </button>
        </div>
        <MobileFallback todayCard={todayCard} weekCards={weekCards} />
      </div>
    );
  }

  const fallback = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        3D 렌더 실패. 2D 보기로 전환합니다.
      </div>
      <MobileFallback todayCard={todayCard} weekCards={weekCards} />
    </div>
  );

  return (
    <SceneErrorBoundary fallback={fallback}>
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {mode === "today" ? "오늘" : "이번 주"}
          </h1>
          <button
            onClick={() => setMode(mode === "today" ? "week" : "today")}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            {mode === "today" ? "이번 주 보기" : "오늘로 돌아가기"}
          </button>
        </div>
        <Scene>
          <CameraMover mode={mode} />
          {mode === "today" ? (
            <>
              <TodayCard card={todayCard} onClick={() => todayCard && setEditing(todayCard)} />
              <FloatingCards cards={otherCards} onCardClick={(c) => setEditing(c)} />
            </>
          ) : (
            <WeekCardsArc cards={weekCards} onCardClick={(c) => setEditing(c)} />
          )}
        </Scene>
        <CardModal
          card={editing}
          onClose={() => setEditing(null)}
          unresolvedIssues={unresolvedIssues}
        />
      </div>
    </SceneErrorBoundary>
  );
}
