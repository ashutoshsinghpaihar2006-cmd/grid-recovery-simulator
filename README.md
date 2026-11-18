# The Power Grid Failure Recovery Simulator
### Algorithm Design and Analysis (ADA) Project
**Faculty of Technology, University of Delhi (2026–2027)**  
**Batch:** B.Tech Computer Science & Engineering (CSE B2, 3rd Semester)  
**Submitted to:** Dr. Juhi Jain  
**Submitted by:**  
- **Aashutosh Singh Parihar** (Roll No: `25293916003`)
- **C. Sai Vishwak Raju** (Roll No: `25293916027`)

---

## ⚡ 1. Introduction & Overview
The **Power Grid Failure Recovery Simulator** is an algorithmic simulation and decision-support system designed to model electrical power transmission networks as weighted graphs, simulate component disruptions (transmission line trips, transformer explosions, cascading outages, severe storms), and determine optimal, real-time recovery routes.

When catastrophic disruptions disconnect portions of a regional power grid, manually calculating alternative bypass routes is NP-hard in complex meshes. This system combines classic and advanced graph algorithms:
1. **Breadth-First Search (BFS)** for level-by-level reachability scanning and hop-distance calculation ($O(V + E)$).
2. **Depth-First Search (DFS) & Tarjan's Bridge Algorithm** for single-point-of-failure and cut-vertex detection ($O(V + E)$).
3. **Dijkstra's Algorithm (Min-Heap)** for minimum-impedance, least-risk bypass path calculation ($O((V + E) \log V)$).
4. **Disaster Priority Queue Dispatcher** prioritizing Tier 1 critical life-safety facilities (Hospitals, Emergency Trauma Centers) over residential and industrial zones.
5. **Kruskal's Algorithm (Disjoint Set Union)** for global minimal transmission line reconfiguration ($O(E \log E)$).
6. **Prim's Algorithm (Priority Queue)** for source-rooted spanning tree construction ($O(E \log V)$).

---

## 💻 2. Tech Stack

- **Frontend Application:** Modern Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3 Glassmorphism, Leaflet.js, CARTO Voyager basemaps
- **Backend & Native Cores:**
  - **C++17 Core:** Native implementation using Standard Template Library (`std::vector`, `std::priority_queue`, `<chrono>`)
  - **Python 3 Core:** Graph algorithms with `heapq`, `dataclasses`, and standalone benchmark test harness
- **Local Web Server:** Zero-dependency Node.js HTTP server
- **Presentation Deck:** HTML5 Presentations & native PowerPoint (`.pptx`) presentation decks

---

## 🔐 3. Authentication & Environment Security

- **Authentication / Demo Credentials:** This application is a client-side SCADA educational simulator designed for open evaluation and demonstration. **No login credentials or account sign-ins are required**; all simulation modules, algorithm runs, and topology editors are accessible immediately out of the box.
- **Environment Variables:** An optional `.env.example` file is provided for custom configuration:
  - `CARTO_API_KEY`: Optional API key for custom CARTO tile limits (defaults to open raster basemaps).
  - `PORT`: Local HTTP server port (defaults to `3000`).

---

## 🛠️ 4. Project Architecture & Directory Structure
```
ADApro/
├── index.html                   # Interactive SCADA Power Dispatcher Web Application
├── style.css                    # SCADA Dark Glassmorphism Stylesheet
├── app.js                       # Core JavaScript Graph Engine, Visualizer & Benchmarks
├── server.js                    # Zero-dependency local Node.js web server
├── package.json                 # Project configuration & npm start script
├── src_cpp/
│   └── power_grid_simulator.cpp # Complete C++17 implementation for university viva
├── src_python/
│   └── power_grid_simulator.py  # Python 3 implementation with CLI & automated benchmarks
├── presets/
│   └── delhi_ncr_grid.json      # Faculty of Technology / Delhi NCR 12-Node Preset
└── README.md                    # Comprehensive Project Documentation & Viva Guide
```

---

## 🚀 5. How to Run the Simulator

### Option A: Interactive Web Application (Recommended)
1. **Using Node.js Server:**
   ```bash
   node server.js
   ```
   Open your browser at: `http://localhost:3000`

