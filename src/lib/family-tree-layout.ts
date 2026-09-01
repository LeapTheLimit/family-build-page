import type { BranchColor, FamilyTree, TreeNode } from "./family-tree-data";

export const CANVAS_W = 2000;
export const CANVAS_H = 1450;

export interface PlacedNode {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  color: BranchColor;
  parentId: string | null;
  rx: number;
  ry: number;
}

export interface PlacedEdge {
  id: string;
  path: string;
  color: BranchColor;
  width: number;
}

export interface Layout {
  nodes: PlacedNode[];
  edges: PlacedEdge[];
}

const ORIGIN_X = CANVAS_W / 2;
const ORIGIN_Y = CANVAS_H - 260;

const FONT: number[] = [32, 24, 19, 16, 15];

export function fontSizeFor(depth: number) {
  return FONT[Math.min(depth - 1, FONT.length - 1)] as number;
}

function bubbleSize(name: string, depth: number): [number, number] {
  const f = fontSizeFor(depth);
  const rx = Math.max(f * 1.5, name.length * f * 0.33 + 16);
  const ry = depth === 1 ? Math.max(f * 1.7, rx * 0.72) : Math.max(f * 1.15, 22);
  return [rx, ry];
}

function ringRadius(depth: number) {
  return 330 + (depth - 1) * 240;
}

function leafCount(node: TreeNode): number {
  if (!node.children.length) return 1;
  return node.children.reduce((s, c) => s + leafCount(c), 0);
}

export function layoutTree(tree: FamilyTree): Layout {
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];

  const START = 6;
  const END = 174;

  const totals = tree.branches.map((b) =>
    b.children.length ? b.children.reduce((s, c) => s + leafCount(c), 0) : 1,
  );
  const grand = totals.reduce((s, v) => s + v, 0) || 1;

  let cursor = START;

  const place = (
    node: TreeNode | { id: string; name: string; children: TreeNode[] },
    depth: number,
    from: number,
    to: number,
    color: BranchColor,
    parent: PlacedNode | null,
  ) => {
    const angle = (from + to) / 2;
    const rad = (angle * Math.PI) / 180;
    const R = ringRadius(depth);
    const [rx, ry] = bubbleSize(node.name, depth);
    const placed: PlacedNode = {
      id: node.id,
      name: node.name,
      x: ORIGIN_X + R * Math.cos(rad),
      y: ORIGIN_Y - R * Math.sin(rad) * 0.95,
      depth,
      color,
      parentId: parent ? parent.id : null,
      rx,
      ry,
    };
    nodes.push(placed);

    const px = parent ? parent.x : ORIGIN_X;
    const py = parent ? parent.y : ORIGIN_Y + 40;
    const midY = (py + placed.y) / 2;
    edges.push({
      id: `${parent ? parent.id : "root"}-${node.id}`,
      path: `M ${px} ${py} C ${px} ${midY}, ${placed.x} ${midY}, ${placed.x} ${placed.y}`,
      color,
      width: Math.max(8, 30 - depth * 5),
    });

    const kids = node.children;
    if (!kids.length) return;
    const span = to - from;
    const total = kids.reduce((s, c) => s + leafCount(c), 0) || 1;
    let c = from;
    for (const kid of kids) {
      const w = (leafCount(kid) / total) * span;
      place(kid, depth + 1, c, c + w, color, placed);
      c += w;
    }
  };

  tree.branches.forEach((branch, i) => {
    const span = ((totals[i] ?? 1) / grand) * (END - START);
    place(branch, 1, cursor, cursor + span, branch.color, null);
    cursor += span;
  });

  return { nodes, edges };
}
