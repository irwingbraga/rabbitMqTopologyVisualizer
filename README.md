# RabbitMQ Topology Visualizer

A browser-based tool to visualize the complete topology of a RabbitMQ broker — exchanges, queues, bindings, and consumers — as an interactive diagram. It connects directly to the RabbitMQ Management API or accepts an exported definitions file.

---

## Features

### Visualization
- Full topology graph rendered as an interactive node-edge diagram
- Automatic left-to-right layout using the Dagre algorithm (exchanges > queues > consumers)
- Exchange nodes color-coded by type: direct (blue), fanout (green), topic (purple), headers (orange)
- Queue nodes color-coded by type: classic (teal), quorum (indigo), stream (pink)
- Consumer nodes grouped by connection and displayed in amber
- Binding edges labeled with routing keys or patterns
- Animated edges for active consumer connections
- Exchange-to-exchange bindings supported
- Visual badges for durable, auto-delete, exclusive, and internal flags
- Live message and consumer counts on queue nodes

### Data Sources
- **Management API** — connect with a URL, username, password, and optional virtual host
- **JSON import** — upload or paste a definitions file exported from the RabbitMQ Management UI
- **Sample data** — built-in demo topology to explore the tool without a live broker

### UX Tools
- Zoom, pan, and scroll powered by React Flow
- Minimap for navigating large topologies
- Fit View button to re-center the diagram
- Click any node to open a detail panel showing full metadata and connected bindings
- Clicking a node dims unrelated nodes and edges to highlight the selected path
- Search bar to filter nodes by name in real time
- Filter panel to include or exclude specific exchange types, queue types, internal exchanges, and empty queues
- Virtual host selector when multiple vhosts are present
- Stats bar showing visible vs. total count of exchanges, queues, bindings, and consumers
- Color legend always visible in the bottom-left corner

---

## Requirements

- Node.js 18 or later
- npm 9 or later
- A RabbitMQ broker with the Management Plugin enabled (if connecting via API)

---

## Quick Start

```bash
git clone https://github.com/your-username/rabbitmq-topology-visualizer.git
cd rabbitmq-topology-visualizer
./start.sh
```

The script installs dependencies on the first run and opens the app in your browser at `http://localhost:5173`.

Alternatively, run manually:

```bash
npm install
npm run dev
```

---

## Connecting to RabbitMQ

### Via Management API

1. Open the app and select the **Management API** tab
2. Enter the management URL (default: `http://localhost:15672`)
3. Enter your username and password
4. Optionally specify a virtual host to scope the diagram (leave blank to load all)
5. Click **Connect & Visualize**

The management plugin must be enabled on the broker:

```bash
rabbitmq-plugins enable rabbitmq_management
```

### Via JSON Definitions File

1. In the RabbitMQ Management UI, go to **Overview > Export definitions**
2. Download the JSON file
3. Open the app and select the **Import JSON** tab
4. Upload the file or paste the JSON directly

> Note: Definitions files do not include consumer information. Consumer nodes are only available when connecting via the live API.

---

## Project Structure

```
src/
  components/
    nodes/
      ExchangeNode.tsx       # Exchange node renderer
      QueueNode.tsx          # Queue node renderer
      ConsumerNode.tsx       # Consumer node renderer
    ConnectionPanel.tsx      # API and JSON import form
    FilterPanel.tsx          # Search, vhost selector, and filters
    NodeDetailPanel.tsx      # Slide-in detail view for selected nodes
    StatsBar.tsx             # Entity count display
    Legend.tsx               # Color reference panel
    TopologyGraph.tsx        # Main React Flow canvas
  services/
    rabbitmqApi.ts           # RabbitMQ Management API client
  store/
    topologyStore.ts         # Zustand global state
  utils/
    topologyBuilder.ts       # Graph construction and Dagre layout
    sampleData.ts            # Built-in demo definitions
  types.ts                   # TypeScript types for all RabbitMQ entities
  App.tsx                    # Root component and routing between screens
  main.tsx                   # Entry point
```

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| @xyflow/react | Interactive graph canvas |
| Dagre | Automatic graph layout |
| Zustand | State management |
| Axios | HTTP requests to the Management API |
| Tailwind CSS | Styling |
| Lucide React | Icons |

---

## CORS Considerations

When connecting to a local broker from a browser, CORS is typically not an issue since the management plugin allows cross-origin requests by default. For remote brokers with stricter CORS policies, the Vite dev server includes a proxy configuration in `vite.config.ts` that forwards requests from `/api/rabbitmq` to the target broker.

For production deployments, serve the built app behind a reverse proxy (such as Nginx) and configure it to forward Management API requests to avoid CORS restrictions.

---

## Deploying to GitHub Pages

The repository includes a GitHub Actions workflow that builds and deploys the app automatically on every push to `main`.

**One-time setup:**

1. Push this repository to GitHub
2. Go to **Settings > Pages**
3. Under **Source**, select **GitHub Actions**
4. Push any change to `main` to trigger the first deployment

The app will be live at `https://<your-username>.github.io/<repository-name>/`.

The workflow reads the repository name automatically and sets the correct base path for assets, so no manual configuration is needed.

> When the app is running on GitHub Pages it can still connect to a RabbitMQ Management API, provided the broker is reachable from the user's machine and CORS is permitted. The JSON import and sample data modes work without any network access at all.

---

## Building for Production

```bash
npm run build
```

The output is placed in the `dist/` directory and can be served by any static file server.

```bash
npm run preview
```

Serves the production build locally for verification.

---

## License

MIT
