const express = require('express');
const router = express.Router();
const gremlin = require('gremlin');

const { DriverRemoteConnection } = gremlin.driver;
const { Graph } = gremlin.structure;

// Neptune endpoint
const NEPTUNE_HOST = 'db-neptune-1.cluster-cqt62osoynt7.us-east-1.neptune.amazonaws.com';
const NEPTUNE_PORT = 8182;

const gremlinUrl = `wss://${NEPTUNE_HOST}:${NEPTUNE_PORT}/gremlin`;

const getTraversal = () => {
  const connection = new DriverRemoteConnection(gremlinUrl, {
    mimeType: 'application/vnd.gremlin-v2.0+json',
    pingEnabled: false, // Neptune doesn’t support WebSocket ping
  });
  const graph = new Graph();
  return graph.traversal().withRemote(connection);
};

// Example route to fetch all patients
router.get('/patients', async (req, res) => {
  try {
    const g = getTraversal();
    const results = await g.V().hasLabel('patient').toList();
    const simplified = results.map(v => ({
      id: v.id,
      label: v.label,
      properties: v.properties,
    }));
    res.json(simplified);
  } catch (err) {
    console.error('Gremlin error:', err);
    res.status(500).json({ error: 'Neptune query failed' });
  }
});

module.exports = router;
