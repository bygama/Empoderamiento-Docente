-- Dos fotos del Equipo que cambian de archivo en public/equipo/ (pedido de
-- Gastón el 30 de septiembre de 2026). La url de cada una no cambia: acá van
-- las medidas que la fila de `fotos` guarda de su archivo y, en Karla, el foco.
--
-- Karla Gómez Osalde: vuelve la foto de marzo. La de julio de 2026 que entró
-- con 20260930184734_correcciones_del_equipo sale, y con ella las medidas y el
-- foco que esa migración le puso; vuelven los de 20260927081656_equipo y
-- 20260927081756_fotos_del_equipo, que son los de este archivo.
-- Iván Pérez: una foto nueva, recortada abajo para sacarle el borde blanco de
-- la captura. El encuadre es el de la anterior, así que el foco no se toca.
--
-- Se puede correr más de una vez: cada UPDATE deja el mismo estado.

-- ── Karla Gómez Osalde ─────────────────────────────────────────────────────
UPDATE fotos SET ancho = 581, alto = 1032, bytes = 72322 WHERE url = '/equipo/karla-gomez.jpg';

UPDATE equipo
SET foto = jsonb_set(foto, '{foco}', '{"x": 0.5, "y": 0.16}'::jsonb),
    figura = jsonb_set(figura, '{foto,foco}', '{"x": 0.5, "y": 0.16}'::jsonb)
WHERE slug = 'karla-gomez';

-- ── Iván Pérez ─────────────────────────────────────────────────────────────
UPDATE fotos SET ancho = 1086, alto = 1368, bytes = 153747 WHERE url = '/equipo/ivan-perez.jpg';
