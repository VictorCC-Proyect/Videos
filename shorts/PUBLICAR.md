# Shorts de nutrición: cómo editarlos y publicarlos

Canal: **NutriFit.ConCiencia** (`@nutrifit.conciencia`). Si ese usuario está ocupado en alguna red, prueba
`@nutrifitconciencia` o `@nutrifit_conciencia`; cambia el usuario en `shorts/canal.json` y vuelve a generar (ver abajo).

Formato: vertical (9:16), 60–75 s, animación 3D, voz sintética (Piper, español de México), subtítulos grandes.

## Estilo de todos los shorts (desde ahora)

Animación **3D** que muestra el proceso, no solo texto: empieza afuera del cuerpo (atleta entrenando),
la cámara hace zoom al músculo → fibra → interior de la fibra, y ahí se ve lo que pasa (moléculas,
reacciones, ATP, miosina…). El texto en pantalla es solo de apoyo: subtítulos grandes y datos clave.

Los shorts 3D están en `src/shorts/` (Remotion), uno por archivo: `creatina.tsx`, `ardor.tsx`,
`proteina.tsx`. Piezas compartidas: `marco.tsx` (formato vertical, subtítulos, marca, cierre),
`viaje.tsx` (zoom del cuerpo al interior de la fibra) y `modelos.tsx` (atleta, fibra, riñones, comida…).

## Ver, editar y renderizar (Windows, PowerShell)

```powershell
cd Videos
npm run dev                      # Remotion Studio -> carpeta "Shorts"
# Voz nueva si cambiaste algún texto (lista "const T" de cada short):
python scripts\narracion.py C:\ruta\es_MX-claude-high.onnx
# Render vertical 720x1280 (rápido y suficiente para redes):
npx remotion render src/index.ts Short-Creatina out/shorts/Creatina-3D.mp4 --scale=0.6666666666666666 --gl=angle --timeout=120000
# Para 1080x1920 quita --scale.
```

La versión anterior (solo gráficos 2D, HyperFrames) sigue en `shorts/creatina`, `shorts/ardor`,
`shorts/proteina` por si la quieres usar.

## Antes de publicar (todas las redes)

- Activa la etiqueta de **contenido generado con IA** (voz sintética): en TikTok "Contenido generado por IA",
  en YouTube "Contenido alterado o sintético", en Instagram/Facebook "Etiqueta de IA".
- Deja el aviso "Contenido educativo, no sustituye consulta profesional" en la descripción.
- Puedes añadir una música en tendencia **desde la app** al 5–10 % de volumen para que no tape la voz.
- Publica los 3 a lo largo de una semana (no el mismo día) y responde los comentarios en la primera hora.
- Portada: elige el primer segundo (el gancho) como miniatura.

---

## 1. Creatina

**Título YouTube Shorts:** ¿La creatina es un esteroide? 🤔 Lo que dice la ciencia #shorts

**Texto TikTok / Reels / Facebook:**
¿La creatina es un esteroide? Spoiler: NO 🙅‍♂️ Te explico qué hace en tu músculo, cuánto tomar y por qué
subes un kilo en la báscula 💧
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #creatina #nutricion #nutriciondeportiva #gym #suplementos #fitness #ciencia #aprendeentiktok #nutriologo #musculo

---

## 2. ¿Por qué te arde el músculo? Los protones, no el lactato

**Título YouTube Shorts:** ¿Por qué te ARDE el músculo? 🔥 Los protones, no el lactato #shorts

**Texto TikTok / Reels / Facebook:**
El ardor al entrenar NO es culpa del lactato: son los protones (H⁺) que bajan el pH de tu músculo 🔥 Mira el proceso en 3D.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #acidolactico #lactato #gym #fisiologia #entrenamiento #fitness #ciencia #nutriciondeportiva #aprendeentiktok #musculo

---

## 3. ¿Cuánta proteína necesitas?

**Título YouTube Shorts:** ¿Cuánta PROTEÍNA necesitas al día? 🍗 Calcúlalo en 10 segundos #shorts

**Texto TikTok / Reels / Facebook:**
¿Cuánta proteína necesitas? Depende de tu peso y de cómo entrenas 💪 Te enseño a calcularla y
cuánto aportan pollo, huevo y frijoles.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #proteina #nutricion #gym #ganarmusculo #perdergrasa #nutriciondeportiva #fitness #dieta #aprendeentiktok #comidasaludable

---

## 4. Continuum energético

**Título YouTube Shorts:** ¿La grasa se quema solo después de 30 minutos? ⏱️ FALSO #shorts

