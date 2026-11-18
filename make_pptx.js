const PptxGenJS = require('pptxgenjs');
const prs = new PptxGenJS();

// ─── Global Design Tokens ───────────────────────────────────────────
const BG        = 'F3EFE5';   // warm cream background
const RUST      = 'B65332';   // rust/terracotta accent
const DARK      = '202725';   // near-black text
const TEAL      = '315D58';   // teal accent for lines / footer
const GREY      = '66706B';   // muted text
const WHITE     = 'FEFEFE';   // near-white

const FONT_TITLE  = 'Libre Baskerville';
const FONT_MONO   = 'IBM Plex Mono';
const FONT_BODY   = 'Calibri';

prs.layout  = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
prs.author  = 'Aashutosh Singh Parihar & C. Sai Vishwak Raju';
prs.company = 'Faculty of Technology, University of Delhi';
prs.subject = 'ADA Project Presentation';
prs.title   = 'Power Grid Failure Recovery Simulator';

// ─── Helper: add a standard slide with rust vertical bar + heading ──
function addSlide(slideNum, totalSlides, heading, fillFn) {
  const sld = prs.addSlide();

  // cream background
  sld.background = { color: BG };

  // rust vertical left bar
  sld.addShape('rect', {
    x: 0, y: 0, w: 0.12, h: '100%',
    fill: { color: RUST },
    line: { color: RUST }
  });

  // teal bottom bar
  sld.addShape('rect', {
    x: 0, y: 6.95, w: '100%', h: 0.1,
    fill: { color: TEAL },
    line: { color: TEAL }
  });

  // slide number badge
  sld.addText(`${slideNum.toString().padStart(2, '0')}`, {
    x: 11.9, y: 0.18, w: 1.3, h: 0.55,
    fontSize: 32, bold: true,
    color: RUST,
    fontFace: FONT_TITLE,
    align: 'right'
  });

  // heading text
  sld.addText(heading, {
    x: 0.3, y: 0.65, w: 11.5, h: 0.5,
    fontSize: 22, bold: true,
    color: DARK,
    fontFace: FONT_TITLE
  });

  // heading underline
  sld.addShape('rect', {
    x: 0.3, y: 1.22, w: 12.9, h: 0.03,
    fill: { color: TEAL },
    line: { color: TEAL }
  });

  // footer
  sld.addText(
    `Faculty of Technology, University of Delhi  ·  ADA-301  ·  Slide ${slideNum} of ${totalSlides}`,
    {
      x: 0.3, y: 7.1, w: 12.9, h: 0.28,
      fontSize: 7, color: GREY, fontFace: FONT_MONO, align: 'left'
    }
  );

  fillFn(sld);
  return sld;
}

// ─── Helper: bullet rows ────────────────────────────────────────────
function bullets(sld, items, opts = {}) {
  const defaults = {
    x: 0.35, y: 1.4, w: 12.85, h: 5.3,
    fontSize: 12,
    color: DARK,
    fontFace: FONT_BODY,
    bullet: { type: 'bullet' },
    paraSpaceAfter: 4,
    paraSpaceBefore: 2,
    breakLine: true,
    valign: 'top',
    isTextBox: true,
    wrap: true
  };
  sld.addText(items, Object.assign(defaults, opts));
}

// ─── Helper: table ──────────────────────────────────────────────────
function table(sld, rows, colW, y = 1.38, h = null) {
  const tOpts = {
    x: 0.35, y, w: 12.9,
    colW,
    border: { pt: 0.5, color: 'C9C2B4' },
    fill: { color: BG },
    fontSize: 9.5,
    fontFace: FONT_BODY,
    color: DARK,
    valign: 'middle',
    align: 'left',
    autoPage: true
  };
  if (h) tOpts.h = h;
  sld.addTable(rows, tOpts);
}