2. **Direct Browser Open:**
   Simply double-click `index.html` or open it with any web browser (Chrome, Edge, Firefox). No build tools or internet connection required!

---

### Option B: C++ Implementation
Compile and execute using standard C++17 compiler (GCC / Clang / MSVC):
```bash
g++ -std=c++17 -O2 src_cpp/power_grid_simulator.cpp -o power_grid_sim
./power_grid_sim
```

---

### Option C: Python 3 Implementation
Execute directly with Python 3:
```bash
python src_python/power_grid_simulator.py
```

---

## 📊 6. Algorithmic Complexity Comparison

| Algorithm | Objective | Time Complexity | Space Complexity | Practical Utility in Grid Recovery |
| :--- | :--- | :--- | :--- | :--- |
| **BFS** | Reachability Scan | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Detects islanded blackout areas in linear time |
| **DFS (Tarjan)** | Bridge / Cut Detection | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Identifies vulnerable transmission lines before they trip |
| **Dijkstra** | Shortest Bypass Route | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | Routes power through least-impedance active lines |
| **Priority Queue** | Critical Facility Dispatch | $\mathcal{O}(K \cdot (V + E) \log V)$ | $\mathcal{O}(V)$ | Restores Tier 1 Hospitals and Emergency Centers first |
| **Kruskal MST** | Global Minimal Backbone | $\mathcal{O}(E \log E)$ | $\mathcal{O}(V + E)$ | Reconnects entire grid with minimal total wire impedance |
| **Prim MST** | Generator-Rooted Tree | $\mathcal{O}(E \log V)$ | $\mathcal{O}(V)$ | Energizes network starting directly from power stations |

---

## 🏥 7. Critical Facility Priority Hierarchy

| Tier | Priority Classification | Real-World Examples (Delhi NCR Preset) | Recovery Policy |
| :---: | :--- | :--- | :--- |
| **Tier 0** | **Generator Source** | Badarpur Thermal, Indraprastha Gas, Pragati CC | Supply origins; cannot be demand sinks |
| **Tier 1** | **Emergency & Health** | AIIMS Substation, Safdarjung Trauma Center | **Highest Priority:** Restored first within milliseconds |
| **Tier 2** | **Lifeline Utilities** | Delhi Jal Board Water Plant, DMRC Metro Traction | Restored second to prevent municipal collapse |
| **Tier 3** | **Commercial / Domestic** | Connaught Place NDMC, Rohini Urban Grid | Restored third after critical infrastructure is stabilized |
| **Tier 4** | **Heavy Industry** | Okhla Industrial Area Phase-III | Restored last; heavy loads deferred to prevent overload |

---

## 🎯 8. Features & Modules
1. **Interactive Real-Time HTML5 Canvas:**
   - Drag & drop substations, pan & zoom.
   - Real-time animated electron pulses along active transmission lines.
   - Pulsing red warnings on severed lines and blackout nodes.
2. **Failure Simulation Controls:**
   - Single Transmission Line cut.
   - Substation explosion / transformer fault.
   - Cascading Overload Trip (power diversion causes secondary trips).
   - Severe Storm Multi-fault event.
3. **Automated Benchmark & Comparison Suite:**
   - High-resolution execution timing in microseconds ($\mu s$).
   - Live comparison table and printable academic report generator.
4. **Preset Topologies:**
   - *Faculty of Technology - Delhi NCR Grid* (12 Nodes, 19 Lines)
   - *IEEE 14-Bus Standard Test Power System* (14 Nodes, 20 Lines)
   - *Cascading Fragile Mesh Network* (16 Nodes, 24 Lines)

---

## 🌐 9. Submission & Deployment Information

- **Source Code Repository:** GitHub Repository (configured on `main` branch)
- **Live Functional Application:** Hostable on any static web host (GitHub Pages, Vercel, Netlify) or locally executable via `index.html` / `node server.js`.
- **Presentation Decks Included:**
  - `PRESENTATION_SLIDES.pptx`: 12-slide native PowerPoint presentation
  - `Grid_Failure_Recovery.pptx`: Custom 12-slide styled presentation
  - `presentation_deck.html`: Interactive 16:9 full-screen browser presentation

