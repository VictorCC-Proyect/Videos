import React from "react";
import { ARDOR } from "./ardor";
import { CREATINA } from "./creatina";
import { PROTEINA } from "./proteina";
import { durShort, ShortDef, ShortVista } from "./marco";

export const SHORTS: ShortDef[] = [CREATINA, ARDOR, PROTEINA];

export { durShort };

export const ShortView: React.FC<{ shortId: string }> = ({ shortId }) => {
  const s = SHORTS.find((x) => x.id === shortId) ?? SHORTS[0];
  return <ShortVista short={s} />;
};
