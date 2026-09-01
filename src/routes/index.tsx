import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { FamilyTreeCanvas } from "@/components/FamilyTreeCanvas";
import { useFamilyTree } from "@/hooks/use-family-tree";
import { layoutTree } from "@/lib/family-tree-layout";

const TITLE = "شجرة عائلة حرب الجيوسي";
const DESC =
  "شجرة عائلة تفاعلية لعائلة حرب الجيوسي — أضف وعدّل واحذف الأسماء مباشرة من المتصفح.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilyTreePage,
});

function FamilyTreePage() {
  const { tree, rename, addChild, remove, reset, importTree } = useFamilyTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => layoutTree(tree).nodes.find((n) => n.id === selectedId) ?? null,
    [tree, selectedId],
  );

  const btn =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors";

  return (
    <div dir="rtl" className="font-arabic min-h-screen bg-background">
      <header className="border-b border-border px-6 py-5 text-center">
        <h1 className="text-3xl font-black text-foreground">{TITLE}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اضغط على أي اسم لتعديله أو إضافة أبناء له — التعديلات تُحفظ تلقائياً.
        </p>
      </header>

      <main className="flex flex-col gap-6 px-4 py-6 lg:flex-row-reverse">
        <aside className="w-full shrink-0 rounded-xl border border-border bg-card p-4 lg:w-80">
          {selected ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">الاسم المحدد</span>
                <input
                  value={selected.name}
                  onChange={(e) => rename(selected.id, e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-bold text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  الجيل {selected.depth}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">إضافة ابن</span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="اسم الابن"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    className={`${btn} bg-primary text-primary-foreground hover:bg-primary/90`}
                    onClick={() => {
                      const name = childName.trim();
                      if (!name) return;
                      addChild(selected.id, name);
                      setChildName("");
                    }}
                  >
                    إضافة
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`${btn} w-full bg-destructive text-destructive-foreground hover:bg-destructive/90`}
                onClick={() => {
                  remove(selected.id);
                  setSelectedId(null);
                }}
              >
                حذف هذا الاسم وفروعه
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              اختر اسماً من الشجرة لتعديله، أو انقر نقرتين على الاسم لتحريره مباشرة.
            </p>
          )}

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <button
              type="button"
              className={`${btn} w-full border border-input bg-background hover:bg-accent`}
              onClick={() => {
                const blob = new Blob([JSON.stringify(tree, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "family-tree.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              تصدير JSON
            </button>
            <button
              type="button"
              className={`${btn} w-full border border-input bg-background hover:bg-accent`}
              onClick={() => fileRef.current?.click()}
            >
              استيراد JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  importTree(await file.text());
                  setSelectedId(null);
                } catch {
                  alert("ملف غير صالح");
                }
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className={`${btn} w-full border border-input bg-background hover:bg-accent`}
              onClick={() => {
                if (confirm("استعادة الأسماء الأصلية؟")) {
                  reset();
                  setSelectedId(null);
                }
              }}
            >
              استعادة الأصل
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <FamilyTreeCanvas
            tree={tree}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRename={rename}
          />
        </section>
      </main>
    </div>
  );
}
