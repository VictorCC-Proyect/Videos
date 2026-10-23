import { useEffect, useState } from "react";
import { BlindTest } from "./screens/BlindTest";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TtsScreen } from "./screens/TtsScreen";
import { VoicesScreen } from "./screens/VoicesScreen";
import { DesignPage } from "./DesignPage";
import { Sidebar, TabBar, type NavId } from "./ui/Nav";
import { PlayerBar } from "./ui/PlayerBar";

// Rutas con # para que funcionen en GitHub Pages sin configurar el servidor.
const routes: Record<string, NavId> = { "": "tts", voces: "voices", historial: "history", ajustes: "settings" };
const navToRoute: Record<NavId, string> = { tts: "", voices: "voces", history: "historial", settings: "ajustes" };

function useRoute() {
  const read = () => location.hash.replace(/^#\/?/, "");
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

export function App() {
  const route = useRoute();
  const go = (r: string) => {
    location.hash = `#/${r}`;
    window.scrollTo(0, 0);
  };
  const nav: NavId = routes[route] ?? "tts";

  if (route === "design") return <DesignPage />;

  const screen =
    route === "prueba" ? <BlindTest /> :
    nav === "voices" ? <VoicesScreen go={go} /> :
    nav === "history" ? <HistoryScreen go={go} /> :
    nav === "settings" ? <SettingsScreen /> :
    <TtsScreen go={go} />;

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <div className="hidden md:flex">
        <Sidebar active={nav} onGo={(id) => go(navToRoute[id])} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1100px] p-4 sm:p-8">{screen}</div>
        </main>
        <PlayerBar />
        <div className="md:hidden">
          <TabBar active={nav} onGo={(id) => go(navToRoute[id])} />
        </div>
      </div>
    </div>
  );
}
