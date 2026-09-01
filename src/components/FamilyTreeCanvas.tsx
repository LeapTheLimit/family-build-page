import { useMemo } from "react";
import trunkAsset from "@/assets/trunk.png.asset.json";
import type { FamilyTree } from "@/lib/family-tree-data";
import {
  CANVAS_H,
  CANVAS_W,
  fontSizeFor,
  layoutTree,
  type PlacedNode,
} from "@/lib/family-tree-layout";

const strokeFor: Record<string, string> = {
  yellow: "var(--branch-yellow)",
  blue: "var(--branch-blue)",
  green: "var(--branch-green)",
  gray: "var(--branch-gray)",
  orange: "var(--branch-orange)",
};

function fill(node: PlacedNode) {
  if (node.depth === 1) return "var(--bubble-head)";
  if (node.color === "orange" && node.depth === 2) return "var(--branch-orange)";
  return "var(--bubble-leaf)";
}

function textFill(node: PlacedNode) {
  if (node.depth === 1) return "var(--bubble-head-foreground)";
  if (node.color === "orange" && node.depth === 2) return "var(--trunk-foreground)";
  return "var(--bubble-leaf-foreground)";
}

const TRUNK_W = 430;
const TRUNK_H = (TRUNK_W / 768) * 1024;

export function FamilyTreeCanvas({
  tree,
  selectedId,
  onSelect,
}: {
  tree: FamilyTree;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(() => layoutTree(tree), [tree]);
  const trunkX = CANVAS_W / 2 - TRUNK_W / 2;
  const trunkY = CANVAS_H - TRUNK_H;

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="شجرة عائلة حرب الجيوسي"
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

      <image
        href={trunkAsset.url}
        x={trunkX}
        y={trunkY}
        width={TRUNK_W}
        height={TRUNK_H}
        preserveAspectRatio="xMidYMax meet"
      />
      <g
        fill="var(--trunk-foreground)"
        textAnchor="middle"
        fontWeight="700"
        style={{ paintOrder: "stroke" }}
        stroke="oklch(0.2 0.02 60 / 55%)"
        strokeWidth="3"
      >
        {tree.lineage.map((name, i) => (
          <text
            key={`${name}-${i}`}
            x={CANVAS_W / 2}
            y={trunkY + 230 + i * 42}
            fontSize={34}
          >
            {name}
          </text>
        ))}
        <text
          x={CANVAS_W / 2}
          y={trunkY + 245 + tree.lineage.length * 42}
          fontSize={54}
          fontWeight="900"
        >
          {tree.surname}
        </text>
      </g>

      {nodes.map((node) => {
        const selected = node.id === selectedId;
        const fontSize = fontSizeFor(node.depth);
        return (
          <g
            key={node.id}
            className="cursor-pointer"
            onClick={() => onSelect(node.id)}
            tabIndex={0}
            role="button"
            aria-label={node.name}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(node.id);
            }}
          >
            <ellipse
              cx={node.x}
              cy={node.y}
              rx={node.rx}
              ry={node.ry}
              fill={fill(node)}
              stroke={selected ? "var(--foreground)" : "transparent"}
              strokeWidth={selected ? 5 : 0}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={node.depth === 1 ? 900 : 700}
              fill={textFill(node)}
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
