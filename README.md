#### Project Structure

placement-scheduler/

│

├── data/

│   └── seed.json

│

├── packages/

│   ├── engine/

|   |   └── scripts/

|   |   └── helper/

│   │   ├── constraints.js

│   │   ├── disruption.js

│   │   ├── failureExplainer.js

│   │   ├── feasibility.js

│   │   ├── generator.js

│   │   ├── index.js

│   │   ├── metrics.js

│   │   ├── policy.js

│   │   ├── recruiterData.js

│   │   ├── repair.js

│   │   ├── replan.js

│   │   ├── scheduler.js

│   │   ├── timeGrid.js

│   │   ├── types.js

│   │

│   ├── server/

│   │   └── src/

│   │       ├── index.js

│   │       ├── app.js

│   │       ├── config/

│   │       ├── routes/

│   │       ├── controllers/

│   │       ├── services/

│   │       ├── state/

│   │       ├── utils/

│   │       ├── websocket/

│   │       └── middleware/

│   │

│   └── client/

│       ├── src/

│       │   ├── api/

│       │   ├── components/

│       │   ├── hooks/

│       │   ├── styles/

│       │   ├── App.jsx

│       │   └── main.jsx

│       ├── index.html

│       └── vite.config.js

│

└── package.json


#### Install Dependencies

```
cd packages/server && npm install
```

```
cd packages/client && npm install
```

#### Generate Dataset

```
node packages/engine/scripts/runGenerator.js
```

#### Run Scheduling Engine 

```
node packages/engine/scripts/runScheduler.js
```

#### Starting the Server

```
cd packages/server && npm run dev
```

#### Starting the Client

```
cd packages/client && npm run dev
``` 