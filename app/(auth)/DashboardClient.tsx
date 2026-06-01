"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/lib/isMobile";
import { MobileFallback } from "@/components/MobileFallback";
import { Dashboard2D } from "@/components/Dashboard2D";
import { WeekGrid, type WeekIssue } from "@/components/WeekGrid";
import { FocusMode } from "@/components/FocusMode";
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
  weekIssues: WeekIssue[];
  todayCardId: string | null;
  unresolvedIssues: { id: string; title: string }[];
}

type ViewMode = "2d" | "3d" | "week";

function CameraMover({ mode }: { mode: CameraMode }) {
  useCameraMode(mode);
  return null;
}

const VIEW_PREF_KEY = "planner.viewMode";

export function DashboardClient({ weekStartIso, weekCards, weekIssues, todayCardId, unresolvedIssues }: Props) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [cameraMode, setCameraMode] = useState<CameraMode>("today");
  const [editing, setEditing] = useState<CardData | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);

  // 사용자 선호 저장
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(VIEW_PREF_KEY) : null;
    if (saved === "3d" || saved === "2d" || saved === "week") setViewMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(VIEW_PREF_KEY, viewMode);
  }, [viewMode]);

  const todayCard = weekCards.find((c) => c.id === todayCardId) ?? null;
  const otherCards = weekCards.filter((c) => c.id !== todayCardId);

  // 토글 컴포넌트
  const VIEW_LABEL: Record<ViewMode, string> = { "2d": "2D", "3d": "3D", week: "주간" };
  const ViewToggle = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setFocusOpen(true)}
        disabled={!todayCard}
        className="rounded-md bg-gradient-to-r from-neutral-900 to-neutral-700 px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-30"
        title={todayCard ? "오늘 카드만 풀스크린으로" : "오늘 카드 없음"}
      >
        ⚡ 포커스
      </button>
      <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5 text-xs">
        {(["2d", "week", "3d"] as ViewMode[]).map((v) => (
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
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>
    </div>
  );

  // 포커스 모드 모달은 어느 모드에서나 표시
  const FocusModeOverlay = (
    <FocusMode
      card={todayCard}
      open={focusOpen}
      onClose={() => setFocusOpen(false)}
    />
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
                {cameraMode === "today" ? "오늘 할 일" : "이번 주"}
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
          {FocusModeOverlay}
        </div>
      </SceneErrorBoundary>
    );
  }

  // 주간 모드
  if (viewMode === "week") {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">이번 주</h1>
          {ViewToggle}
        </div>
        <WeekGrid
          weekStartIso={weekStartIso}
          weekCards={weekCards}
          weekIssues={weekIssues}
          onCardClick={(c) => setEditing(c)}
        />
        <CardModal
          card={editing}
          onClose={() => setEditing(null)}
          unresolvedIssues={unresolvedIssues}
        />
        {FocusModeOverlay}
      </div>
    );
  }

  // 2D 모드 (기본)
  return (
    <div>
      <div className="mb-4 flex items-center justify-end">{ViewToggle}</div>
      <Dashboard2D
        weekCards={weekCards}
        onCardClick={(c) => setEditing(c)}
      />
      <CardModal
        card={editing}
        onClose={() => setEditing(null)}
        unresolvedIssues={unresolvedIssues}
      />
      {FocusModeOverlay}
    </div>
  );
}
