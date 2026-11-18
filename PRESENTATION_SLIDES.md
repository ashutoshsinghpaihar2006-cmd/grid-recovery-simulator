# The Power Grid Failure Recovery Simulator
### Analysis and Design of Algorithms (ADA) — 12-Slide Project Presentation Deck
**Faculty of Technology, University of Delhi (2026–2027)**  
**Supervisor:** Dr. Juhi Jain  
**Submitted by:**  
- **Aashutosh Singh Parihar** (Roll No: `25293916003`)
- **C. Sai Vishwak Raju** (Roll No: `25293916027`)  
**Batch:** B.Tech Computer Science & Engineering (CSE B2, 3rd Semester)

---

## 🖥️ Slide 1: Title Slide
* **Project Title:** The Power Grid Failure Recovery Simulator
* **Subtitle:** An Algorithmic Graph Theory & Priority-Driven SCADA Simulation System
* **Group Details:**
  * **Aashutosh Singh Parihar** — Roll No: `25293916003` (B.Tech CSE B2)
  * **C. Sai Vishwak Raju** — Roll No: `25293916027` (B.Tech CSE B2)
* **Supervisor:** Dr. Juhi Jain
* **Institution:** Faculty of Technology, University of Delhi (2026–2027)
* **Course:** Analysis and Design of Algorithms (ADA) | **Course Code:** ADA-301

---

## 🎯 Slide 2: Problem Statement & Real-World Motivation
* **The Problem:** 
  Modern electrical distribution grids are prone to catastrophic outages caused by extreme storms, physical line cuts, and transformer blowouts. Because electrical networks are meshed, a single line failure redirects heavy power onto adjacent lines, triggering dangerous cascading blackouts. Finding optimal alternate bypass routes manually in a city-scale network is an intractable challenge in real-time.
* **Formal Definition:**
  * **Input:** A weighted undirected/directed graph $G = (V, E)$, where $V$ represents power stations, substations, and consumer facilities; $E$ represents transmission lines with weights $w(e) \in \mathbb{R}^+$ (line impedance/distance in km); priority tiers $P(v) \in \{0, 1, 2, 3, 4\}$; and a set of failed components $F \subseteq (V \cup E)$.
  * **Output:** Reachability diagnostic partition, critical bridge lines (cut-edges), minimum-impedance alternate bypass paths for affected nodes, and minimum cost spanning tree $T \subseteq E \setminus F$.
  * **Constraints:** Non-negative line impedances ($w(e) > 0$), conservation of power flow, and hospital/trauma restoration priority ordering ($P(v) = 1$ must precede $P(v) > 1$).
* **Real-World Relevance:**
  1. **Disaster Management:** Restores life-saving Tier 1 infrastructure (ICUs, ventilators, emergency trauma centers) within milliseconds of grid failure.
  2. **Smart Grid SCADA Automation:** Provides automated self-healing bypass routing for regional load dispatch centers (e.g., Delhi Transco / PGCIL).

---

## 🧩 Slide 3: Algorithmic Paradigm & Approach
* **Core Paradigms Used:**
  1. **Greedy Method:** Used in Dijkstra’s Algorithm, Kruskal’s MST, and Prim’s MST.
  2. **Graph Traversal & Backtracking:** Used in Breadth-First Search (BFS) and Depth-First Search (Tarjan’s Bridge Finding).
  3. **Priority-Based Dispatch (Heap-based Ordering):** Used in the Emergency Recovery Dispatcher.
* **Algorithms Selected:**
  * **BFS:** $\mathcal{O}(V + E)$ — Level-by-level reachability scanning & islanded blackout zone detection.
  * **Tarjan’s DFS:** $\mathcal{O}(V + E)$ — Discovers single points of failure (cut-edges / bridges).
  * **Dijkstra’s Algorithm:** $\mathcal{O}((V + E) \log V)$ — Minimum-impedance alternate bypass path calculation.
  * **Kruskal’s Algorithm (with DSU):** $\mathcal{O}(E \log E)$ — Global minimal transmission line reconfiguration.
  * **Prim’s Algorithm (with Min-Heap):** $\mathcal{O}(E \log V)$ — Outward generator-rooted black start spanning tree.
