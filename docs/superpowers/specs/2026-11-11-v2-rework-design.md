# Advanced Netherite (Port) — Rework V2.0.0 (diseño)

Decisiones tomadas con el autor el 2026-11-11.

## Objetivo
Reescritura completa con foco en **rendimiento** y **arquitectura limpia**, con **paridad de comportamiento** con 1.4.0 (sin funcionalidades nuevas salvo el toggle del conversor).

## Requisitos fijos
- `@minecraft/server` **2.11.0** (estable). `@minecraft/server-ui` **2.3.0** (última estable).
- `min_engine_version` **[1, 26, 60]**. Recursos de referencia: `C:\Users\tobim\Lilium Studio\MC Bedrock Recursos` (samples v1.26.60.5, API 2.11.0, vanilla-data 1.26.60).
- Código en **TypeScript**, compilado con **dash (bridge)** (plugin `typeScript` ya activo en `config.json`).
- Tests de lógica pura con **Vitest**.
- Versión del pack **2.0.0**. **UUIDs de manifiesto sin cambios.** **IDs de items sin cambios.**
- Trabajo en la rama **`rework/v2`**. Los cambios sin commitear de 1.4.x (barra de armadura) se **descartan**.

## Mundos 1.4.x → 2.0.0: migrar todo
1. Config global (`lsan:config` en el mundo, JSON plano sin versión) → esquema versionado v2.
2. Config por jugador (`lsan:config` en el jugador) → esquema v2, al entrar cada jugador. Si la config global v1 tenía `showTooltips`, pasa a ser el valor por defecto de los jugadores sin config propia.
3. Tags y propiedades del jugador: `lsan:received_config_item` (tag) → dynamic property; los tags de inmunidad se recalculan.
4. Items del inventario: el lore y la propiedad `lsan:lore` se reescriben al formato v2.

## Comportamiento por sistema
- **Protecciones de armadura:** mismos tags (`lsan:phantom_immune`, `lsan:piglin_immune`, `lsan:enderman_immune`), que usan las entidades del BP.
- **Drops extra:** las mismas tablas y probabilidades de 1.4.0.
- **Lore:** las mismas ventajas y claves de traducción; se actualiza por eventos, sin el escaneo cada 100 ticks.
- **Conversor netherite vanilla → lsan:** por evento, incluye la mano secundaria, conserva el lore y las dynamic properties, y se puede desactivar desde la config (`enableNetheriteConversion`, por defecto `true`).
- **Barra de armadura:** se mantiene y se mejora. El formato del payload sigue siendo el que lee la UI del RP. No usa el comando global `times 0 0 0`, se reenvía al salir de creativo o espectador y evita los envíos redundantes.
- **Durabilidad:** si el motor 1.26.60 ya gasta los items custom, se elimina el sistema manual. Si no, se conserva solo para los casos que el motor no cubre, sin contar Unbreaking dos veces.
- **Detección:** primero por eventos, con un scheduler central de baja frecuencia (round-robin de jugadores) como respaldo.
- **JSON:** se suben todos los `format_version` a los actuales de los samples 1.26.60. Se mantiene el subpack Actions & Stuff.
