# شجرة عائلة الجيوسي — Interactive Arabic Family Tree

An RTL Arabic family-tree page that recreates the look of your poster: a photographic tree trunk at the base with the lineage written down its front, and colored name-bubbles connected by thick curved branch ribbons fanning out above it. Names can be added, renamed, or removed directly in the browser.

## The page

- Full-bleed canvas, off-white background, Arabic typography, `dir="rtl"`.
- Trunk at the bottom center with the root lineage stacked vertically in white text:
  عبد الهادي / عساف / يوسف / عمر / بشير / مقلد / العاصي, then حرب الجيوسي in large bold type.
- Branch ribbons in four colors (yellow, blue, green, gray) with an orange trunk-level ribbon, drawn as smooth curved SVG strokes behind the bubbles.
- Three bubble styles matching the poster:
  - Large dark-indigo circles with yellow Arabic text — the main branch heads (محمد، محمود، عساف، يوسف، واكد).
  - Yellow ovals with dark text — regular descendants.
  - Small orange circles — a secondary tier.
- Bubble size and text size scale with generation depth, exactly like the image.

## Names from the image

Main branch heads: محمد، محمود، عساف، يوسف، واكد.
Descendants read off the poster: مخلص، غيث، عارف، رشدي، صدقي، عبد الرحمن، حسني، راغب، أمين، أمين محمد، عارف، احمد، صالح، يوسف، محفوظ، احمد، فراس، راشد، نمر، نضال، اشرف، محمد، نمر، صدقي، مصطفى، عبد الرحمن، حسن، محمد، داوود، عبد القادر.
Where the poster crops a name off the edge I place it as a leaf on the nearest branch; you can rename or delete any of them after.

## Editing

- Click a bubble to select it: a side panel shows the name, its color tier, and buttons for Add child / Rename / Delete.
- Double-click a bubble to rename inline.
- New children inherit their parent branch's ribbon color and get the next tier down in size/style.
- Everything is saved in the browser (localStorage) and reloads with your edits. An "Export JSON" / "Import JSON" pair lets you back up or move the tree.
- A "Reset to original" button restores the poster's names.

## Technical notes

- Single route at `/` (`src/routes/index.tsx`) with route-level Arabic head metadata.
- Tree data as a nested node model (`id`, `name`, `tier`, `color`, `children`) in `src/lib/family-tree-data.ts`; seed data transcribed from the image.
- Layout computed client-side with a simple radial/fan algorithm so added nodes position themselves automatically; branches drawn as SVG cubic Bézier paths between parent and child centers, bubbles as absolutely-positioned HTML for crisp Arabic text.
- Colors added as semantic tokens in `src/styles.css` (branch yellow/blue/green/gray/orange, bubble indigo, poster background) — no hardcoded hex in components.
- Arabic display font (e.g. Cairo/Tajawal) loaded via a `<link>` in `src/routes/__root.tsx`.
- Trunk image generated as a photographic tree-stump asset with transparent background and stored in `src/assets/`.
- Persistence via localStorage hook; no backend needed for this scope.