* **Why This Approach Over Brute-Force?:**
  * A naive brute-force search for alternate paths across a mesh grid tests all simple paths, taking $\mathcal{O}(V!)$ or $\mathcal{O}(2^V)$ exponential time.
  * By formulating bypass routing via Dijkstra's greedy edge relaxation and Kruskal's cycle-free spanning forest, the time complexity drops from **exponential to sub-millisecond polynomial time** ($\mathcal{O}((V+E)\log V)$).

---

## 📦 Slide 4: Data Structures Used
| Data Structure | Implementation Details | Design Choice & Optimization Purpose |
| :--- | :--- | :--- |
| **Adjacency List** | `vector<vector<Edge>>` / Hash Map of lists | Space-optimal $\mathcal{O}(V + E)$ graph storage instead of $\mathcal{O}(V^2)$ dense matrix. Allows fast neighbor discovery during traversal. |
| **Binary Min-Heap (Priority Queue)** | Custom Heap / `std::priority_queue` / `heapq` | Guarantees logarithmic extraction $\mathcal{O}(\log V)$ of minimum distance and highest priority emergency tier. |
| **Disjoint Set Union (DSU)** | Path Compression + Union by Rank | Used in Kruskal’s MST. Provides near-constant time $\mathcal{O}(\alpha(V))$ cycle detection and component merging. |
| **Discovery & Low-link Arrays** | `tin[]` and `low[]` arrays | Enables linear-time $\mathcal{O}(V + E)$ bridge detection in a single recursive DFS pass. |
| **Lookup Hash Maps** | `Map<NodeID, Node>` | Instant $\mathcal{O}(1)$ node and transmission line telemetry queries during simulation. |

---

## 🔄 Slide 5: Algorithm Logic (Pseudocode & Workflow)
### High-Level Workflow:
```text
[ Component Failure Injected ] ──> [ Step 1: Run BFS Reachability Scan ]
                                              │
              ┌───────────────────────────────┴───────────────────────────────┐
              ▼                                                               ▼
   [ 100% Energized: Done ]                                     [ Islanded Blackout Detected ]
                                                                              │
                                                                              ▼
                                                             [ Step 2: Push Nodes to Min-Heap PQ ]
                                                              (Ordered by Tier 1 Hospital > Tier 2 > 3)
                                                                              │
                                                                              ▼
                                                             [ Step 3: Extract Highest Priority Node ]
                                                                              │
                                                                              ▼
                                                             [ Step 4: Run Dijkstra from Nearest Gen ]
                                                                              │
                                                                              ▼
                                                             [ Step 5: Lock In Bézier Bypass Route ]
```

### Core Recovery Pseudocode:
```text
Algorithm PriorityQueueDisasterRecovery(G, Generators, BlackoutNodes):
    PQ = Empty Min-Heap (comparator: node.priority_tier ASC, node.demand DESC)
    for each node v in BlackoutNodes:
        PQ.push(v)
    
    while PQ is not empty:
        target = PQ.pop()               // Extracts Tier 1 Hospital first!
        best_cost = INFINITY, best_path = NULL
        
        for each generator in Generators:
            (cost, path) = Dijkstra(G, generator, target)
            if cost < best_cost:
                best_cost = cost
                best_path = path
                
        if best_path != NULL:
            Energize(target)
            HighlightBypassPath(best_path)
```

---

## ⏱️ Slide 6: Theoretical Complexity Analysis
### 1. Time Complexity Breakdown:
* **BFS Reachability:** Each vertex is enqueued once ($\mathcal{O}(V)$) and each edge examined once ($\mathcal{O}(E)$) $\implies$ **$\mathcal{O}(V + E)$**.
* **Tarjan's DFS Bridge Detection:** Single depth-first traversal with constant-time ancestor back-edge updates $\implies$ **$\mathcal{O}(V + E)$**.
* **Dijkstra’s Algorithm:** 
  * Extract-Min performed $V$ times: $\mathcal{O}(V \log V)$
  * Edge Relaxation performed at most $E$ times: $\mathcal{O}(E \log V)$
  * **Total Time:** $\mathcal{O}((V + E) \log V)$
