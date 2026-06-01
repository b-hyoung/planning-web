"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/lib/isMobile";
import { MobileFallback } from "@/components/MobileFallback";
import { Dashboard2D } from "@/components/Dashboard2D";
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

type ViewMode = "2d" | "3d";

function CameraMover({ mode }: { mode: CameraMode }) {
  useCameraMode(mode);
  return null;
}

const VIEW_PREF_KEY = "planner.viewMode";

export function DashboardClient({ weekCards, todayCardId, unresolvedIssues }: Props) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [cameraMode, setCameraMode] = useState<CameraMode>("today");
  const [editing, setEditing] = useState<CardData | null>(null);

  // 사용자 선호 저장
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(VIEW_PREF_KEY) : null;
    if (saved === "3d" || saved === "2d") setViewMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(VIEW_PREF_KEY, viewMode);
  }, [viewMode]);

  const todayCard = weekCards.find((c) => c.id === todayCardId) ?? null;
  const otherCards = weekCards.filter((c) => c.id !== todayCardId);

  // 토글 컴포넌트
  const ViewToggle = (
    <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5 text-xs">
      {(["2d", "3d"] as ViewMode[]).map((v) => (
        <button
          key={v}
          onClick={() => setViewMode(v)}
          className={
            "rounded px-3 py-1 font-medium transition " +
            (viewMode === v
              ? "bg-neutral-900 text-white"
              : "text-neutral-500 hover:bg-neutral-100")
          }
        >
          {v === "2d" ? "2D" : "3D"}
        </button>
      ))}
    </div>
  );

  // 모바일은 항상 폴백
  if (isMobile) {
    return (
      <div className="space-y-3">
        <MobileFallback todayCard={todayCard} weekCards={weekCards} />
      </div>
    );
  }

  // 3D 모드
  if (viewMode === "3d") {
    const fallback = (
      <div className="space-y-3">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          3D 렌더 실패. 2D 로 전환합니다.
        </div>
        <Dashboard2D
          todayCard={todayCard}
          weekCards={weekCards}
          onCardClick={(c) => setEditing(c)}
        />
      </div>
    );

    return (
      <SceneErrorBoundary fallback={fallback}>
        <div className="relative">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                {cameraMode === "today" ? "오늘" : "이번 주"}
              </h1>
              <button
                onClick={() => setCameraMode(cameraMode === "today" ? "week" : "today")}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs hover:bg-neutral-100"
              >
                {cameraMode === "today" ? "이번 주 보기" : "오늘로 돌아가기"}
              </button>
            </div>
            {ViewToggle}
          </div>
          <Scene>
            <CameraMover mode={cameraMode} />
            {cameraMode === "today" ? (
              <>
                <TodayCard
                  card={todayCard}
                  onClick={() => todayCard && setEditing(todayCard)}
                />
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

  // 2D 모드 (기본)
  return (
    <div>
      <div className="mb-4 flex items-center justify-end">{ViewToggle}</div>
      <Dashboard2D
        todayCard={todayCard}
        weekCards={weekCards}
        onCardClick={(c) => setEditing(c)}
      />
      <CardModal
        card={editing}
        onClose={() => setEditing(null)}
        unresolvedIssues={unresolvedIssues}
      />
    </div>
  );
}
