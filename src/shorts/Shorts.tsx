import React from "react";
import { ARDOR } from "./ardor";
import { CREATINA } from "./creatina";
import { CONTINUUM } from "./continuum";
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

export const SHORTS: ShortDef[] = [CREATINA, ARDOR, PROTEINA, CONTINUUM, AYUNO, GLUCOSA, DEFICIT, MICROBIOTA, MAGNESIO, COLAGENO, CORTISOL, CAFEINA];

export { durShort };

export const ShortView: React.FC<{ shortId: string }> = ({ shortId }) => {
  const s = SHORTS.find((x) => x.id === shortId) ?? SHORTS[0];
  return <ShortVista short={s} />;
};