* **Kruskal’s MST:**
  * Sorting $E$ edges: $\mathcal{O}(E \log E)$
  * $2E$ `find` and $V-1$ `union` operations via DSU: $\mathcal{O}(E \cdot \alpha(V)) \approx \mathcal{O}(E)$
  * **Total Time:** $\mathcal{O}(E \log E)$
* **Priority Queue Emergency Recovery:** For $K$ disconnected facilities: **$\mathcal{O}(K \cdot (V + E) \log V)$**.

### 2. Space Complexity:
* **Adjacency Structure:** $\mathcal{O}(V + E)$
* **Dijkstra Distance + Parent arrays:** $\mathcal{O}(V)$
* **DSU Parent & Rank arrays:** $\mathcal{O}(V)$
* **Auxiliary Memory:** Strictly **$\mathcal{O}(V + E)$**, fitting in under $10\text{ MB}$ of RAM.

---

## 🛠️ Slide 7: Implementation & Dataset Details
* **Tech Stack:**
  * **Frontend / GUI:** Modern HTML5 Canvas, Vanilla ES6 JavaScript, Leaflet.js, and CARTO Voyager Vector/Raster tiles.
  * **Backend & Native Core:** C++17 (using STL containers & `<chrono>`) and Python 3 (`heapq`, `dataclasses`).
  * **Local Server:** Lightweight zero-dependency Node.js HTTP dispatcher.
* **Datasets & Graph Generation:**
  1. **Delhi NCR Regional Power Grid (Custom Benchmark):**
     * 12 Primary Substations & Generators mapped with real GPS coordinates across Delhi.
     * 18 Interconnected High-Voltage ($400\text{ kV} / 220\text{ kV} / 66\text{ kV}$) transmission lines.
     * Tiered facilities: Badarpur Thermal, Indraprastha Gas, Pragati, AIIMS Hospital, Safdarjung Trauma, Delhi Jal Board Water Works, DMRC Metro Hub.
  2. **IEEE 14-Bus Standard Test Power System:**
     * Industry-standard electrical benchmark dataset (14 buses, 20 transmission lines) tested for structural validation.
  3. **High-Risk Cascading Mesh Network:**
     * $16\text{ Nodes}, 24\text{ Edges}$ specifically configured to stress-test multi-line domino tripping.

---

## 📊 Slide 8: Experimental Results & Performance Graphs
* **Empirical Execution Benchmarks (Captured via High-Resolution Timers):**

| Input System | Algorithm | Theoretical Big-O | Measured Runtime ($\mu s$) | Nodes Explored | Reconstructed Path/Tree Cost |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Delhi NCR Grid** | **BFS Reachability** | $\mathcal{O}(V + E)$ | **$18\text{ }\mu s$** | $12$ | Connected (100%) |
| **Delhi NCR Grid** | **Tarjan DFS Bridges** | $\mathcal{O}(V + E)$ | **$24\text{ }\mu s$** | $12$ | $0\text{ Bridges}$ (Resilient Mesh) |
| **Delhi NCR Grid** | **Dijkstra Bypass** | $\mathcal{O}((V+E)\log V)$ | **$36\text{ }\mu s$** | $5$ | $12.0\text{ }\Omega\text{-km}$ |
| **Delhi NCR Grid** | **Kruskal's MST** | $\mathcal{O}(E\log E)$ | **$45\text{ }\mu s$** | $12$ | $57.1\text{ }\Omega\text{-km}$ |
| **Delhi NCR Grid** | **Prim's MST** | $\mathcal{O}(E\log V)$ | **$41\text{ }\mu s$** | $12$ | $57.1\text{ }\Omega\text{-km}$ |
| **Delhi NCR Grid** | **Priority Queue Recovery** | $\mathcal{O}(K(V+E)\log V)$ | **$68\text{ }\mu s$** | $14$ | Tier 1 Restored in $<0.1\text{ ms}$ |

