import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { FPS } from "./fisio/motor";
import {
  CAPITULOS,
  CAPITULOS_ENERGIA,
  CapituloView,
  durCapitulo,
  VideoCompleto,
  VideoEnergia,
} from "./fisio/Video";
import { durShort, SHORTS, ShortView } from "./shorts/Shorts";

// Cada <Composition> aparece en la barra lateral de Remotion Studio.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AparatoLocomotor"
        component={VideoCompleto}
        durationInFrames={CAPITULOS.reduce((a, c) => a + durCapitulo(c), 0)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Folder name="Capitulos">
        {CAPITULOS.map((c) => (
          <Composition
            key={c.id}
            id={c.id}
            component={CapituloView}
            durationInFrames={durCapitulo(c)}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ capId: c.id }}
          />
        ))}
      </Folder>
      <Composition
        id="SistemasEnergeticos"
        component={VideoEnergia}
        durationInFrames={CAPITULOS_ENERGIA.reduce((a, c) => a + durCapitulo(c), 0)}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Folder name="Capitulos-Energia">
        {CAPITULOS_ENERGIA.map((c) => (
          <Composition
            key={c.id}
            id={c.id}
            component={CapituloView}
            durationInFrames={durCapitulo(c)}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ capId: c.id }}
          />
        ))}
      </Folder>
      <Folder name="Shorts">
        {SHORTS.map((s) => (
          <Composition
            key={s.id}
            id={s.id}
            component={ShortView}
            durationInFrames={durShort(s)}
            fps={FPS}
            width={1080}
            height={1920}
            defaultProps={{ shortId: s.id }}
          />
        ))}
      </Folder>
      <Folder name="Ejemplo">
        <Composition
          id="HelloWorld"
          component={HelloWorld}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
    </>
  );
};
