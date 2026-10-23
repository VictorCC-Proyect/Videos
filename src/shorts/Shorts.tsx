import React from "react";
import { AGUJETAS } from "./agujetas";
import { ARDOR } from "./ardor";
import { CREATINA } from "./creatina";
import { CONTINUUM } from "./continuum";
import { ENERGIA1 } from "./energia1";
import { ENERGIA2 } from "./energia2";
import { FIBRAS1 } from "./fibras1";
import { FIBRAS2 } from "./fibras2";
import { SOMATOTIPOS } from "./somatotipos";
import { CONTRACCION1 } from "./contraccion1";
import { CONTRACCION2 } from "./contraccion2";
import { AYUNO } from "./ayuno";
import { GLUCOSA } from "./glucosa";
import { DEFICIT } from "./deficit";
import { MICROBIOTA } from "./microbiota";
import { MAGNESIO } from "./magnesio";
import { COLAGENO } from "./colageno";
import { CORTISOL } from "./cortisol";
import { CAFEINA } from "./cafeina";

import { PROTEINA } from "./proteina";
import { durShort, ShortDef, ShortVista } from "./marco";

export const SHORTS: ShortDef[] = [CREATINA, ARDOR, AGUJETAS, PROTEINA, CONTINUUM, CONTRACCION1, CONTRACCION2, ENERGIA1, ENERGIA2, FIBRAS1, FIBRAS2, SOMATOTIPOS, AYUNO, GLUCOSA, DEFICIT, MICROBIOTA, MAGNESIO, COLAGENO, CORTISOL, CAFEINA];

export { durShort };

export const ShortView: React.FC<{ shortId: string }> = ({ shortId }) => {
  const s = SHORTS.find((x) => x.id === shortId) ?? SHORTS[0];
  return <ShortVista short={s} />;
};
