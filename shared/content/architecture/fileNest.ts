import type { ArchitectureSpec } from './types';

/**
 * FileNest, from the owner's co-authored design paper (§4, Figures 1, 3, 5 to 8),
 * provided for this purpose on 2026-10-13. The public repository holds the README
 * and project scaffolding only, so this is a design, not a measured build.
 */
export const FILENEST: ArchitectureSpec = {
  id: 'filenest',
  title: 'FileNest: a semantic index spread across peers',
  caption:
    'Files stay in content-addressed storage. Their embeddings descend a hierarchy of tagging vectors whose state the DHT spreads across peers; a query follows only the branches that can still hold a match.',
  groups: [{ id: 'overlay', label: 'FileNest overlay (peers linked by the DHT)' }],
  nodes: [
    {
      id: 'origin',
      label: 'Origin peer',
      kind: 'client',
      tier: 0,
      lane: 0,
      description:
        'Offers a file for indexing. It stores the bytes in the storage layer, embeds the file and picks the nearest depth-1 tagging vector from its local copy of the root level, which every peer holds.',
      source: 'filenest-paper',
    },
    {
      id: 'querier',
      label: 'Querying peer',
      kind: 'client',
      tier: 0,
      lane: 1,
      description: 'Embeds the query, tests the root level locally, then merges the matches that leaves send back and ranks them by similarity.',
      source: 'filenest-paper',
    },
    {
      id: 'routers',
      label: 'Routing peers',
      kind: 'cluster',
      tier: 1,
      lane: 0,
      group: 'overlay',
      description:
        'Each holds the state of the tagging vectors it is responsible for: the running mean, a count, a covering radius and the table of children. It forwards an embedding to one child and a query to every child that passes the pruning test.',
      source: 'filenest-paper',
    },
    {
      id: 'dht',
      label: 'Kademlia DHT',
      kind: 'service',
      tier: 2,
      lane: 0,
      group: 'overlay',
      description:
        'Maps a tagging vector’s key, the hash of its value at creation and its depth, to the peer closest to that key. It decides where state lives and never compares vectors.',
      source: 'filenest-paper',
    },
    {
      id: 'leaves',
      label: 'Leaf peers',
      kind: 'cluster',
      tier: 2,
      lane: 1,
      group: 'overlay',
      description: 'At the deepest level, each entry is a content identifier, its embedding and the peers that offered it. Leaves answer queries directly to the client.',
      source: 'filenest-paper',
    },
    {
      id: 'storage',
      label: 'Content-addressed storage',
      kind: 'external',
      tier: 1,
      lane: 2,
      description: 'IPFS or a similar layer. It holds the bytes and names each object by the hash of its content. FileNest never stores the bytes.',
      source: 'filenest-paper',
    },
  ],
  edges: [
    { id: 'store', from: 'origin', to: 'storage', label: 'store bytes, receive CID', source: 'filenest-paper' },
    { id: 'index', from: 'origin', to: 'routers', label: 'INDEX(CID, embedding, origin)', source: 'filenest-paper' },
    { id: 'descend', from: 'routers', to: 'leaves', label: 'INDEX or QUERY, one depth per hop', source: 'filenest-paper' },
    { id: 'resolve', from: 'routers', to: 'dht', label: 'find the peer for the next vector', source: 'filenest-paper' },
    { id: 'query', from: 'querier', to: 'routers', label: 'QUERY(embedding, radius)', source: 'filenest-paper' },
    { id: 'result', from: 'leaves', to: 'querier', label: 'RESULT(CID, origin, similarity)', source: 'filenest-paper' },
    { id: 'fetch', from: 'querier', to: 'storage', label: 'fetch bytes by CID', source: 'filenest-paper' },
  ],
  flows: [
    {
      id: 'index',
      title: 'Index a file',
      steps: [
        { id: 'store', title: 'Store', text: 'The origin peer stores the file’s bytes in the storage layer and keeps only the content identifier (CID) it gets back.', nodes: ['origin', 'storage'], edges: ['store'] },
        { id: 'dedup', title: 'Deduplicate', text: 'If the CID is already indexed, the file is skipped: two peers offering the same file are recorded, not embedded twice.', nodes: ['origin', 'dht'], edges: [] },
        { id: 'embed', title: 'Embed', text: 'A shared encoder maps the file to an embedding, in the same space for text, images and video.', nodes: ['origin'], edges: [] },
        { id: 'root', title: 'Pick a region', text: 'The peer picks the nearest depth-1 tagging vector from its own copy of the root level.', nodes: ['origin'], edges: [] },
        { id: 'descend', title: 'Descend', text: 'INDEX moves one depth per hop. Each peer assigns the embedding to its nearest child within that depth’s threshold, or creates a new child, then updates the child’s mean and covering radius.', nodes: ['origin', 'routers', 'dht'], edges: ['index', 'resolve', 'descend'] },
        { id: 'leaf', title: 'Record', text: 'The leaf stores the CID, the embedding and the origin peer.', nodes: ['routers', 'leaves'], edges: ['descend'] },
      ],
    },
    {
      id: 'query',
      title: 'Resolve a query',
      steps: [
        { id: 'embed', title: 'Embed', text: 'The querying peer embeds the query and turns its similarity threshold into an angular match radius.', nodes: ['querier'], edges: [] },
        { id: 'test', title: 'Test the root', text: 'It tests the root level locally and keeps only the vectors whose covering disc overlaps the query’s disc.', nodes: ['querier'], edges: [] },
        { id: 'forward', title: 'Forward', text: 'QUERY goes only to those vectors’ peers. Each reached peer applies the same test to its own children, so whole subtrees are never contacted.', nodes: ['querier', 'routers', 'dht', 'leaves'], edges: ['query', 'resolve', 'descend'] },
        { id: 'return', title: 'Return', text: 'Leaves send every entry within the match radius straight back to the querying peer.', nodes: ['leaves', 'querier'], edges: ['result'] },
        { id: 'rank', title: 'Rank', text: 'The querying peer merges the answers and ranks them by similarity.', nodes: ['querier'], edges: [] },
        { id: 'fetch', title: 'Fetch', text: 'It fetches the bytes of the chosen results from the storage layer by CID.', nodes: ['querier', 'storage'], edges: ['fetch'] },
      ],
    },
    {
      id: 'placement',
      title: 'Place a tagging vector',
      steps: [
        { id: 'region', title: 'Which region', text: 'Similarity decides the region: an embedding joins the nearest tagging vector, under a threshold that tightens with depth.', nodes: ['routers'], edges: [] },
        { id: 'key', title: 'Which key', text: 'The vector’s key is the hash of its value at creation and its depth. The vector keeps moving, but the key never changes, so its state can always be found.', nodes: ['routers', 'dht'], edges: ['resolve'] },
        { id: 'peer', title: 'Which peer', text: 'The peer closest to the key holds the state. Neighbouring regions hash to unrelated peers, so no peer holds a whole subtree.', nodes: ['dht', 'routers', 'leaves'], edges: ['resolve'] },
      ],
    },
    {
      id: 'pruning',
      title: 'Keep pruning safe',
      steps: [
        { id: 'mean', title: 'Move the vector', text: 'Each new embedding pulls its tagging vector a fraction 1/(c + 1) of the way toward it, the running mean of everything assigned so far.', nodes: ['routers'], edges: [] },
        { id: 'radius', title: 'Grow the radius', text: 'The covering radius grows by the distance the vector moved, or to the new embedding if that is farther, so it still bounds every embedding below.', nodes: ['routers'], edges: [] },
        { id: 'prune', title: 'Prune', text: 'If the query is farther from a vector than the match radius plus the covering radius, the triangle inequality proves nothing below it matches, and the subtree is skipped.', nodes: ['routers', 'leaves'], edges: ['descend'] },
      ],
    },
  ],
  sources: ['filenest-paper', 'filenest-readme'],
  confirmed: true,
};
