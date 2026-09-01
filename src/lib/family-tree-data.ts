export type BranchColor = "yellow" | "blue" | "green" | "gray" | "orange";

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

export interface FamilyTree {
  lineage: string[];
  surname: string;
  branches: { id: string; name: string; color: BranchColor; children: TreeNode[] }[];
}

export const LINEAGE = [
  "عبد الهادي",
  "عساف",
  "يوسف",
  "عمر",
  "بشير",
  "مقلد",
  "العاصي",
];

export const SURNAME = "حرب الجيوسي";

let counter = 0;
const uid = () => `n${Date.now().toString(36)}${(counter++).toString(36)}`;

export function makeNode(name: string, children: TreeNode[] = []): TreeNode {
  return { id: uid(), name, children };
}

const n = (name: string, children: TreeNode[] = []) => makeNode(name, children);

export function createSeedTree(): FamilyTree {
  return {
    lineage: [...LINEAGE],
    surname: SURNAME,
    branches: [
      {
        id: uid(),
        name: "محمد",
        color: "orange",
        children: [n("احمد", [n("صالح")]), n("يوسف"), n("محفوظ")],
      },
      {
        id: uid(),
        name: "محمود",
        color: "yellow",
        children: [
          n("عارف", [n("راغب"), n("حسني")]),
          n("أمين", [n("رشدي"), n("صدقي")]),
          n("أمين محمد", [n("عبد الرحمن")]),
          n("غيث", [n("مخلص"), n("فراس")]),
          n("عارف", [n("احمد")]),
        ],
      },
      {
        id: uid(),
        name: "واكد",
        color: "blue",
        children: [
          n("راشد", [n("نمر"), n("محمد")]),
          n("نضال"),
          n("اشرف", [n("نمر"), n("عبد الرحمن")]),
          n("صدقي", [n("مصطفى")]),
        ],
      },
      {
        id: uid(),
        name: "يوسف",
        color: "green",
        children: [n("حسن"), n("محمد")],
      },
      {
        id: uid(),
        name: "عساف",
        color: "gray",
        children: [n("داوود", [n("عبد القادر")]), n("حسن"), n("محمد")],
      },
    ],
  };
}
