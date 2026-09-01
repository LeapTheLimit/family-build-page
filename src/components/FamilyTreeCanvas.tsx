import { useEffect, useMemo, useRef, useState } from "react";
import trunkAsset from "@/assets/trunk.png.asset.json";
import type { FamilyTree } from "@/lib/family-tree-data";
import { CANVAS_H, CANVAS_W, layoutTree, type PlacedNode } from "@/lib/family-tree-layout";

const strokeFor: Record<string, string> = {
  yellow: "var(--branch-yellow)",
  blue: "var(--branch-blue)",
  green: "var(--branch-green)",
  gray: "var(--branch-gray)",
  orange: "var(--branch-orange)",
};

function bubbleClasses(node: PlacedNode) {
  if (node.depth === 1) return "bg-bubble-head text-bubble-head-foreground";
  if (node.color === "orange" && node.depth === 2)
    return "bg-branch-orange text-bubble-head-foreground";
  return "bg-bubble-leaf text-bubble-leaf-foreground";
}

export function FamilyTreeCanvas({
  tree,
  selectedId,
  onSelect,
  onRename,
}: {
  tree: FamilyTree;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const { nodes, edges } = useMemo(() => layoutTree(tree), [tree]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / CANVAS_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} dir="ltr" className="w-full overflow-hidden">
      <div
        style={{
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          margin: "0 auto",
        }}
      >
        <div
          className="relative"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <svg
            className="absolute inset-0"
            width={CANVAS_W}
            height={CANVAS_H}
            aria-hidden="true"
          >
            {edges.map((e) => (
              <path
                key={e.id}
                d={e.path}
                fill="none"
                stroke={strokeFor[e.color]}
                strokeWidth={e.width}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {nodes.map((node) => {
            const selected = node.id === selectedId;
            const fontSize =
              node.depth === 1 ? 30 : node.depth === 2 ? 22 : node.depth === 3 ? 17 : 14;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelect(node.id)}
                onDoubleClick={() => setEditing(node.id)}
                className={`absolute flex items-center justify-center rounded-full px-2 text-center font-bold leading-tight shadow-sm transition-transform hover:scale-105 ${bubbleClasses(node)} ${
                  selected ? "ring-4 ring-ring ring-offset-2 ring-offset-background" : ""
                }`}
                style={{
                  width: node.rx * 2,
                  height: node.ry * 2,
                  left: node.x - node.rx,
                  top: node.y - node.ry,
                  fontSize,
                }}
              >
                {editing === node.id ? (
                  <input
                    autoFocus
                    defaultValue={node.name}
                    onBlur={(e) => {
                      onRename(node.id, e.currentTarget.value.trim() || node.name);
                      setEditing(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="w-full bg-transparent text-center outline-none"
                    style={{ fontSize }}
                  />
                ) : (
                  node.name
                )}
              </button>
            );
          })}

          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: 430 }}
          >
            <img
              src={trunkAsset.url}
              alt="جذع شجرة العائلة"
              width={768}
              height={1024}
              className="w-full select-none"
            />
            <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center gap-1">
              {tree.lineage.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-trunk-foreground font-bold drop-shadow-md"
                  style={{ fontSize: 30 }}
                >
                  {name}
                </span>
              ))}
              <span
                className="text-trunk-foreground mt-2 font-black drop-shadow-md"
                style={{ fontSize: 46 }}
              >
                {tree.surname}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
