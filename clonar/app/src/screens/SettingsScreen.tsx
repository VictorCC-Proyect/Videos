import { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { clearDiag, deviceSummary, readDiag, type DiagEntry } from "../diag";
import { resetGuard } from "../engines/crashGuard";
import { askPersistence } from "../db";
import { elevenCredits } from "../engines/elevenlabs";
import { useApp } from "../state";
import { Button, IconButton } from "../ui/Button";

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(0)} MB`;

// S07: la clave opcional de ElevenLabs y el almacenamiento del dispositivo.
export function SettingsScreen() {
  const { prefs, setPrefs, refreshEleven, toast } = useApp();
  const [key, setKey] = useState(prefs.elevenKey);
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(false);
  const [storage, setStorage] = useState<{ usage: number; quota: number; persisted: boolean } | null>(null);

  const [log, setLog] = useState<DiagEntry[]>(readDiag);

  useEffect(() => setKey(prefs.elevenKey), [prefs.elevenKey]);

  const logText = () =>
    [deviceSummary(), ...log.map((e) => `${new Date(e.t).toLocaleTimeString("es-MX")} ${e.msg}`)].join("\n");

  async function copyLog() {
    try {
      await navigator.clipboard.writeText(logText());
      toast("Diagnóstico copiado");
    } catch {
      toast("No se pudo copiar; toma una captura", "error");
    }
  }

  const readStorage = async () => {
    try {
      const est = await navigator.storage.estimate();
      setStorage({ usage: est.usage ?? 0, quota: est.quota ?? 0, persisted: (await navigator.storage.persisted?.()) ?? false });
    } catch {
      setStorage(null);
    }
  };
  useEffect(() => {
    askPersistence().then(readStorage);
  }, []);

  async function saveKey() {
    const k = key.trim();
    if (!k) {
      setPrefs({ elevenKey: "" });
      toast("Clave borrada de este dispositivo");
      return;
    }
    setChecking(true);
    try {
      const c = await elevenCredits(k);
      setPrefs({ elevenKey: k });
      await refreshEleven();
      toast(`Clave guardada. Te quedan ${(c.limit - c.used).toLocaleString("es-MX")} créditos.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setChecking(false);
    }
  }

  async function clearModels() {
    try {
      for (const name of await caches.keys()) await caches.delete(name);
      toast("Voces descargadas borradas. Se volverán a bajar cuando las uses.");
      readStorage();
    } catch {
      toast("No se pudieron borrar", "error");
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="text-[28px] font-bold leading-[34px]">Configuración</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">ElevenLabs (opcional)</h2>
        <p className="text-sm text-muted">
          Con tu clave puedes usar las voces de tu cuenta, como Emiliano. Cada audio gasta créditos de tu plan, y las voces de la biblioteca necesitan un plan de pago. La clave se guarda solo en este dispositivo.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Clave de API</span>
          <span className="flex h-11 items-center rounded-md border border-input pl-3">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="sk_…"
              className="h-full flex-1 bg-transparent font-mono text-sm outline-none"
            />
            <IconButton type="button" label={show ? "Ocultar clave" : "Mostrar clave"} onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </IconButton>
          </span>
        </label>
        <div className="flex gap-2">
          <Button onClick={saveKey} loading={checking}>{key.trim() ? "Guardar y probar" : "Borrar clave"}</Button>
        </div>
        <p className="text-xs text-muted">La creas en elevenlabs.io, en tu perfil, sección API Keys.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Almacenamiento</h2>
        {storage ? (
          <p className="text-sm text-muted">
            Usando {mb(storage.usage)} de {mb(storage.quota)} disponibles. {storage.persisted ? "El navegador no borrará estos datos por su cuenta." : "El navegador podría borrar estos datos si se queda sin espacio."}
          </p>
        ) : (
          <p className="text-sm text-muted">Este navegador no informa el espacio usado.</p>
        )}
        <Button variant="secondary" icon={<Trash2 className="size-4" />} onClick={clearModels} className="self-start">
          Borrar las voces descargadas
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Diagnóstico</h2>
        <p className="text-sm text-muted">Lo que hicieron los motores de voz, paso a paso. Se conserva aunque el navegador cierre la pestaña.</p>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-surface p-3 font-mono text-xs text-fg">
          {log.length ? logText() : "Todavía no hay registros."}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={<Copy className="size-4" />} onClick={copyLog} disabled={!log.length}>
            Copiar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { clearDiag(); setLog([]); }} disabled={!log.length}>
            Borrar registro
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { resetGuard(); toast("Se volverán a probar todos los modos"); }}>
            Reiniciar modos de los motores
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Acerca de</h2>
        <p className="text-sm text-muted">
          App de uso propio. La voz se genera en tu dispositivo con modelos abiertos: Supertonic (Supertone, pesos OpenRAIL-M, código MIT) y Kokoro (Apache 2.0). Íconos de Lucide (ISC). No está afiliada a ElevenLabs.
        </p>
      </section>
    </div>
  );
}