const TOTAL = 12;

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title Slide (custom layout, no heading bar)
// ═══════════════════════════════════════════════════════════════════════
{
  const sld = prs.addSlide();
  sld.background = { color: BG };

  // right panel (image placeholder – teal box)
  sld.addShape('rect', {
    x: 7.0, y: 0, w: 6.33, h: 7.5,
    fill: { color: TEAL },
    line: { color: TEAL }
  });

  // vertical rust bar
  sld.addShape('rect', {
    x: 0, y: 0, w: 0.12, h: '100%',
    fill: { color: RUST }, line: { color: RUST }
  });

  // course tag
  sld.addText('ANALYSIS & DESIGN OF ALGORITHMS  ·  ADA-301  ·  2026–2027', {
    x: 0.35, y: 0.72, w: 6.5, h: 0.3,
    fontSize: 9, bold: true, color: RUST,
    fontFace: FONT_MONO, charSpacing: 1.5
  });

  // main title
  sld.addText('The Power Grid\nFailure Recovery\nSimulator', {
    x: 0.35, y: 1.1, w: 6.5, h: 2.8,
    fontSize: 36, bold: true,
    color: DARK, fontFace: FONT_TITLE,
    lineSpacingMultiple: 1.1
  });

  // subtitle
  sld.addText('An Algorithmic Graph Theory & Priority-Driven SCADA Simulation System', {
    x: 0.35, y: 3.95, w: 6.5, h: 0.65,
    fontSize: 11.5, color: GREY, fontFace: FONT_BODY, italic: false
  });

  // divider
  sld.addShape('rect', {
    x: 0.35, y: 4.72, w: 6.5, h: 0.025,
    fill: { color: RUST }, line: { color: RUST }
  });

  // authors
  sld.addText(
    'Aashutosh Singh Parihar  (25293916003)\nC. Sai Vishwak Raju  (25293916027)\nB.Tech CSE B2  ·  3rd Semester',
    {
      x: 0.35, y: 4.82, w: 6.5, h: 0.9,
      fontSize: 11, bold: false, color: DARK, fontFace: FONT_BODY,
      lineSpacingMultiple: 1.4
    }
  );

  // supervisor
  sld.addText('Supervisor: Dr. Juhi Jain', {
    x: 0.35, y: 5.78, w: 6.5, h: 0.3,
    fontSize: 10, color: TEAL, fontFace: FONT_MONO, bold: true
  });

  // footer bar on right panel
  sld.addText('UNIVERSITY PROJECT  /  ADA  /  2026', {
    x: 7.1, y: 6.95, w: 6.1, h: 0.4,
    fontSize: 8, color: 'FFFAF0', fontFace: FONT_MONO, align: 'center'
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 2 — Problem Statement
// ═══════════════════════════════════════════════════════════════════════
addSlide(2, TOTAL, 'Problem Statement & Real-World Motivation', sld => {
  // tag line
  sld.addText('When the grid fragments, every second without a viable bypass compounds the outage.', {
    x: 0.35, y: 1.33, w: 12.85, h: 0.35,
    fontSize: 11.5, italic: true, color: TEAL, fontFace: FONT_BODY
  });

  // body text
  const body = [
    { text: 'THE PROBLEM', options: { bold: true, color: RUST, fontSize: 11, fontFace: FONT_MONO } },
    { text: '\n', options: {} },
    { text: 'Modern power grids are large-scale interconnected meshes. Sudden cable cuts, transformer explosions, and extreme weather events isolate critical loads. Manual rerouting is intractable in real time — especially during cascading, multi-component failures.\n\n', options: { fontSize: 11.5, color: DARK, fontFace: FONT_BODY } },

    { text: 'FORMAL DEFINITION', options: { bold: true, color: RUST, fontSize: 11, fontFace: FONT_MONO } },
    { text: '\n', options: {} },
    { text: 'Input:  ', options: { bold: true, fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: 'G = (V, E) where V = substations/generators, E = transmission lines with weights w(e) > 0 (impedance, km), priority tiers P(v) ∈ {0,1,2,3,4}, failure set F ⊆ (V ∪ E).\n', options: { fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: 'Output:  ', options: { bold: true, fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: 'Reachability partition, cut-edge bridges, minimum-impedance alternate bypass routes, and optimal MST.\n\n', options: { fontSize: 11, color: DARK, fontFace: FONT_BODY } },

    { text: 'REAL-WORLD RELEVANCE', options: { bold: true, color: RUST, fontSize: 11, fontFace: FONT_MONO } },
    { text: '\n', options: {} },
    { text: '1.  Disaster Management: ', options: { bold: true, fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: 'Guarantees ICU ventilators and trauma centres (AIIMS, Safdarjung) receive priority bypass power.\n', options: { fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: '2.  SCADA Automation: ', options: { bold: true, fontSize: 11, color: DARK, fontFace: FONT_BODY } },
    { text: 'Enables regional load dispatch centres (Delhi Transco / PGCIL) to self-heal automatically.', options: { fontSize: 11, color: DARK, fontFace: FONT_BODY } }
  ];
  sld.addText(body, {
    x: 0.35, y: 1.78, w: 12.85, h: 5.0,
    valign: 'top', wrap: true, isTextBox: true
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 3 — Algorithmic Paradigm
// ═══════════════════════════════════════════════════════════════════════
addSlide(3, TOTAL, 'Algorithmic Paradigm & Approach', sld => {
  // tagline
  sld.addText('Search locally.  Prioritize globally.', {
    x: 0.35, y: 1.33, w: 12.85, h: 0.3,
    fontSize: 12, italic: true, color: TEAL, fontFace: FONT_BODY
  });

  // Three cards
  const cards = [
    {
      num: '01', title: 'Dijkstra\'s Algorithm',
      body: 'O((V+E) log V) — Finds the least-impedance bypass from active generators to isolated critical loads. Greedy edge relaxation via Binary Min-Heap PQ.',
    },
    {
      num: '02', title: 'BFS + Tarjan\'s DFS',
      body: 'O(V+E) — BFS detects disconnected islanded zones; Tarjan\'s DFS identifies single-point-of-failure cut-edges (bridges) using tin[]/low[] arrays.',
    },
    {
      num: '03', title: 'Kruskal + Prim MST',
      body: 'O(E log E) / O(E log V) — Kruskal DSU builds global minimum-impedance spanning tree; Prim re-energizes outward from active generators (black-start).',
    }
  ];

  const cardW = 4.1, cardH = 2.7;
  const cardY = 1.78;
  cards.forEach((c, i) => {
    const x = 0.3 + i * (cardW + 0.17);
    // card bg
    sld.addShape('rect', {
      x, y: cardY, w: cardW, h: cardH,
      fill: { color: 'EBE6DB' },
      line: { color: 'C9C2B4', pt: 0.75 },
      rectRadius: 0.15
    });
    // number
    sld.addText(c.num, {
      x: x + 0.15, y: cardY + 0.14, w: 0.6, h: 0.42,
      fontSize: 18, bold: true, color: RUST, fontFace: FONT_MONO
    });
    // title
    sld.addText(c.title, {
      x: x + 0.14, y: cardY + 0.6, w: cardW - 0.3, h: 0.42,
      fontSize: 11.5, bold: true, color: DARK, fontFace: FONT_TITLE
    });
    // body
    sld.addText(c.body, {
      x: x + 0.14, y: cardY + 1.1, w: cardW - 0.28, h: 1.5,
      fontSize: 10.5, color: GREY, fontFace: FONT_BODY, wrap: true
    });
  });

  // brute force note
  sld.addText(
    'WHY NOT BRUTE FORCE?   Exhaustive route enumeration takes O(V!) or O(2^V) exponential time. Greedy graph search reduces runtime to sub-millisecond polynomial time — O((V+E) log V).',
    {
      x: 0.35, y: 4.62, w: 12.85, h: 0.65,
      fontSize: 10.5, italic: true, color: GREY, fontFace: FONT_BODY,
      wrap: true
    }
  );
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 4 — Data Structures
// ═══════════════════════════════════════════════════════════════════════
addSlide(4, TOTAL, 'Data Structures Used', sld => {
  const headerFill  = { color: 'D9D3C8' };
  const headerColor = DARK;
  const rows = [
    [
      { text: 'Data Structure',         options: { bold: true, color: headerColor, fill: headerFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Implementation',         options: { bold: true, color: headerColor, fill: headerFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Design Choice & Role',   options: { bold: true, color: headerColor, fill: headerFill, fontFace: FONT_MONO, fontSize: 9.5 } }
    ],
    [
      { text: 'Adjacency List',           options: { bold: true, fontFace: FONT_BODY, fontSize: 10, color: DARK } },
      { text: 'vector<vector<Edge>>',     options: { fontFace: FONT_MONO, fontSize: 9, color: TEAL } },
      { text: 'O(V+E) storage vs O(V²) matrix. Fast sparse-graph neighbor traversal.', options: { fontFace: FONT_BODY, fontSize: 10, color: DARK } }
    ],
    [
      { text: 'Binary Min-Heap (PQ)',     options: { bold: true, fontFace: FONT_BODY, fontSize: 10, color: DARK } },
      { text: 'std::priority_queue / heapq', options: { fontFace: FONT_MONO, fontSize: 9, color: TEAL } },
      { text: 'O(log V) extract-min for Dijkstra distance + emergency priority tier.', options: { fontFace: FONT_BODY, fontSize: 10, color: DARK } }
    ],
    [
      { text: 'Disjoint Set Union (DSU)', options: { bold: true, fontFace: FONT_BODY, fontSize: 10, color: DARK } },
      { text: 'Path Compress + Union Rank', options: { fontFace: FONT_MONO, fontSize: 9, color: TEAL } },
      { text: 'Near-constant O(α(V)) cycle checks in Kruskal\'s MST edge evaluation.', options: { fontFace: FONT_BODY, fontSize: 10, color: DARK } }
    ],
    [
      { text: 'Discovery/Low Arrays',     options: { bold: true, fontFace: FONT_BODY, fontSize: 10, color: DARK } },
      { text: 'tin[] and low[]',          options: { fontFace: FONT_MONO, fontSize: 9, color: TEAL } },
      { text: 'O(V+E) linear bridge detection in a single Tarjan DFS pass.', options: { fontFace: FONT_BODY, fontSize: 10, color: DARK } }
    ],
    [
      { text: 'Hash Maps',                options: { bold: true, fontFace: FONT_BODY, fontSize: 10, color: DARK } },
      { text: 'Map<NodeID, Node>',         options: { fontFace: FONT_MONO, fontSize: 9, color: TEAL } },
      { text: 'O(1) telemetry lookup and real-time state updates during simulation.', options: { fontFace: FONT_BODY, fontSize: 10, color: DARK } }
    ]
  ];
  table(sld, rows, [2.9, 2.5, 7.3], 1.38, 5.1);
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 5 — Algorithm Logic
// ═══════════════════════════════════════════════════════════════════════
addSlide(5, TOTAL, 'Algorithm Logic — Workflow & Pseudocode', sld => {
  // pseudocode box
  const code = [
    'Algorithm PriorityQueueDisasterRecovery(G, Generators, BlackoutNodes):',
    '    PQ = Empty Min-Heap',
    '         (comparator: priority_tier ASC, demand DESC)',
    '',
    '    for each node v in BlackoutNodes:',
    '        PQ.push(v)',
    '',
    '    while PQ is not empty:',
    '        target = PQ.pop()         // Tier 1 Hospital (AIIMS) first!',
    '        best_cost = INFINITY',
    '',
    '        for each generator in Generators:',
    '            (cost, path) = Dijkstra(G, generator, target)',
    '            if cost < best_cost:',
    '                best_cost = cost',
    '                best_path = path',
    '',
    '        if best_path != NULL:',
    '            Energize(target)',
    '            commit_bezier_path(best_path)',
    '            update_flow(G)'
  ].join('\n');

  sld.addShape('rect', {
    x: 0.35, y: 1.38, w: 7.4, h: 5.4,
    fill: { color: '1F2928' },
    line: { color: '315D58', pt: 1 },
    rectRadius: 0.12
  });
  sld.addText(code, {
    x: 0.5, y: 1.48, w: 7.1, h: 5.1,
    fontSize: 8.8,
    color: 'FFFAF0',
    fontFace: FONT_MONO,
    valign: 'top',
    wrap: true,
    lineSpacingMultiple: 1.4
  });

  // flowchart steps on right
  const steps = [
    { label: '1', text: 'Ingest topology & failures' },
    { label: '2', text: 'Rank critical loads by priority tier' },
    { label: '3', text: 'Dijkstra: cheapest feasible bypass path' },
    { label: '4', text: 'Commit Bézier route & update flow' },
  ];
  steps.forEach((s, i) => {
    const y = 1.52 + i * 1.2;
    sld.addShape('rect', {
      x: 8.0, y, w: 0.5, h: 0.5,
      fill: { color: RUST },
      line: { color: RUST },
      rectRadius: 0.08
    });
    sld.addText(s.label, {
      x: 8.0, y, w: 0.5, h: 0.5,
      fontSize: 14, bold: true, color: WHITE,
      fontFace: FONT_MONO, align: 'center', valign: 'middle'
    });
    sld.addText(s.text, {
      x: 8.65, y: y + 0.04, w: 4.6, h: 0.42,
      fontSize: 11, color: DARK, fontFace: FONT_BODY
    });
    if (i < steps.length - 1) {
      sld.addShape('rect', {
        x: 8.22, y: y + 0.5, w: 0.06, h: 0.7,
        fill: { color: TEAL }, line: { color: TEAL }
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 6 — Complexity Analysis
// ═══════════════════════════════════════════════════════════════════════
addSlide(6, TOTAL, 'Theoretical Complexity Analysis', sld => {
  // big O badge
  sld.addShape('rect', {
    x: 7.5, y: 1.3, w: 5.6, h: 1.3,
    fill: { color: '1F2928' },
    line: { color: TEAL, pt: 1 },
    rectRadius: 0.14
  });
  sld.addText('O((V + E) log V)', {
    x: 7.5, y: 1.3, w: 5.6, h: 0.8,
    fontSize: 22, bold: true, color: RUST,
    fontFace: FONT_MONO, align: 'center', valign: 'middle'
  });
  sld.addText('DIJKSTRA WITH BINARY HEAP', {
    x: 7.5, y: 2.0, w: 5.6, h: 0.5,
    fontSize: 9, bold: true, color: TEAL,
    fontFace: FONT_MONO, align: 'center', charSpacing: 1.5
  });

  // complexity table
  const hFill = { color: 'D9D3C8' };
  const rows = [
    [
      { text: 'Algorithm',      options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Complexity',     options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Derivation',     options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } }
    ],
    [
      { text: 'BFS Reachability',       options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(V + E)',               options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'Each vertex enqueued once + each edge inspected once.', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Tarjan DFS Bridges',     options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(V + E)',               options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'Single DFS with constant-time back-edge updates.', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Dijkstra\'s Algorithm',  options: { fontFace: FONT_BODY, fontSize: 10, bold: true } },
      { text: 'O((V+E) log V)',         options: { fontFace: FONT_MONO, fontSize: 10, color: RUST, bold: true } },
      { text: 'V×extract-min (V log V) + E×edge-relax (E log V).', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Kruskal\'s MST',         options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(E log E)',             options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'Sort E edges (E log E); DSU ops ≈ O(E·α(V)) ≈ O(E).', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Prim\'s MST',            options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(E log V)',             options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'Binary-heap frontier expansion from fixed generator root.', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Space (all)',            options: { fontFace: FONT_BODY, fontSize: 10, bold: true } },
      { text: 'O(V + E)',               options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'Adjacency O(V+E) + heap O(V) + arrays O(V). Total < 10 MB.', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ]
  ];
  table(sld, rows, [2.5, 1.9, 5.8], 1.38, 5.4);
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 7 — Implementation & Dataset
// ═══════════════════════════════════════════════════════════════════════
addSlide(7, TOTAL, 'Implementation & Dataset Details', sld => {
  sld.addText('A reproducible simulator — not a toy graph.', {
    x: 0.35, y: 1.33, w: 12.85, h: 0.3,
    fontSize: 12, italic: true, color: TEAL, fontFace: FONT_BODY
  });

  // Three info cards
  const info = [
    {
      tag: 'ENGINE', title: 'C++17 & Python 3.11',
      lines: ['STL priority_queue, <chrono> high-res timers', 'Python heapq, dataclasses, NetworkX validation', 'Zero-dependency Node.js HTTP server', 'Leaflet.js + CARTO Voyager raster/vector tiles', 'Quadratic Bézier curved transmission arcs']
    },
    {
      tag: 'TOPOLOGIES', title: 'Delhi NCR & IEEE Benchmarks',
      lines: ['12-node Delhi NCR Regional Grid (real GPS)', '18 HV transmission lines (400 kV / 220 kV / 66 kV)', 'Tiered nodes: Badarpur, IP Gas, AIIMS, Safdarjung,', '  DMRC Metro Hub, Delhi Jal Board Water Works', 'IEEE 14-Bus standard electrical test system', '16-node cascading fragile mesh stress-test']
    },
    {
      tag: 'FAULT MODEL', title: '1–20 Outage Scenarios',
      lines: ['Node, edge, and cascading line trips', 'Positive impedance weights strictly enforced', 'Seeded deterministic reproducible runs', 'Dynamic topology mutation between iterations', 'Priority tier restoration ordering verified']
    }
  ];

  info.forEach((c, i) => {
    const x = 0.3 + i * 4.33;
    // card box
    sld.addShape('rect', {
      x, y: 1.75, w: 4.15, h: 4.9,
      fill: { color: 'EBE6DB' },
      line: { color: 'C9C2B4', pt: 0.75 },
      rectRadius: 0.12
    });
    // tag
    sld.addText(c.tag, {
      x: x + 0.14, y: 1.9, w: 3.85, h: 0.3,
      fontSize: 9, bold: true, color: RUST, fontFace: FONT_MONO, charSpacing: 1.5
    });
    // title
    sld.addText(c.title, {
      x: x + 0.14, y: 2.22, w: 3.85, h: 0.45,
      fontSize: 12, bold: true, color: DARK, fontFace: FONT_TITLE, wrap: true
    });
    // bullet lines
    const lineItems = c.lines.map(l => ({
      text: '• ' + l,
      options: { fontSize: 10, color: DARK, fontFace: FONT_BODY, paraSpaceAfter: 2 }
    }));
    sld.addText(lineItems, {
      x: x + 0.14, y: 2.76, w: 3.85, h: 3.6,
      valign: 'top', wrap: true, isTextBox: true
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 8 — Experimental Results
// ═══════════════════════════════════════════════════════════════════════
addSlide(8, TOTAL, 'Experimental Results & Performance Benchmarks', sld => {
  const hFill = { color: 'D9D3C8' };
  const rows = [
    [
      { text: 'Algorithm',         options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Theoretical Big-O', options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Measured (μs)',     options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Nodes',            options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: 'Outcome / Cost',   options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } }
    ],
    [
      { text: 'BFS Scan',               options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(V + E)',               options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: '18 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true } },
      { text: '12',                     options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: '100% Reachable (0 Islands)', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Tarjan DFS Bridges',     options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(V + E)',               options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: '24 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true } },
      { text: '12',                     options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: '0 Bridges (Resilient Ring Mesh)', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Dijkstra Bypass',        options: { fontFace: FONT_BODY, fontSize: 10, bold: true } },
      { text: 'O((V+E) log V)',         options: { fontFace: FONT_MONO, fontSize: 10, color: RUST, bold: true } },
      { text: '36 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true, color: RUST } },
      { text: '5',                      options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: 'Path Cost: 12.0 Ω-km · AIIMS Restored', options: { fontFace: FONT_BODY, fontSize: 10, bold: true } }
    ],
    [
      { text: 'Kruskal MST',            options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(E log E)',             options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: '45 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true } },
      { text: '12',                     options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: 'Tree Cost: 57.1 Ω-km', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Prim MST',               options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O(E log V)',             options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: '41 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true } },
      { text: '12',                     options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: 'Black-Start Tree: 57.1 Ω-km', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'PQ Disaster Dispatch',   options: { fontFace: FONT_BODY, fontSize: 10, bold: true } },
      { text: 'O(K(V+E) log V)',        options: { fontFace: FONT_MONO, fontSize: 10, color: RUST } },
      { text: '68 μs',                  options: { fontFace: FONT_MONO, fontSize: 10, bold: true, color: RUST } },
      { text: '14',                     options: { fontFace: FONT_MONO, fontSize: 10 } },
      { text: 'Tier 1 Hospital Restored < 0.1 ms', options: { fontFace: FONT_BODY, fontSize: 10, bold: true } }
    ]
  ];
  table(sld, rows, [2.4, 2.0, 1.4, 0.8, 5.9], 1.38, 5.0);

  sld.addText(
    'Theory vs. Practice: In sparse planar transmission grids (E ≈ 1.5V), all measured runtimes scale strictly within polynomial bounds — well under the 100 ms human perceptual delay threshold.',
    {
      x: 0.35, y: 6.5, w: 12.85, h: 0.4,
      fontSize: 9.5, italic: true, color: GREY, fontFace: FONT_BODY, wrap: true
    }
  );
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 9 — Comparative Analysis
// ═══════════════════════════════════════════════════════════════════════
addSlide(9, TOTAL, 'Comparative Analysis', sld => {
  const hFill = { color: 'D9D3C8' };
  const rows = [
    [
      { text: 'Dimension',       options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: "Dijkstra's",      options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: "Kruskal's",       options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } },
      { text: "Prim's",          options: { bold: true, fill: hFill, fontFace: FONT_MONO, fontSize: 9.5 } }
    ],
    [
      { text: 'Core Goal',               options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Point-to-point shortest bypass path', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Global Minimum Spanning Tree', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Generator-rooted outward spanning tree', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Primary Role',            options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Live emergency bypass around broken line', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Post-event full network audit', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Black-start re-energization from plant', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Key Structure',           options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Binary Min-Heap PQ',      options: { fontFace: FONT_MONO, fontSize: 9.5, color: TEAL } },
      { text: 'Sorted edges + DSU',      options: { fontFace: FONT_MONO, fontSize: 9.5, color: TEAL } },
      { text: 'Binary Min-Heap + Visited', options: { fontFace: FONT_MONO, fontSize: 9.5, color: TEAL } }
    ],
    [
      { text: 'Time Complexity',         options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'O((V+E) log V)',          options: { fontFace: FONT_MONO, fontSize: 10, color: RUST, bold: true } },
      { text: 'O(E log E)',              options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } },
      { text: 'O(E log V)',              options: { fontFace: FONT_MONO, fontSize: 10, color: TEAL } }
    ],
    [
      { text: 'Disconnected Graph',      options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Marks unreachable, no crash', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Produces spanning forest', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Needs restart / forest',  options: { fontFace: FONT_BODY, fontSize: 10 } }
    ],
    [
      { text: 'Key Trade-off',           options: { bold: true, fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Minimum path latency — ignores global wire cost', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Minimum total wire — individual paths may be longer', options: { fontFace: FONT_BODY, fontSize: 10 } },
      { text: 'Ideal fixed-source; requires frontier queue overhead', options: { fontFace: FONT_BODY, fontSize: 10 } }
    ]
  ];
  table(sld, rows, [2.5, 3.5, 3.5, 3.4], 1.38, 5.4);
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 10 — Edge Cases & Testing
// ═══════════════════════════════════════════════════════════════════════
addSlide(10, TOTAL, 'Edge Cases & Testing', sld => {
  const cases = [
    {
      ltr: 'A', title: 'Disconnected Island',
      body: 'All incident lines to a substation fail. Dijkstra detects dist = ∞ without crashing; Priority Queue logs the facility as UNREACHABLE and continues to serve reachable nodes without state corruption.'
    },
    {
      ltr: 'B', title: 'Equal-Cost Alternatives',
      body: 'Multiple bypass paths with identical total impedance. Deterministic tuple comparator (priority_tier, demand, node_id) produces stable, reproducible plans across repeated seeded runs.'
    },
    {
      ltr: 'C', title: 'Cascading Failure Mid-Run',
      body: 'A committed bypass route trips during recovery execution. Topology is updated instantly; BFS reachability re-scan is triggered; Dijkstra recomputes the best remaining bypass path automatically.'
    },
    {
      ltr: 'D', title: 'Capacity / Impedance Saturation',
      body: 'Cheapest path fails strict non-negative impedance check (w(e) > 0) or residual capacity is insufficient. Dijkstra skips the path and selects the next-best feasible route — no infinite loops.'
    }
  ];

  cases.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.3 + col * 6.52;
    const y = 1.42 + row * 2.95;
    sld.addShape('rect', {
      x, y, w: 6.3, h: 2.72,
      fill: { color: row === 0 ? '1F2928' : 'EBE6DB' },
      line: { color: row === 0 ? TEAL : 'C9C2B4', pt: 0.75 },
      rectRadius: 0.14
    });
    const fg = row === 0 ? 'FFFAF0' : DARK;
    sld.addText(c.ltr, {
      x: x + 0.15, y: y + 0.14, w: 0.52, h: 0.52,
      fontSize: 20, bold: true, color: RUST,
      fontFace: FONT_TITLE, align: 'center', valign: 'middle'
    });
    sld.addText(c.title, {
      x: x + 0.14, y: y + 0.7, w: 5.9, h: 0.38,
      fontSize: 11.5, bold: true, color: fg, fontFace: FONT_TITLE
    });
    sld.addText(c.body, {
      x: x + 0.14, y: y + 1.12, w: 5.9, h: 1.5,
      fontSize: 10, color: row === 0 ? 'BDBDBD' : GREY,
      fontFace: FONT_BODY, wrap: true
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 11 — Challenges, Limitations & Future Scope
// ═══════════════════════════════════════════════════════════════════════
addSlide(11, TOTAL, 'Challenges, Limitations & Future Scope', sld => {
  const cols = [
    {
      tag: 'OVERCOME', items: [
        'Spiderweb map clutter → redesigned ring-and-radial topology with quadratic Bézier curved transmission arcs.',
        'Priority inversion → strict (tier, demand, id) tuple-based min-heap comparator ordering.',
        'Dynamic topology mutation → topology updated and re-scanned after every committed route.'
      ]
    },
    {
      tag: 'LIMITATIONS', items: [
        'Graph-theoretical model only — does not perform non-linear AC power-flow differential equations (reactive power VARs, phase angles).',
        'Static demand snapshot — load values are fixed at simulation start.',
        'Single-process execution — no multi-threading across generators.'
      ]
    },
    {
      tag: 'FUTURE SCOPE', items: [
        'Machine Learning for predictive failure forecasting before line trips occur.',
        'Dynamic renewable battery storage (BESS) injection balancing.',
        'N−k contingency analysis and parallel multi-source search.',
        'Real SCADA telemetry adapter for live grid integration.'
      ]
    }
  ];

  cols.forEach((col, i) => {
    const x = 0.3 + i * 4.35;
    sld.addShape('rect', {
      x, y: 1.42, w: 4.15, h: 5.0,
      fill: { color: i === 0 ? '1F2928' : 'EBE6DB' },
      line: { color: i === 0 ? TEAL : 'C9C2B4', pt: 0.75 },
      rectRadius: 0.12
    });
    const fg = i === 0 ? 'FFFAF0' : DARK;
    sld.addText(col.tag, {
      x: x + 0.14, y: 1.56, w: 3.85, h: 0.3,
      fontSize: 9, bold: true, color: RUST, fontFace: FONT_MONO, charSpacing: 1.5
    });
    const lineItems = col.items.map(l => ({
      text: '→ ' + l + '\n',
      options: { fontSize: 10.5, color: i === 0 ? 'BDBDBD' : GREY, fontFace: FONT_BODY }
    }));
    sld.addText(lineItems, {
      x: x + 0.14, y: 1.96, w: 3.85, h: 4.2,
      valign: 'top', wrap: true, isTextBox: true, lineSpacingMultiple: 1.4
    });
  });

  sld.addText(
    'The simulator proves the algorithmic core. Operational deployment would additionally require electrical-state estimation, network security hardening, and hardware-in-the-loop validation.',
    {
      x: 0.35, y: 6.58, w: 12.85, h: 0.35,
      fontSize: 9, italic: true, color: GREY, fontFace: FONT_BODY, wrap: true
    }
  );
});

// ═══════════════════════════════════════════════════════════════════════
// SLIDE 12 — Contributions & Repository
// ═══════════════════════════════════════════════════════════════════════
{
  const sld = prs.addSlide();
  sld.background = { color: '1F2928' };

  // vertical rust bar
  sld.addShape('rect', {
    x: 0, y: 0, w: 0.12, h: '100%',
    fill: { color: RUST }, line: { color: RUST }
  });

  // slide number
  sld.addText('12', {
    x: 11.9, y: 0.18, w: 1.3, h: 0.55,
    fontSize: 32, bold: true, color: RUST,
    fontFace: FONT_TITLE, align: 'right'
  });

  // heading
  sld.addText('Individual Contributions & Project Repository', {
    x: 0.3, y: 0.65, w: 11.5, h: 0.5,
    fontSize: 22, bold: true, color: 'FFFAF0', fontFace: FONT_TITLE
  });
  sld.addShape('rect', {
    x: 0.3, y: 1.22, w: 12.9, h: 0.03,
    fill: { color: TEAL }, line: { color: TEAL }
  });

  // tagline
  sld.addText('Built as one system.  Owned in clear parts.', {
    x: 0.35, y: 1.33, w: 7.0, h: 0.3,
    fontSize: 12, italic: true, color: TEAL, fontFace: FONT_BODY
  });

  // contributor rows
  const contribs = [
    {
      name: 'Aashutosh Singh Parihar',
      roll: '25293916003 · B.Tech CSE B2',
      items: ['Core Algorithm Architecture & Theoretical Complexity Formulations', "Dijkstra's Algorithm, Priority Queue Recovery Engine & C++ Simulator", 'Performance Benchmarking Suite & Execution Analysis']
    },
    {
      name: 'C. Sai Vishwak Raju',
      roll: '25293916027 · B.Tech CSE B2',
      items: ["Disjoint Set Union, Kruskal's MST, Prim's Algorithm & Tarjan DFS Bridges", 'Leaflet.js + CARTO Voyager Geospatial Integration & Bézier Curve Path Generation', 'Python Simulator Engine & Experimental Test Case Generation']
    }
  ];

  contribs.forEach((p, i) => {
    const y = 1.72 + i * 2.3;
    sld.addText(p.name, {
      x: 0.35, y, w: 7.0, h: 0.38,
      fontSize: 13, bold: true, color: RUST, fontFace: FONT_MONO
    });
    sld.addText(p.roll, {
      x: 0.35, y: y + 0.38, w: 7.0, h: 0.26,
      fontSize: 9.5, color: TEAL, fontFace: FONT_MONO
    });
    p.items.forEach((item, j) => {
      sld.addText('· ' + item, {
        x: 0.5, y: y + 0.7 + j * 0.42, w: 6.7, h: 0.38,
        fontSize: 10, color: 'BDBDBD', fontFace: FONT_BODY, wrap: true
      });
    });
  });

  // right box: supervisor + artifacts
  sld.addShape('rect', {
    x: 7.55, y: 1.42, w: 5.7, h: 5.0,
    fill: { color: TEAL },
    line: { color: TEAL },
    rectRadius: 0.14
  });

  sld.addText('PROJECT ARTIFACTS', {
    x: 7.7, y: 1.58, w: 5.4, h: 0.3,
    fontSize: 9, bold: true, color: 'FFFAF0', fontFace: FONT_MONO, charSpacing: 1.5
  });

  const artifacts = [
    { label: 'Supervisor', value: 'Dr. Juhi Jain' },
    { label: 'Course', value: 'ADA-301 — Analysis & Design of Algorithms' },
    { label: 'Institution', value: 'Faculty of Technology, University of Delhi' },
    { label: 'Interactive Simulator', value: 'index.html / node server.js' },
    { label: 'C++ Source', value: 'src_cpp/power_grid_simulator.cpp' },
    { label: 'Python Source', value: 'src_python/power_grid_simulator.py' },
    { label: 'Full Synopsis', value: 'README.md' },
    { label: 'Repository', value: 'github.com/aashutosh-parihar/grid-recovery-simulator' }
  ];
  artifacts.forEach((a, i) => {
    sld.addText(a.label + ':  ', {
      x: 7.7, y: 2.0 + i * 0.52, w: 2.0, h: 0.42,
      fontSize: 9.5, bold: true, color: 'FFFAF0', fontFace: FONT_MONO
    });
    sld.addText(a.value, {
      x: 9.7, y: 2.0 + i * 0.52, w: 3.3, h: 0.42,
      fontSize: 9.5, color: 'FEFFEC', fontFace: FONT_BODY, wrap: true
    });
  });

  // Questions?
  sld.addText('Questions?', {
    x: 7.7, y: 6.72, w: 5.4, h: 0.55,
    fontSize: 24, bold: true, color: RUST,
    fontFace: FONT_TITLE, align: 'right'
  });

  // footer
  sld.addShape('rect', {
    x: 0, y: 6.95, w: '100%', h: 0.1,
    fill: { color: TEAL }, line: { color: TEAL }
  });
  sld.addText(
    'Faculty of Technology, University of Delhi  ·  ADA-301  ·  Slide 12 of 12',
    {
      x: 0.3, y: 7.1, w: 12.9, h: 0.28,
      fontSize: 7, color: GREY, fontFace: FONT_MONO, align: 'left'
    }
  );
}

// ─── Write output ───────────────────────────────────────────────────
const outPath = 'c:/Users/ashut/OneDrive/Documents/ADApro/PRESENTATION_SLIDES.pptx';
prs.writeFile({ fileName: outPath }).then(() => {
  const fs = require('fs');
  const stats = fs.statSync(outPath);
  console.log('SUCCESS — written to:', outPath);
  console.log('File size:', (stats.size / 1024).toFixed(1), 'KB');
}).catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
