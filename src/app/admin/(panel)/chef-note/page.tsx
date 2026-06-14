import { getSetting } from "@/lib/menu-repo";
import { updateChefNoteAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function ChefNotePage() {
  const note = getSetting("chef_note", "");
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-4xl uppercase leading-none text-ink">
        Şefin Önerisi
      </h1>

      <form
        action={updateChefNoteAction}
        className="grid gap-4 border-2 border-ink bg-paper p-5 shadow-pop sm:p-6"
      >
        <div>
          <h2 className="font-display text-2xl uppercase text-red">
            Bugünün Şef Önerisi
          </h2>
          <p className="mt-1 font-mono text-xs text-ink/50">
            Menüde sağ alttaki peçete ikonuna tıklanınca açılan not.
          </p>
        </div>
        <textarea
          name="chefNote"
          rows={3}
          defaultValue={note}
          placeholder="ör. Tuzlu karamel cortado & portakallı kek."
          className="w-full border-2 border-ink bg-white px-3 py-2 font-hand text-2xl leading-snug text-ink outline-none focus:shadow-pop-sm"
        />
        <div>
          <button className="border-2 border-ink bg-navy px-6 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
