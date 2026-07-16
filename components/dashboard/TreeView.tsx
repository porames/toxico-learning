"use client";

import { Fragment } from "react";
import type { ClassItem, Selection } from "./types";
import {
  ChevronIcon,
  FolderIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  MATERIAL_ICON,
  MATERIAL_COLOR,
} from "./icons";
import formatTimeRange from "@/lib/formatTimeRange";


interface TreeViewProps {
  classes: ClassItem[];
  selection: Selection;
  expanded: Set<string>;
  onToggle: (classId: string, isExpanded: boolean) => void;
  onSelect: (selection: Selection) => void;
  onAddLecture: (classId: string) => void;
  onAddMaterial: (classId: string, lectureId: string) => void;
  onDeleteClass: (classId: string) => void;
  onDeleteLecture: (classId: string, lectureId: string) => void;
  onDeleteMaterial: (classId: string, lectureId: string, materialId: string) => void;
}

/** A single tree row: icon, label, optional subtitle, hover-revealed action buttons. */
function TreeRow({
  depth,
  icon,
  label,
  subtitle,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
  actions,
}: {
  depth: number;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  isSelected: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onSelect: () => void;
  onToggle?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={`group relative flex h-9 items-center gap-1.5 rounded-md pr-1.5 text-left transition ${isSelected ? "bg-iris-50 text-iris-700" : "text-ink-700 hover:bg-ink-900/[0.03]"
        }`}
      style={{ paddingLeft: depth * 20 + 8 }}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-300 hover:text-ink-500"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronIcon className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </button>
      ) : (
        <></>
      )}

      <span className={`flex h-5 w-5 shrink-0 items-center justify-center ${isSelected ? "text-iris-600" : "text-ink-300"}`}>
        {icon}
      </span>

      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-[13.5px] font-medium">{label}</span>
        {subtitle && <span className="shrink-0 truncate text-[12px] text-ink-300">{subtitle}</span>}
      </span>

      {actions && (
        <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">{actions}</span>
      )}
    </div>
  );
}

function RowIconButton({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={label}
      className={`flex h-6 w-6 items-center justify-center rounded transition ${danger ? "text-ink-300 hover:bg-red-50 hover:text-red-500" : "text-ink-300 hover:bg-iris-50 hover:text-iris-600"
        }`}
    >
      {children}
    </button>
  );
}

/** Vertical guide line wrapping a nested children block, indented to match a given depth. */
function TreeChildren({ depth, children }: { depth: number; children: React.ReactNode }) {
  return (
    <div className="relative" style={{ marginLeft: depth * 20 + 18 }}>
      <div className="absolute bottom-1 left-0 top-0 w-px bg-ink-900/10" />
      <div className="pl-4">{children}</div>
    </div>
  );
}

export default function TreeView({
  classes,
  selection,
  expanded,
  onToggle,
  onSelect,
  onAddLecture,
  onAddMaterial,
  onDeleteClass,
  onDeleteLecture,
  onDeleteMaterial,
}: TreeViewProps) {
  if (classes.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-[13.5px] text-ink-300">No classes yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 py-2">
      {classes.map((cls) => {
        const classExpanded = expanded.has(cls.id);
        const classSelected = selection?.level === "class" && selection.classId === cls.id;

        return (
          <Fragment key={cls.id}>
            <TreeRow
              depth={0}
              icon={<FolderIcon className="h-4 w-4" />}
              label={cls.name}
              subtitle={cls.code}
              isSelected={classSelected}
              isExpanded={classExpanded}
              hasChildren
              onSelect={() => onSelect({ level: "class", classId: cls.id })}
              onToggle={() => onToggle(cls.id, classExpanded)}
              actions={
                <>
                  <RowIconButton label="Add lecture" onClick={() => onAddLecture(cls.id)}>
                    <PlusIcon className="h-3.5 w-3.5" />
                  </RowIconButton>
                  <RowIconButton label="Delete class" danger onClick={() => onDeleteClass(cls.id)}>
                    <TrashIcon className="h-3.5 w-3.5" />
                  </RowIconButton>
                </>
              }
            />

            {classExpanded && (
              <TreeChildren depth={0}>
                {cls.lectures === undefined ? (
                  <p className="py-2 text-[12.5px] italic text-ink-300">Loading ...</p>
                ) : cls.lectures.length === 0 ? (
                  <p className="py-2 text-[12.5px] italic text-ink-300">No lectures yet</p>
                ) : (
                  cls.lectures.map((lec) => {
                    const lecExpanded = expanded.has(lec.id);
                    const lecSelected = selection?.level === "lecture" && selection.lectureId === lec.id;

                    return (
                      <Fragment key={lec.id}>
                        <TreeRow
                          depth={0}
                          icon={<ClockIcon className="h-4 w-4" />}
                          label={lec.title || "Untitled lecture"}
                          subtitle={formatTimeRange(lec.startTime, lec.endTime)}
                          isSelected={lecSelected}
                          isExpanded={lecExpanded}
                          hasChildren={false}
                          onSelect={() => onSelect({ level: "lecture", classId: cls.id, lectureId: lec.id })}
                          onToggle={() => onToggle(lec.id)}
                          actions={
                            <>
                              <RowIconButton label="Add material" onClick={() => onAddMaterial(cls.id, lec.id)}>
                                <PlusIcon className="h-3.5 w-3.5" />
                              </RowIconButton>
                              <RowIconButton
                                label="Delete lecture"
                                danger
                                onClick={() => onDeleteLecture(cls.id, lec.id)}
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </RowIconButton>
                            </>
                          }
                        />


                      </Fragment>
                    );
                  })
                )}
              </TreeChildren>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
