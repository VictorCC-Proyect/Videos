import { useState } from "react";
import { History, Sparkles, Trash2 } from "lucide-react";
import { AudioPlayer } from "./ui/AudioPlayer";
import { Button } from "./ui/Button";
import { Dropzone } from "./ui/Dropzone";
import { EmptyState } from "./ui/EmptyState";
import { FilterChips } from "./ui/FilterChips";
import { HistoryRow } from "./ui/HistoryRow";
import { Modal } from "./ui/Modal";
import { Sidebar, TabBar, type NavId } from "./ui/Nav";
import { ProgressBar } from "./ui/ProgressBar";
import { Select } from "./ui/Select";
import { Slider } from "./ui/Slider";
import { TextEditor } from "./ui/TextEditor";
import { Toast } from "./ui/Toast";
import { Toggle } from "./ui/Toggle";
import { VoiceCard } from "./ui/VoiceCard";

// Muestrario de los primitivos (ruta #/design). Verificación visual del sistema de diseño.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

export function DesignPage() {
  const [text, setText] = useState("Hola, este es un ejemplo de voz en off para un Short.");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [boost, setBoost] = useState(true);
  const [engine, setEngine] = useState("supertonic");
  const [chips, setChips] = useState(["Español"]);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(12);
  const [modal, setModal] = useState(false);
  const [nav, setNav] = useState<NavId>("tts");

  return (
    <main className="mx-auto flex max-w-[960px] flex-col gap-8 p-4 pb-16 sm:p-8">
      <header>
        <h1 className="text-[28px] font-bold leading-[34px]">Sistema de diseño</h1>
        <p className="text-sm text-muted">Primitivos de la app. Siguen el tema claro u oscuro del sistema.</p>
      </header>

      <Section title="Botones">
        <div className="flex flex-wrap gap-2">
          <Button icon={<Sparkles className="size-4" />}>Generar voz</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger" icon={<Trash2 className="size-4" />}>Borrar</Button>
          <Button loading>Generando</Button>
          <Button disabled>Deshabilitado</Button>
          <Button size="sm" variant="secondary">Chico</Button>
        </div>
      </Section>

      <Section title="Editor de texto">
        <TextEditor value={text} onChange={setText} limit={300} />
      </Section>

      <Section title="Ajustes">
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label="Velocidad" value={speed} onChange={setSpeed} min={0.7} max={1.2} step={0.05} left="Más lenta" right="Más rápida" format={(v) => `${v.toFixed(2)}×`} />
          <Slider label="Estabilidad" value={stability} onChange={setStability} min={0} max={1} step={0.05} left="Más expresiva" right="Más estable" format={(v) => `${Math.round(v * 100)} %`} />
          <Slider label="Similitud" value={0.75} onChange={() => {}} min={0} max={1} step={0.05} disabled disabledHint="No disponible con este modelo" />
          <div className="flex flex-col gap-2">
            <Toggle label="Realce del hablante" checked={boost} onChange={setBoost} />
            <Select label="Motor" value={engine} onChange={setEngine} options={[{ value: "supertonic", label: "Supertonic (gratis, en tu dispositivo)" }, { value: "elevenlabs", label: "ElevenLabs (con tu clave)" }]} />
          </div>
        </div>
      </Section>

      <Section title="Voces">
        <FilterChips label="Idioma" options={["Español", "Inglés", "Portugués"]} active={chips} onToggle={(o) => setChips((c) => (c.includes(o) ? c.filter((x) => x !== o) : [...c, o]))} />
        <div className="grid gap-2 sm:grid-cols-2">
          {[{ name: "Dora", tags: ["Español", "Femenina", "Narración"] }, { name: "Álex", tags: ["Español", "Masculina", "Conversación"] }].map((v, i) => (
            <VoiceCard key={v.name} voice={v} selected={selected === i} onSelect={() => setSelected(i)} playing={playing && selected === i} onPlay={() => setPlaying((p) => !p)} onSave={() => {}} saved={i === 0} />
          ))}
        </div>
      </Section>

      <Section title="Reproductor y progreso">
        <AudioPlayer title="Voz en off · Dora" playing={playing} onToggle={() => setPlaying((p) => !p)} current={pos} total={42} onSeek={setPos} onDownload={() => {}} />
        <ProgressBar label="Descargando la voz" value={40} />
        <ProgressBar label="Generando parte 2 de 3" />
      </Section>

      <Section title="Historial">
        <div>
          <HistoryRow item={{ text: "Hola, este es un ejemplo de voz en off para un Short.", voice: "Dora", engine: "Supertonic", duration: "0:04", when: "hace 2 min" }} />
          <HistoryRow item={{ text: "Tres errores que cometes al entrenar piernas.", voice: "Emiliano", engine: "ElevenLabs", duration: "0:31", when: "ayer", failed: true }} />
        </div>
        <EmptyState icon={<History className="size-6" />} text="Aquí aparecerán los audios que generes." action={<Button variant="secondary" size="sm">Ir a texto a voz</Button>} />
      </Section>

      <Section title="Subir muestra, modal y avisos">
        <Dropzone onFiles={() => {}} hint="De 1 a 3 minutos de tu voz, sin ruido de fondo" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModal(true)}>Abrir modal</Button>
        </div>
        <Toast kind="success" message="Audio listo" />
        <Toast kind="error" message="No se pudo generar el audio" />
        <Modal open={modal} onClose={() => setModal(false)} title="Elegir voz">
          <p className="text-sm text-muted">Contenido del modal.</p>
        </Modal>
      </Section>

      <Section title="Navegación">
        <div className="flex overflow-hidden rounded-lg border border-line">
          <Sidebar active={nav} onGo={setNav} />
          <div className="flex-1" />
        </div>
        <div className="overflow-hidden rounded-lg border border-line">
          <TabBar active={nav} onGo={setNav} />
        </div>
      </Section>
    </main>
  );
}
