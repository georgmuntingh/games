/**
 * The vis-network canvas: nodes, typed edges, and the time gutter drawn underneath.
 *
 * Layout is entirely vis's: hierarchical, top-to-bottom, with each node's `level`
 * derived from its deadline. vis pins a node's y to its level and only moves it in x,
 * so levels stay put while simultaneous tasks spread sideways.
 */

import { DataSet, Network } from 'vis-network/standalone';

const LEVEL_SEPARATION = 96;
/** Below this scale the node titles stop being legible, so `fit` refuses to go lower. */
const MIN_FIT_SCALE = 0.72;
const NODE_WIDTH = 176;
const NODE_HEIGHT = 46;
const GUTTER_PAD = 12;

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
function drawTask(ctx, x, y, { status, title, selected, theme, showHandle }) {
  const left = x - NODE_WIDTH / 2;
  const top = y - NODE_HEIGHT / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.10)';
  ctx.shadowBlur = selected ? 12 : 4;
  ctx.shadowOffsetY = 1;
  roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
  ctx.fillStyle = status.done ? theme.surfaceDone : theme.surface;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, left, top, NODE_WIDTH, NODE_HEIGHT, 8);
  if (status.blocked) ctx.setLineDash([4, 3]);
  ctx.lineWidth = selected ? 2.5 : 1.5;
  ctx.strokeStyle = status.overdue
    ? theme.danger
    : selected
      ? theme.accent
      : status.done
        ? theme.border
        : theme.border;
  ctx.stroke();
  ctx.restore();

  // Progress ring.
  const ringX = left + 20;
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
  const lines = wrap(ctx, title, NODE_WIDTH - (textLeft - left) - 12, 2);
  const lineHeight = 15;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, textLeft, startY + i * lineHeight));
  ctx.restore();

  // Link handle on the selected node.
  if (showHandle) {
    const hx = left + NODE_WIDTH;
    const hy = top + NODE_HEIGHT;
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

export function createGraph(container, handlers = {}) {
  const nodes = new DataSet([]);
  const edges = new DataSet([]);
  let theme = readTheme(container);
  let view = null;
  /** Maps a fractional level to a canvas y, derived from a placed node. */
  let levelToY = null;

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
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          shakeTowards: 'roots',
          levelSeparation: LEVEL_SEPARATION,
          nodeSpacing: 210,
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

  /** Rebuild the level -> y mapping from wherever vis actually placed the nodes. */
  function recomputeLevelScale() {
    if (!view) return;
    const positions = network.getPositions();
    const anchorId = Object.keys(positions)[0];
    if (!anchorId) {
      levelToY = null;
      return;
    }
    const anchorLevel = view.levels.get(anchorId) ?? 0;
    const anchorY = positions[anchorId].y;
    levelToY = (level) => anchorY + (level - anchorLevel) * LEVEL_SEPARATION;
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
    if (!params.nodes.length && !params.edges.length) handlers.onBlankDoubleClick?.();
  });
  network.on('dragEnd', () => recomputeLevelScale());
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
      next.tasks.map((task) => {
        const status = next.statuses.get(task.id);
        return {
          id: task.id,
          level: next.levels.get(task.id) ?? 0,
          title: tooltipFor(task, status),
          ctxRenderer: ({ ctx, x, y, state }) => ({
            drawNode: () =>
              drawTask(ctx, x, y, {
                status,
                title: task.title,
                selected: state.selected || next.selectedId === task.id,
                theme,
                showHandle: next.selectedId === task.id,
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
        dashes: edge.kind === 'part-of' ? [5, 4] : false,
        color: {
          color: edge.conflict ? theme.danger : theme.edge,
          highlight: edge.conflict ? theme.danger : theme.accent,
          hover: theme.accent,
        },
        width: edge.conflict ? 2 : 1.4,
        // `blocks` edges run blocker -> dependent; `part-of` edges run child -> parent,
        // so the two kinds read in opposite directions.
        title: edge.conflict
          ? `Scheduling conflict: ${edge.from} is due after ${edge.to}, which it blocks`
          : edge.kind === 'blocks'
            ? `${edge.to} blocked by ${edge.from}`
            : `${edge.from} part of ${edge.to}`,
      }))
    );

    recomputeLevelScale();
    network.redraw();
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
    stopLinkMode: () => network.disableEditMode(),
    refreshTheme: () => {
      theme = readTheme(container);
      network.redraw();
    },
    destroy: () => network.destroy(),
  };
}
