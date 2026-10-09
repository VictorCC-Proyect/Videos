# Shorts de nutrición: cómo editarlos y publicarlos

Canal: **Come Con Ciencia** (`@comeconciencia`). Si el usuario está ocupado en alguna red, cambia
`shorts/canal.json` y vuelve a generar (ver abajo). Alternativas: `@nutriconciencia`,
`@cienciaentuplato`, `@nutrialoclaro`, `@nutriexplica`.

Formato: vertical 1080×1920, 60–70 s, voz sintética (Piper, español de México), subtítulos grandes.

## Editar y volver a renderizar (Windows, PowerShell)

```powershell
cd Videos\shorts
# 1) Cambia el texto en <short>\guion.json y la animación en <short>\escenas.html
# 2) Voz nueva (solo si cambiaste el guion):
python voz.py C:\ruta\es_MX-claude-high.onnx creatina
# 3) Arma el video y míralo en el navegador (editor HyperFrames Studio):
node generar.mjs creatina
cd creatina
npx hyperframes preview
# 4) Renderiza el MP4:
npx hyperframes render -o renders\creatina.mp4
```

La primera vez, `npx hyperframes browser ensure` descarga el navegador que usa para renderizar.

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

## 2. ¿Por qué te arde el músculo?

**Título YouTube Shorts:** ¿Por qué te ARDE el músculo al entrenar? 🔥 (no es el ácido láctico) #shorts

**Texto TikTok / Reels / Facebook:**
Ese ardor en las últimas repeticiones NO es culpa del ácido láctico 🔥 Te explico qué pasa de verdad
en tu músculo y por qué el lactato es tu aliado.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #acidolactico #gym #fisiologia #entrenamiento #nutriciondeportiva #fitness #ciencia #aprendeentiktok #agujetas #musculo

---

## 3. ¿Cuánta proteína necesitas?

**Título YouTube Shorts:** ¿Cuánta PROTEÍNA necesitas al día? 🍗 Calcúlalo en 10 segundos #shorts

**Texto TikTok / Reels / Facebook:**
¿Cuánta proteína necesitas? Depende de tu peso y de cómo entrenas 💪 Te enseño a calcularla y
cuánto aportan pollo, huevo y frijoles.
Contenido educativo; no sustituye la consulta con un profesional de la salud.

**Hashtags:** #proteina #nutricion #gym #ganarmusculo #perdergrasa #nutriciondeportiva #fitness #dieta #aprendeentiktok #comidasaludable

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