**Texto TikTok / Reels / Facebook:**
Tus 3 sistemas de energía trabajan a la vez desde el primer segundo. Te muestro el continuum energético dentro de tu músculo 🔥
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #quemargrasa #cardio #continuumenergetico #fisiologia #gym #fitness #perdergrasa #ciencia #aprendeentiktok #nutricion

---

## 5. Ayuno intermitente por horas

**Título YouTube Shorts:** Ayuno intermitente: qué pasa en tu cuerpo HORA por HORA ⏳ #shorts

**Texto TikTok / Reels / Facebook:**
0, 4, 12, 18 horas… ¿qué hace tu cuerpo cuando dejas de comer? Insulina, glucógeno, grasa, cetonas y autofagia en 3D.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #ayunointermitente #ayuno #cetosis #autofagia #nutricion #perdergrasa #salud #ciencia #aprendeentiktok #metabolismo

---

## 6. Picos de glucosa e insulina

**Título YouTube Shorts:** Picos de GLUCOSA y resistencia a la insulina 🍩 explicado en 3D #shorts

**Texto TikTok / Reels / Facebook:**
¿Sueño después de comer? Es un pico de glucosa. Mira cómo la insulina abre tus células y cómo se llega a la resistencia a la insulina.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #glucosa #insulina #resistenciaalainsulina #diabetes #nutricion #salud #azucar #ciencia #aprendeentiktok #metabolismo

---

## 7. Déficit calórico

**Título YouTube Shorts:** Déficit calórico: por qué NO bajas de peso ⚖️ #shorts

**Texto TikTok / Reels / Facebook:**
Haces dieta y la báscula no se mueve. Te explico el déficit calórico y los 3 errores más comunes.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #deficitcalorico #bajardepeso #perdergrasa #nutricion #dieta #gym #fitness #calorias #aprendeentiktok #ciencia

---

## 8. Microbiota, ultraprocesados y edulcorantes

**Título YouTube Shorts:** Ultraprocesados, edulcorantes y tu MICROBIOTA 🦠 #shorts

**Texto TikTok / Reels / Facebook:**
Billones de bacterias viven en tu intestino y lo que comes las cambia. Fibra, butirato, emulsionantes y edulcorantes en 3D.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #microbiota #intestino #ultraprocesados #edulcorantes #fibra #nutricion #salud #ciencia #aprendeentiktok #probioticos

---

## 9. Magnesio

**Título YouTube Shorts:** MAGNESIO: el mineral que relaja tus músculos 💪 #shorts

**Texto TikTok / Reels / Facebook:**
El magnesio participa en más de 300 reacciones. Mira qué hace dentro de tu músculo y dónde encontrarlo.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #magnesio #minerales #calambres #nutricion #suplementos #gym #salud #ciencia #aprendeentiktok #musculo

---

## 10. Colágeno

**Título YouTube Shorts:** ¿Sirve tomar COLÁGENO? 🦴 Lo que dice la ciencia #shorts

**Texto TikTok / Reels / Facebook:**
El colágeno que tomas no va directo a tu piel ni a tus rodillas. Te muestro el camino real en 3D.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #colageno #articulaciones #tendones #suplementos #nutricion #vitaminac #gym #ciencia #aprendeentiktok #salud

---

## 11. Cortisol

**Título YouTube Shorts:** CORTISOL: ¿enemigo o aliado? 😰 #shorts

**Texto TikTok / Reels / Facebook:**
El cortisol te despierta cada mañana y te da energía al entrenar. El problema es cuando no baja.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #cortisol #estres #hormonas #sueño #grasaabdominal #salud #gym #ciencia #aprendeentiktok #nutricion

---

## 12. Cafeína antes de entrenar

**Título YouTube Shorts:** CAFEÍNA antes de entrenar: cómo funciona ☕ #shorts

**Texto TikTok / Reels / Facebook:**
La cafeína bloquea a la adenosina y por eso sientes menos cansancio. Dosis, tiempos y precauciones.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #cafeina #preentreno #cafe #gym #rendimiento #suplementos #nutriciondeportiva #ciencia #aprendeentiktok #fitness

---

## Ideas para los siguientes shorts (alto interés en búsquedas)

1. ¿El huevo sube el colesterol?
2. Ayuno intermitente: ¿funciona o es moda?
3. ¿Carbohidratos de noche engordan?
4. Cómo leer el etiquetado frontal (sellos negros)
5. ¿Cuánta agua necesitas al día?
6. Proteína en polvo: ¿la necesitas?
7. Cafeína antes de entrenar: dosis y efecto
8. Azúcar vs. edulcorantes
9. Déficit calórico explicado en 60 s
10. ¿Qué comer antes y después de entrenar?
