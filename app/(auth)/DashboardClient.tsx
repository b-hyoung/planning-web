"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/lib/isMobile";
import { useDeviceTilt } from "@/lib/useDeviceTilt";
import { MobileFallback } from "@/components/MobileFallback";
import { Dashboard2D } from "@/components/Dashboard2D";
import { Scene } from "@/components/scene/Scene";
import { PhysicsScene } from "@/components/scene/PhysicsScene";
import { PhysicsCards } from "@/components/scene/PhysicsCards";
import type { AttractorMode } from "@/components/scene/PhysicsInteraction";
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
  const [attractorMode, setAttractorMode] = useState<AttractorMode>("off");
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const tilt = useDeviceTilt(tiltEnabled);

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
          {cameraMode === "today" ? (
            <>
              {/* 인터랙션 컨트롤 바 */}
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-neutral-500">마우스:</span>
                {(["off", "attract", "repel"] as AttractorMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAttractorMode(m)}
                    className={
                      "rounded px-2 py-1 transition " +
                      (attractorMode === m
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 text-neutral-600 hover:bg-neutral-100")
                    }
                  >
                    {m === "off" ? "끔" : m === "attract" ? "끌어옴" : "밀어냄"}
                  </button>
                ))}
                <span className="ml-3 text-neutral-500">기울기:</span>
                {!tiltEnabled ? (
                  <button
                    onClick={async () => {
                      if (tilt.permission === "needs-prompt") {
                        await tilt.requestPermission();
                      }
                      setTiltEnabled(true);
                    }}
                    disabled={tilt.permission === "unsupported" || tilt.permission === "denied"}
                    className="rounded border border-neutral-300 px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                  >
                    켜기
                    {tilt.permission === "needs-prompt" && " (권한 필요)"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTiltEnabled(false);
                      tilt.disable();
                    }}
                    className="rounded bg-neutral-900 px-2 py-1 text-white"
                  >
                    끄기
                  </button>
                )}
                {tilt.permission === "unsupported" && (
                  <span className="text-neutral-400">(이 기기 미지원)</span>
                )}
                {tilt.permission === "denied" && (
                  <span className="text-red-500">(거부됨)</span>
                )}
                <span className="ml-auto text-neutral-400">
                  스크롤하면 바람 분
                </span>
              </div>
              <PhysicsScene
                gravity={tiltEnabled ? tilt.gravity : [0, 0, 0]}
                attractorMode={attractorMode}
              >
                <PhysicsCards
                  todayCard={todayCard}
                  otherCards={otherCards}
                  onCardClick={(c) => setEditing(c)}
                />
              </PhysicsScene>
            </>
          ) : (
            <Scene>
              <CameraMover mode={cameraMode} />
              <WeekCardsArc cards={weekCards} onCardClick={(c) => setEditing(c)} />
            </Scene>
          )}
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
