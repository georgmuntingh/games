/**
 * The vis-network canvas: nodes, typed edges, and the time gutter drawn underneath.
 *
 * Layout is entirely vis's: hierarchical, top-to-bottom, with each node's `level`
 * derived from its deadline. vis pins a node's y to its level and only moves it in x,
 * so levels stay put while simultaneous tasks spread sideways.
 */

import { DataSet, Network } from 'vis-network/standalone';

import { initialsOf } from './model.js';

export const LEVEL_SEPARATION_DEFAULT = 96;
export const LEVEL_SEPARATION_MIN = 40;
export const LEVEL_SEPARATION_MAX = 160;
/** Below this scale the node titles stop being legible, so `fit` refuses to go lower. */
const MIN_FIT_SCALE = 0.72;
const NODE_WIDTH = 176;
const NODE_HEIGHT = 46;
const STRIPE_WIDTH = 4;
const GUTTER_PAD = 12;
/** The ▶ that marks the task in hand, and the room it takes from the title. */
const BADGE_WIDTH = 11;
/** Initial discs along the bottom-right: how big, how many, and how far from the edge. */
const DISC_RADIUS = 7.5;
const DISC_GAP = 3;
const DISC_INSET = 7;
const MAX_DISCS = 3;

/** Pull the live theme values so the canvas follows light/dark like the rest of the page. */
function readTheme(element) {
  const css = getComputedStyle(element);
  const value = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    fg: value('--ui-fg', '#1a1a1a'),
    muted: value('--ui-muted', '#6b7280'),
    border: value('--ui-border', '#e5e7eb'),
    accent: value('--ui-accent', '#2563eb'),
    surface: value('--task-surface', '#ffffff'),
    surfaceDone: value('--task-surface-done', '#f1f2f4'),
    danger: value('--task-danger', '#dc2626'),
    grid: value('--task-grid', 'rgba(128,128,128,0.16)'),
    preview: value('--task-preview', 'rgba(37,99,235,0.10)'),
    working: value('--task-working', 'rgba(217,119,6,0.16)'),
    workingInk: value('--task-working-ink', '#b45309'),
    // Saturation and lightness for the initial discs; the hue comes from the name.
    disc: value('--task-disc', '52% 45%'),
    edge: value('--task-edge', '#9aa3b2'),
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Break `text` to at most `maxLines` lines of `maxWidth`, ellipsising the overflow. */
function wrap(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    const consumed = lines.join(' ').split(/\s+/).length;
    if (consumed < words.length) {
      while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

/**
 * A node is a rounded card: a progress ring, the title, and nothing else. Status is
 * carried by the border — red for overdue, dashed for blocked, muted when done.
 */
/**
 * A stripe down the node's left edge, one band per coloured project the task belongs
 * to. Its value is the multi-project case: a task on this board that also belongs to
 * another project shows two bands, and says so at a glance.
 */
function drawStripe(ctx, left, top, colors) {
  if (!colors.length) return;
  const height = NODE_HEIGHT / colors.length;
  ctx.save();
  roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
  ctx.clip();
  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(left, top + index * height, STRIPE_WIDTH, height);
  });
  ctx.restore();
}

/**
 * Hues for the initial discs. A curated set rather than the whole wheel: hue is
 * perceptually lumpy — greens sprawl, oranges crowd — so hashing a name to any of 360
 * degrees puts two people in near-identical colours often enough to defeat the point of
 * colouring them at all. Eight well-separated hues collide sometimes and are always
 * telling apart, which is the better trade on a 15px disc.
 */
const DISC_HUES = [210, 152, 25, 275, 335, 190, 95, 45];

/** A stable hue per name: the same person is the same colour on every card, every reload. */
function hueOf(name) {
  let hash = 0;
  for (const ch of String(name)) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return DISC_HUES[hash % DISC_HUES.length];
}

/** How much width `drawPeople` will want, so the title can be wrapped clear of it. */
function discsWidth(count) {
  const shown = Math.min(count, MAX_DISCS) + (count > MAX_DISCS ? 1 : 0);
  if (!shown) return 0;
  return shown * DISC_RADIUS * 2 + (shown - 1) * DISC_GAP + DISC_INSET;
}

/**
 * Who holds the card: one initial disc per person along the bottom-right, coloured from
 * the name so nobody needs a colour stored for them. Past three, the rest become a `+n`.
 */
function drawPeople(ctx, left, top, people, theme) {
  if (!people?.length) return;
  const shown = people.slice(0, MAX_DISCS);
  const overflow = people.length - shown.length;
  const discs = [
    ...shown.map((name) => ({ text: initialsOf(name), hue: hueOf(name), title: name })),
    ...(overflow ? [{ text: `+${overflow}`, hue: null }] : []),
  ];

  const step = DISC_RADIUS * 2 + DISC_GAP;
  const right = left + NODE_WIDTH - DISC_INSET;
  const cy = top + NODE_HEIGHT - DISC_RADIUS - 4;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  discs.forEach((disc, index) => {
    const cx = right - DISC_RADIUS - (discs.length - 1 - index) * step;
    ctx.beginPath();
    ctx.arc(cx, cy, DISC_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = disc.hue == null ? theme.muted : `hsl(${disc.hue} ${theme.disc})`;
    ctx.fill();
    ctx.fillStyle = theme.surface;
    ctx.font = `600 ${disc.text.length > 1 ? 8 : 9}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.fillText(disc.text, cx, cy + 0.5);
  });
  ctx.restore();
}

function drawTask(
  ctx,
  x,
  y,
  { status, title, people, selected, theme, showHandle, colors, dropTarget, dragging }
) {
  const left = x - NODE_WIDTH / 2;
  const top = y - NODE_HEIGHT / 2;

  ctx.save();
  // The task being dragged fades; the card it would merge into lights up.
  if (dragging) ctx.globalAlpha = 0.45;
  ctx.shadowColor = 'rgba(0,0,0,0.10)';
  ctx.shadowBlur = selected || dropTarget ? 12 : 4;
  ctx.shadowOffsetY = 1;
  roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
  ctx.fillStyle = status.done ? theme.surfaceDone : theme.surface;
  ctx.fill();
  // The task in hand is tinted rather than outlined, leaving the border free to go on
  // saying overdue, blocked or selected.
  if (status.working) {
    ctx.fillStyle = theme.working;
    ctx.fill();
  }
  ctx.restore();

  drawStripe(ctx, left, top, colors ?? []);

  ctx.save();
  roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
  if (status.blocked && !dropTarget) ctx.setLineDash([4, 3]);
  ctx.lineWidth = dropTarget ? 3.5 : selected ? 2.5 : 1.5;
  ctx.strokeStyle =
    dropTarget || selected ? theme.accent : status.overdue ? theme.danger : theme.border;
  ctx.stroke();
  ctx.restore();

  if (dropTarget) {
    // On its own chip: edges run into the top of the card, and bare text on top of an
    // arrowhead is unreadable exactly when it matters.
    ctx.save();
    ctx.font = '600 10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    const label = 'add as subtask';
    const width = ctx.measureText(label).width + 12;
    // Below and to the left: edges enter at the top centre and leave at the bottom
    // centre, and the link handle owns the bottom right.
    const chipLeft = left;
    const chipTop = top + NODE_HEIGHT + 3;
    roundRect(ctx, chipLeft, chipTop, width, 15, 7);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.fillStyle = theme.surface;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, chipLeft + width / 2, chipTop + 8);
    ctx.restore();
  }

  // The ▶ marking the task in hand, ahead of the progress ring.
  const badge = status.working ? BADGE_WIDTH : 0;
  if (status.working) {
    const bx = left + STRIPE_WIDTH + 6;
    ctx.save();
    ctx.fillStyle = theme.workingInk;
    ctx.beginPath();
    ctx.moveTo(bx, y - 5);
    ctx.lineTo(bx + 7, y);
    ctx.lineTo(bx, y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Progress ring.
  const ringX = left + STRIPE_WIDTH + 18 + badge;
  const ringY = y;
  const radius = 9;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = theme.border;
  ctx.beginPath();
  ctx.arc(ringX, ringY, radius, 0, Math.PI * 2);
  ctx.stroke();
  if (status.ratio > 0) {
    ctx.strokeStyle = status.done ? theme.muted : status.overdue ? theme.danger : theme.accent;
    ctx.beginPath();
    ctx.arc(ringX, ringY, radius, -Math.PI / 2, -Math.PI / 2 + status.ratio * Math.PI * 2);
    ctx.stroke();
  }
  if (status.done) {
    ctx.strokeStyle = theme.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ringX - 4, ringY);
    ctx.lineTo(ringX - 1, ringY + 3.5);
    ctx.lineTo(ringX + 4.5, ringY - 3);
    ctx.stroke();
  }
  ctx.restore();

  // Title.
  ctx.save();
  ctx.font = '500 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillStyle = status.done ? theme.muted : theme.fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textLeft = ringX + radius + 9;
  const lines = wrap(
    ctx,
    title,
    NODE_WIDTH - (textLeft - left) - 12 - discsWidth(people?.length ?? 0),
    2
  );
  const lineHeight = 15;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, textLeft, startY + i * lineHeight));
  ctx.restore();

  drawPeople(ctx, left, top, people, theme);

  // Link handle on the selected node, on the right edge rather than the bottom-right
  // corner, which now belongs to the discs.
  if (showHandle) {
    const hx = left + NODE_WIDTH;
    const hy = y;
    ctx.save();
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.strokeStyle = theme.surface;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = theme.surface;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', hx, hy + 0.5);
    ctx.restore();
  }
}

export function createGraph(container, handlers = {}, options = {}) {
  const nodes = new DataSet([]);
  const edges = new DataSet([]);
  let theme = readTheme(container);
  let view = null;
  let levelSeparation = options.levelSeparation ?? LEVEL_SEPARATION_DEFAULT;
  /**
   * With auto-layout on, vis owns every card's x and re-packs the board on each edit.
   * With it off, the board owns x and vis is told where each card goes.
   */
  let autoLayout = options.autoLayout ?? true;
  /** The last x vis reported per card, so one with none stored keeps its place. */
  const lastX = new Map();
  /**
   * The canvas y that level 0 sits at once we are placing cards ourselves. Captured from
   * the mapping it replaces, so turning auto-layout off holds the board still instead of
   * shifting every card to a new origin.
   */
  let manualOriginY = 0;
  /** Maps a fractional level to a canvas y, derived from a placed node, and back. */
  let levelToY = null;
  let yToLevel = null;
  /** The task under the cursor mid-drag, which the dragged task would merge into. */
  let draggedId = null;
  let dropTargetId = null;
  /** Where inside the card the drag began, so the drop maps to the card's centre. */
  let grabOffsetX = 0;
  let grabOffsetY = 0;
  /** The live pointer mid-drag, which the drop preview is drawn from. */
  let dragPointer = null;

  const network = new Network(
    container,
    { nodes, edges },
    {
      autoResize: true,
      physics: { enabled: false },
      interaction: { hover: true, tooltipDelay: 220, navigationButtons: false, keyboard: false },
      layout: {
        randomSeed: 7,
        hierarchical: {
          enabled: autoLayout,
          direction: 'UD',
          sortMethod: 'directed',
          shakeTowards: 'roots',
          levelSeparation,
          nodeSpacing: NODE_WIDTH + 84,
          treeSpacing: 140,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
        },
      },
      nodes: { shape: 'custom', shadow: false },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 0.55, type: 'arrow' } },
        smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.5 },
        width: 1.4,
        selectionWidth: 0.6,
      },
      manipulation: {
        enabled: false,
        addEdge: (data, callback) => {
          callback(null); // never let vis add the edge itself; the model owns the data
          if (data.from !== data.to) handlers.onLink?.(data.from, data.to);
        },
      },
    }
  );

  /* ---- the time gutter, drawn under the nodes in canvas coordinates ---- */

  network.on('beforeDrawing', (ctx) => {
    if (!view || !levelToY) return;
    const topLeft = network.DOMtoCanvas({ x: 0, y: 0 });
    const bottomRight = network.DOMtoCanvas({
      x: container.clientWidth,
      y: container.clientHeight,
    });
    const labelX = topLeft.x + GUTTER_PAD;

    const previewLevel = previewRow();
    if (previewLevel != null) {
      ctx.save();
      ctx.fillStyle = theme.preview;
      ctx.fillRect(
        topLeft.x,
        levelToY(previewLevel) - levelSeparation / 2,
        bottomRight.x - topLeft.x,
        levelSeparation
      );
      ctx.restore();
    }

    ctx.save();
    ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    for (const level of view.gutter) {
      const y = levelToY(level.level);
      if (y < topLeft.y - 40 || y > bottomRight.y + 40) continue;
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(topLeft.x, y);
      ctx.lineTo(bottomRight.x, y);
      ctx.stroke();
      ctx.fillStyle = theme.muted;
      ctx.fillText(level.label, labelX, y - 10);
    }

    // A collapsed stretch still has to read as elapsed time, so it gets a labelled break
    // rather than silently vanishing.
    for (const gap of view.gaps ?? []) {
      const y = levelToY(gap.afterLevel + 0.5);
      if (y < topLeft.y - 40 || y > bottomRight.y + 40) continue;
      ctx.save();
      ctx.strokeStyle = theme.border;
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(topLeft.x, y);
      ctx.lineTo(bottomRight.x, y);
      ctx.stroke();
      ctx.restore();
      const unit = view.bucket?.unit ?? 'period';
      ctx.fillStyle = theme.muted;
      ctx.fillText(
        `⋯ ${gap.periods} ${unit}${gap.periods === 1 ? '' : 's'} with nothing due`,
        labelX,
        y - 9
      );
    }

    if (view.nowLevel != null) {
      const y = levelToY(view.nowLevel);
      ctx.strokeStyle = theme.danger;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(topLeft.x, y);
      ctx.lineTo(bottomRight.x, y);
      ctx.stroke();
      ctx.fillStyle = theme.danger;
      ctx.font = '600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText('now', labelX, y - 9);
    }
    ctx.restore();
  });

  /**
   * A dashed card on the row a release would land on, labelled with the date it would
   * take. vis re-runs the layout on drop, so the row is the only part of the landing that
   * can be promised: the ghost snaps in y and merely follows the cursor in x.
   */
  network.on('afterDrawing', (ctx) => {
    const row = previewRow();
    if (row == null) return;
    const task = view.tasks.find((t) => t.id === draggedId);
    const left = dragPointer.x - grabOffsetX - NODE_WIDTH / 2;
    const centreY = levelToY(row);
    const top = centreY - NODE_HEIGHT / 2;

    ctx.save();
    roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
    ctx.fillStyle = theme.preview;
    ctx.fill();
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.accent;
    ctx.stroke();
    ctx.restore();

    if (task) {
      ctx.save();
      ctx.font = '500 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillStyle = theme.muted;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const lines = wrap(ctx, task.title, NODE_WIDTH - 24, 2);
      const lineHeight = 15;
      const startY = centreY - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => ctx.fillText(line, left + 12, startY + i * lineHeight));
      ctx.restore();
    }

    // The date the row stands for, worded by the caller so this file stays out of the
    // calendar. Beside the ghost rather than inside it: the title is already in there.
    const label = handlers.dropLabel?.(row);
    if (!label) return;
    ctx.save();
    ctx.font = '600 11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    const width = ctx.measureText(label).width + 14;
    const pillLeft = left + NODE_WIDTH + 8;
    roundRect(ctx, pillLeft, centreY - 9, width, 18, 9);
    ctx.fillStyle = theme.accent;
    ctx.fill();
    ctx.fillStyle = theme.surface;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pillLeft + width / 2, centreY + 0.5);
    ctx.restore();
  });

  /** Rebuild the level -> y mapping from wherever vis actually placed the nodes. */
  function recomputeLevelScale() {
    if (!view) return;
    const positions = network.getPositions();
    for (const [id, position] of Object.entries(positions)) lastX.set(id, position.x);

    // Off auto-layout the nodes are placed by `render` from the board's own data, so the
    // scale is a statement rather than something to infer from where vis put an anchor.
    if (!autoLayout) {
      levelToY = (level) => manualOriginY + level * levelSeparation;
      yToLevel = (canvasY) => (canvasY - manualOriginY) / levelSeparation;
      return;
    }

    const anchorId = Object.keys(positions)[0];
    if (!anchorId) {
      levelToY = null;
      return;
    }
    const anchorLevel = view.levels.get(anchorId) ?? 0;
    const anchorY = positions[anchorId].y;
    levelToY = (level) => anchorY + (level - anchorLevel) * levelSeparation;
    yToLevel = (y) => anchorLevel + (y - anchorY) / levelSeparation;
  }

  /**
   * The row a release right now would drop the dragged card on, or null when there is
   * nothing to preview. Rounded and clamped exactly as `dragEnd` rounds and clamps what it
   * hands to `onReschedule`, so the preview cannot promise a row the drop will not honour.
   * Merging wins outright: a card over another card is not being rescheduled.
   */
  function previewRow() {
    if (!draggedId || dropTargetId || !dragPointer || !yToLevel || !view) return null;
    const level = yToLevel(dragPointer.y - grabOffsetY);
    return Math.min(view.trayLevel, Math.max(0, Math.round(level)));
  }

  /** The node whose card contains `point`, ignoring the one being dragged. */
  function nodeAt(point, exceptId) {
    const positions = network.getPositions();
    for (const [id, position] of Object.entries(positions)) {
      if (id === exceptId) continue;
      if (
        Math.abs(point.x - position.x) <= NODE_WIDTH / 2 &&
        Math.abs(point.y - position.y) <= NODE_HEIGHT / 2
      ) {
        return id;
      }
    }
    return null;
  }

  network.on('click', (params) => {
    if (params.nodes.length) {
      const nodeId = params.nodes[0];
      if (view?.selectedId === nodeId && isOnHandle(params.pointer.canvas, nodeId)) {
        network.addEdgeMode();
        handlers.onLinkModeChange?.(true);
        return;
      }
      handlers.onSelect?.(nodeId);
    } else if (params.edges.length) {
      handlers.onSelectEdge?.(params.edges[0]);
    } else {
      handlers.onSelect?.(null);
      handlers.onBlankClick?.(params.pointer.canvas);
    }
  });
  network.on('doubleClick', (params) => {
    if (!params.nodes.length && !params.edges.length) {
      handlers.onBlankDoubleClick?.(pointOf(params.pointer));
    }
  });

  /**
   * Where a click landed, in the terms the board thinks in: which row, and which x. The
   * row comes from the same `yToLevel` the drop uses, so a menu, a drag and the gutter
   * cannot disagree about what a point on the canvas means.
   */
  function pointOf(pointer) {
    return {
      level: yToLevel ? yToLevel(pointer.canvas.y) : null,
      x: Math.round(pointer.canvas.x),
    };
  }

  network.on('oncontext', (params) => {
    params.event.preventDefault();
    const dom = params.pointer.DOM;
    const nodeId = network.getNodeAt(dom);
    const edgeId = nodeId == null ? network.getEdgeAt(dom) : null;
    handlers.onContext?.({
      kind: nodeId != null ? 'node' : edgeId != null ? 'edge' : 'canvas',
      id: nodeId ?? edgeId ?? null,
      ...pointOf(params.pointer),
      client: { x: params.event.clientX, y: params.event.clientY },
    });
  });
  network.on('dragStart', (params) => {
    draggedId = params.nodes.length === 1 ? params.nodes[0] : null;
    dropTargetId = null;
    // vis re-applies the hierarchical layout on drop, so the node's position at
    // `dragEnd` is where it snapped back to, not where it was released. The pointer is
    // the only honest record of the drop — offset by wherever the card was grabbed.
    const position = draggedId ? network.getPositions([draggedId])[draggedId] : null;
    grabOffsetX = position ? params.pointer.canvas.x - position.x : 0;
    grabOffsetY = position ? params.pointer.canvas.y - position.y : 0;
    dragPointer = params.pointer.canvas;
  });

  network.on('dragging', (params) => {
    if (!draggedId) return;
    // Dragging a node repaints every frame, so recording the pointer is enough to make
    // the preview track the cursor; the redraw below is only for the merge highlight.
    dragPointer = params.pointer.canvas;
    const next = nodeAt(params.pointer.canvas, draggedId);
    if (next === dropTargetId) return;
    dropTargetId = next;
    network.redraw();
  });

  network.on('dragEnd', (params) => {
    const dragged = draggedId;
    const target = dropTargetId;
    draggedId = null;
    dropTargetId = null;
    dragPointer = null;
    if (!dragged) {
      recomputeLevelScale();
      return;
    }
    if (target) {
      handlers.onMerge?.(dragged, target);
      return;
    }
    const centreY = params.pointer.canvas.y - grabOffsetY;
    if (!yToLevel) {
      recomputeLevelScale();
      return;
    }
    handlers.onReschedule?.(
      dragged,
      yToLevel(centreY),
      autoLayout ? null : Math.round(params.pointer.canvas.x - grabOffsetX)
    );
  });
  network.on('stabilized', () => recomputeLevelScale());

  function isOnHandle(pointer, nodeId) {
    const position = network.getPositions([nodeId])[nodeId];
    if (!position) return false;
    const hx = position.x + NODE_WIDTH / 2;
    const hy = position.y + NODE_HEIGHT / 2;
    return Math.hypot(pointer.x - hx, pointer.y - hy) <= 12;
  }

  function tooltipFor(task, status) {
    const el = document.createElement('div');
    el.className = 'task-tip';
    const row = (label, value) => {
      if (!value) return;
      const line = document.createElement('div');
      const strong = document.createElement('span');
      strong.className = 'task-tip-label';
      strong.textContent = `${label} `;
      line.append(strong, document.createTextNode(value));
      el.append(line);
    };
    const heading = document.createElement('div');
    heading.className = 'task-tip-title';
    heading.textContent = task.title;
    el.append(heading);
    row('due', task.due || 'unscheduled');
    row('estimate', task.estimate);
    row('people', (task.people ?? []).join(', '));
    row('projects', (task.project ?? []).join(', '));
    if (status.total) row('subtasks', `${status.checked} of ${status.total} done`);
    if (status.blocked) row('blocked by', status.blockers.join(', '));
    if (status.overdue) row('status', 'overdue');
    return el;
  }

  /** Replace the whole canvas contents from a prepared view model. */
  function render(next) {
    view = next;
    theme = readTheme(container);

    nodes.clear();
    edges.clear();
    nodes.add(
      next.tasks.map((task, index) => {
        const status = next.statuses.get(task.id);
        const level = next.levels.get(task.id) ?? 0;
        return {
          id: task.id,
          level,
          // Off auto-layout, every card is placed outright: x from the board, y from the
          // deadline, so a frozen arrangement is reproduced exactly on every render.
          ...(autoLayout ? {} : { x: manualX(task, index), y: yForLevel(level) }),
          title: tooltipFor(task, status),
          ctxRenderer: ({ ctx, x, y, state }) => ({
            drawNode: () =>
              drawTask(ctx, x, y, {
                status,
                title: task.title,
                people: task.people ?? [],
                selected: state.selected || next.selectedId === task.id,
                theme,
                showHandle: next.selectedId === task.id,
                colors: next.projectColors.get(task.id) ?? [],
                dropTarget: dropTargetId === task.id,
                dragging: draggedId === task.id,
              }),
            nodeDimensions: { width: NODE_WIDTH, height: NODE_HEIGHT },
          }),
        };
      })
    );
    edges.add(
      next.edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        color: {
          color: edge.conflict
            ? theme.danger
            : next.selectedEdgeId === edge.id
              ? theme.accent
              : theme.edge,
          highlight: edge.conflict ? theme.danger : theme.accent,
          hover: theme.accent,
        },
        width: next.selectedEdgeId === edge.id ? 3 : edge.conflict ? 2 : 1.4,
        // Goal links are computed rather than stored, so they read as an implication
        // rather than a constraint you drew.
        dashes: edge.kind === 'part-of' ? [5, 4] : edge.kind === 'goal' ? [2, 4] : false,
        // `blocks` edges run blocker -> dependent; `part-of` edges run child -> parent,
        // so the two kinds read in opposite directions.
        title: edge.conflict
          ? `Scheduling conflict: ${edge.from} is due after ${edge.to}, which it blocks`
          : edge.kind === 'blocks'
            ? `${edge.to} blocked by ${edge.from}`
            : edge.kind === 'goal'
              ? `${edge.from} feeds the project goal`
              : `${edge.from} part of ${edge.to}`,
      }))
    );

    recomputeLevelScale();
    network.redraw();
  }

  /**
   * Where a card sits when the layout is not deciding: what its file says, else wherever
   * it last was, else spread across a band so a new one never hides behind another.
   */
  /** Canvas y for a level, usable before vis has placed anything to measure. */
  function yForLevel(level) {
    return levelToY ? levelToY(level) : manualOriginY + level * levelSeparation;
  }

  function manualX(task, index) {
    if (task.x != null) return task.x;
    const remembered = lastX.get(task.id);
    if (remembered != null) return remembered;
    return ((index % 6) - 2.5) * (NODE_WIDTH + 24);
  }

  /**
   * Fit the graph, but never below the legibility floor. A long project is mostly
   * empty weeks, so when fitting would shrink it too far we hold the scale and centre
   * on the now-line (or the top of the graph) instead.
   */
  function fit(animate = true) {
    const animation = animate ? { duration: 300 } : false;
    network.fit({ animation: false });
    if (network.getScale() >= MIN_FIT_SCALE) {
      if (animate) network.fit({ animation });
      return;
    }
    const positions = Object.values(network.getPositions());
    if (!positions.length) return;
    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const halfHeight = container.clientHeight / 2 / MIN_FIT_SCALE;
    const wanted =
      view?.nowLevel != null && levelToY ? levelToY(view.nowLevel) : Math.min(...ys);
    // Centre on the now-line, but never scroll past either end of the timeline.
    const top = Math.min(...ys) - NODE_HEIGHT;
    const bottom = Math.max(...ys) + NODE_HEIGHT;
    const focusY =
      bottom - top <= halfHeight * 2
        ? (top + bottom) / 2
        : Math.min(Math.max(wanted, top + halfHeight), bottom - halfHeight);
    network.moveTo({ position: { x: centreX, y: focusY }, scale: MIN_FIT_SCALE, animation });
  }

  return {
    render,
    fit,
    focus: (id) => network.focus(id, { scale: 1, animation: { duration: 300 } }),
    startLinkMode: () => network.addEdgeMode(),
    /** Where every card currently is, so the board can record an arrangement it likes. */
    positions: () => network.getPositions(),
    setAutoLayout: (enabled) => {
      // Inherit the origin the layout was using, so the cards do not jump on the way out
      // of auto-layout — the arrangement being frozen is the one on screen.
      if (!enabled && levelToY) manualOriginY = levelToY(0);
      autoLayout = enabled;
      // Row height may have been changed while the layout was ours, so restate it here.
      network.setOptions({ layout: { hierarchical: { enabled, levelSeparation } } });
      recomputeLevelScale();
    },
    setLevelSeparation: (px) => {
      levelSeparation = Math.min(LEVEL_SEPARATION_MAX, Math.max(LEVEL_SEPARATION_MIN, px));
      // `enabled` goes with every hierarchical change: handed a bare options object, vis
      // switches the layout back on, which off auto-layout would take the board back
      // without being asked.
      network.setOptions({ layout: { hierarchical: { enabled: autoLayout, levelSeparation } } });
      recomputeLevelScale();
      network.redraw();
      return levelSeparation;
    },
    stopLinkMode: () => network.disableEditMode(),
    refreshTheme: () => {
      theme = readTheme(container);
      network.redraw();
    },
    destroy: () => network.destroy(),
  };
}
