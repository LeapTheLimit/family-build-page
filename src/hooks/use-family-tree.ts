import { useCallback, useEffect, useState } from "react";
import {
  createSeedTree,
  makeNode,
  type FamilyTree,
  type TreeNode,
} from "@/lib/family-tree-data";

const STORAGE_KEY = "jayousi-family-tree-v1";

function updateChildren(nodes: TreeNode[], id: string, fn: (n: TreeNode) => TreeNode | null): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    if (node.id === id) {
      const res = fn(node);
      if (res) out.push(res);
      continue;
    }
    out.push({ ...node, children: updateChildren(node.children, id, fn) });
  }
  return out;
}

export function useFamilyTree() {
  const [tree, setTree] = useState<FamilyTree>(() => createSeedTree());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTree(JSON.parse(raw) as FamilyTree);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  }, [tree, hydrated]);

  const rename = useCallback((id: string, name: string) => {
    setTree((t) => ({
      ...t,
      branches: t.branches.map((b) =>
        b.id === id
          ? { ...b, name }
          : { ...b, children: updateChildren(b.children, id, (n) => ({ ...n, name })) },
      ),
    }));
  }, []);

  const addChild = useCallback((id: string, name: string) => {
    const child = makeNode(name);
    setTree((t) => ({
      ...t,
      branches: t.branches.map((b) =>
        b.id === id
          ? { ...b, children: [...b.children, child] }
          : {
              ...b,
              children: updateChildren(b.children, id, (n) => ({
                ...n,
                children: [...n.children, child],
              })),
            },
      ),
    }));
    return child.id;
  }, []);

  const remove = useCallback((id: string) => {
    setTree((t) => {
      if (t.branches.some((b) => b.id === id)) {
        if (t.branches.length <= 1) return t;
        return { ...t, branches: t.branches.filter((b) => b.id !== id) };
      }
      return {
        ...t,
        branches: t.branches.map((b) => ({
          ...b,
          children: updateChildren(b.children, id, () => null),
        })),
      };
    });
  }, []);

  const setLineage = useCallback((lineage: string[]) => {
    setTree((t) => ({ ...t, lineage }));
  }, []);

  const reset = useCallback(() => setTree(createSeedTree()), []);

  const importTree = useCallback((json: string) => {
    const parsed = JSON.parse(json) as FamilyTree;
    if (!parsed.branches) throw new Error("bad file");
    setTree(parsed);
  }, []);

  return { tree, hydrated, rename, addChild, remove, remove_: remove, setLineage, reset, importTree };
}