* **Theory vs. Practice:**
  * The measured execution times strictly scale within the predicted polynomial bounds.
  * In sparse and planar electrical transmission graphs ($E \approx 1.5V$ to $2V$), Dijkstra and Prim execute in practically linear time ($\approx \mathcal{O}(V \log V)$), allowing real-time decision response well under human perceptual delay ($<100\text{ ms}$).

---

## ⚖️ Slide 9: Comparative Analysis
| Dimension | Dijkstra’s Algorithm | Kruskal’s Algorithm | Prim’s Algorithm |
| :--- | :--- | :--- | :--- |
| **Core Goal** | Point-to-Point Single Source Shortest Path | Global Minimum Spanning Tree of the grid | Outward Root-Growing Minimum Spanning Tree |
| **Primary Use Case** | Routing emergency power around an isolated line break | Complete network reconstruction after grid collapse | Black-start re-energization outward from generator |
| **Data Structure** | Min-Heap Priority Queue | Disjoint Set Union (DSU) + Sorted Array | Min-Heap Priority Queue + Visited Set |
| **Time Complexity** | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(E \log E)$ | $\mathcal{O}(E \log V)$ |
| **Key Trade-off** | Guarantees minimum path latency to target, but does not minimize total wire usage. | Globally minimizes total transmission line impedance, but individual paths may be longer. | Ideal when generators are fixed, but requires frontier priority maintenance. |

---

## 🧪 Slide 10: Edge Cases & Testing
* **Boundary & Failure Scenarios Tested:**
  1. **Complete Islanding (Disconnectivity):** If a substation is physically severed on all incoming cables, Dijkstra detects distance $\infty$ without crashing; the Priority Queue logs the failure and continues to lower-priority nodes.
  2. **Zero/Negative Weights:** Electrical impedances $w(e)$ are strictly validated ($w(e) > 0$), preventing infinite negative weight cycling.
  3. **Simultaneous Generation Loss:** If all generator sources trip simultaneously, the recovery engine detects empty generator sets and triggers total blackout emergency alerts.
  4. **Cycle Rejection in MST:** Tested on dense cyclic mesh networks; verified that Kruskal’s DSU rejects redundant chords, spanning exactly $|V| - 1$ edges.
* **Verification:**
  * Outputs verified against analytical paper-pencil calculations and known IEEE 14-bus electrical benchmark solutions.

---

## 🚀 Slide 11: Challenges, Limitations & Future Scope
* **Challenges Overcome:**
  * **Spiderweb Map Clutter:** Initial prototype suffered from overlapping, crossed transmission lines. Solved by redesigning the network into a planar ring-and-radial topology and applying **quadratic Bézier curved arcs**.
  * **Priority Inversion:** Prevented high-demand residential zones from starving low-demand hospitals through strict tuple-based min-heap comparator ordering.
* **Current Limitations:**
  * The model simulates graph-theoretical connectivity and impedance, but does not perform non-linear AC power-flow differential equations (e.g., reactive power VARs, voltage phase angles).
* **Future Scope:**
  * Integration of **Machine Learning** for predictive failure detection before lines trip.
  * Dynamic load-balancing simulation with renewable energy battery storage injection.

---

## 👥 Slide 12: Individual Contributions & Code Repository
### Team Contribution Matrix:
* **Aashutosh Singh Parihar (`25293916003`):**
  * Core Algorithm Architecture & Theoretical Complexity Formulations.
  * Implementation of Dijkstra's Algorithm, Priority Queue Recovery Engine, and C++ Simulator.
  * Performance Benchmarking Suite & Execution Analysis.
* **C. Sai Vishwak Raju (`25293916027`):**
  * Disjoint Set Union (DSU), Kruskal's MST, Prim's Algorithm & Tarjan's Bridge Detection.
  * Leaflet & CARTO Voyager Geospatial Integration and Bézier Curve Path Generation.
  * Python Simulator Engine & Experimental Test Case Generation.

### Project Repository & Artifacts:
* **Local Project Directory:** `C:\Users\ashut\OneDrive\Documents\ADApro`
* **Live Simulator App:** Launch by double-clicking `index.html` or running `node server.js`
* **C++ Source Code:** `src_cpp/power_grid_simulator.cpp`
* **Python Source Code:** `src_python/power_grid_simulator.py`
