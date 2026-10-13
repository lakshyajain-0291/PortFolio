import type { ArchitectureSpec } from './types';

/**
 * libr, confirmed with the owner on 2026-10-13 (storage: PostgreSQL; client:
 * desktop app with a Go backend and a web UI; flows: publish, report and
 * delete, read, DHT routing). Grounded in libr-forum/libr:
 * core/mod_client/app.go, core/{mod_comm,cert_builder,send_to_db,msg_fetch,cronjob}.go,
 * core/mod_client/internal/service/moderation.go, core/mod_client/config/config.go
 * (K = 4), core/db/db_doc.md, core/db/internal/{routing/table,storage/store}.go,
 * the README, docs/libr_project_doc.txt and the co-authored paper (2025).
 */
export const LIBR: ArchitectureSpec = {
  id: 'libr',
  title: 'libr: moderated posts on a Kademlia DHT',
  caption:
    'A post is stored only after a majority of the community’s moderators sign off. The client then writes the signed certificate to the k database nodes closest to the post’s time-bucket key.',
  groups: [{ id: 'dht', label: 'Kademlia DHT' }],
  nodes: [
    {
      id: 'client',
      label: 'Desktop client',
      kind: 'client',
      tier: 0,
      lane: 1,
      description:
        'A desktop app with a Go backend and a TypeScript UI, installed through a Windows installer or an APT repository. It writes, reports and reads posts, gathers moderator verdicts and signs certificates with the user’s key.',
      source: 'libr-code',
    },
    {
      id: 'moderators',
      label: 'Moderators',
      kind: 'service',
      tier: 1,
      lane: 0,
      description:
        'Each moderator of the community scores a post with Google Cloud moderation and a forbidden-word list, then returns a signed accept or reject. Reported posts come back to them for a second decision.',
      source: 'libr-code',
    },
    {
      id: 'nlp',
      label: 'Google Cloud Natural Language',
      kind: 'external',
      tier: 2,
      lane: 0,
      description: 'The moderateText endpoint scores a post by category; each category has its own threshold.',
      source: 'libr-code',
    },
    {
      id: 'registry',
      label: 'On-chain registry',
      kind: 'external',
      tier: 3,
      lane: 0,
      status: 'planned',
      description:
        'Ethereum smart contracts for the community’s configuration, moderator elections and proof-of-service rewards for database nodes. Specified in the paper; the prototype simulates it.',
      source: 'libr-paper',
    },
    {
      id: 'bootstrap',
      label: 'Bootstrap peers',
      kind: 'service',
      tier: 1,
      lane: 2,
      group: 'dht',
      description: 'Entry points into the DHT, with fallbacks to a local node cache and well-known nodes.',
      source: 'libr-code',
    },
    {
      id: 'dbnodes',
      label: 'Database nodes',
      kind: 'cluster',
      tier: 2,
      lane: 2,
      group: 'dht',
      description:
        'Kademlia nodes with 160 k-buckets of up to k = 4 peers. The k nodes closest to a key check a certificate’s fields, the client signature and that they are among its designated storers before keeping it.',
      source: 'libr-code',
    },
    {
      id: 'store',
      label: 'PostgreSQL',
      kind: 'store',
      tier: 3,
      lane: 2,
      group: 'dht',
      description: 'Each database node keeps its certificates in PostgreSQL. A deleted post is marked, not erased.',
      source: 'libr-code',
    },
  ],
  edges: [
    { id: 'submit', from: 'client', to: 'moderators', label: 'post or report', source: 'libr-code' },
    { id: 'score', from: 'moderators', to: 'nlp', label: 'moderateText', protocol: 'HTTPS', source: 'libr-code' },
    { id: 'verdict', from: 'moderators', to: 'client', label: 'signed verdict', source: 'libr-code' },
    { id: 'lookup', from: 'client', to: 'bootstrap', label: 'find k closest', source: 'libr-code' },
    { id: 'store', from: 'client', to: 'dbnodes', label: 'store or delete certificate', source: 'libr-code' },
    { id: 'fetch', from: 'client', to: 'dbnodes', label: 'find value (read posts)', sync: false, source: 'libr-code' },
    { id: 'route', from: 'bootstrap', to: 'dbnodes', label: 'find node (k-bucket routing)', sync: false, source: 'libr-code' },
    { id: 'persist', from: 'dbnodes', to: 'store', label: 'persist', source: 'libr-code' },
    { id: 'registry', from: 'moderators', to: 'registry', label: 'registry lookup', sync: false, source: 'libr-paper' },
  ],
  flows: [
    {
      id: 'publish',
      title: 'Publish a post',
      steps: [
        { id: 'submit', title: 'Submit', text: 'The client sends the post and its timestamp to the community’s moderators.', nodes: ['client', 'moderators'], edges: ['submit'] },
        { id: 'moderate', title: 'Moderate', text: 'Each moderator scores the post with Google Cloud Natural Language and checks its forbidden-word list.', nodes: ['moderators', 'nlp'], edges: ['score'] },
        { id: 'quorum', title: 'Reach quorum', text: 'Moderators return signed verdicts. The post goes ahead only when more than half of them accept it, so with m moderators up to ⌊(m − 1)/2⌋ faulty ones can neither block nor force the decision.', nodes: ['moderators', 'client'], edges: ['verdict'] },
        { id: 'sign', title: 'Sign', text: 'The client bundles the post and the moderator signatures into a certificate and signs it with the user’s key.', nodes: ['client'], edges: [] },
        { id: 'locate', title: 'Locate storers', text: 'The post’s key is the hash of its minute. An iterative Kademlia lookup from the bootstrap peers finds the k = 4 nodes closest to that key.', nodes: ['client', 'bootstrap', 'dbnodes'], edges: ['lookup', 'route'] },
        { id: 'replicate', title: 'Replicate', text: 'The certificate is stored on those nodes, which validate it first. The write succeeds once at least half of them hold it.', nodes: ['client', 'dbnodes', 'store'], edges: ['store', 'persist'] },
      ],
    },
    {
      id: 'report',
      title: 'Report and delete',
      steps: [
        { id: 'report', title: 'Report', text: 'A reader reports a post with a reason. The client sends its certificate back to the community’s moderators.', nodes: ['client', 'moderators'], edges: ['submit'] },
        { id: 'review', title: 'Review again', text: 'Each moderator decides again. Moderators that do not answer within 3 seconds are retried later by a background job.', nodes: ['moderators', 'nlp'], edges: ['score', 'verdict'] },
        { id: 'decide', title: 'Decide', text: 'If more than half of the moderators reject the post, the client builds a report certificate carrying their signatures.', nodes: ['client', 'moderators'], edges: ['verdict'] },
        { id: 'delete', title: 'Delete', text: 'The report certificate goes to the k nodes that hold the post. Each marks it deleted in PostgreSQL rather than erasing it.', nodes: ['client', 'dbnodes', 'store'], edges: ['store', 'persist'] },
        { id: 'hide', title: 'Hide', text: 'Readers drop copies marked deleted, so the post disappears from the feed.', nodes: ['client', 'dbnodes'], edges: ['fetch'] },
      ],
    },
    {
      id: 'read',
      title: 'Read posts',
      steps: [
        { id: 'keys', title: 'Pick time buckets', text: 'Posts are keyed by the minute they were written. The client hashes each minute of the last hour to a key.', nodes: ['client'], edges: [] },
        { id: 'find', title: 'Find value', text: 'For each key it queries the nodes closest by XOR distance, three at a time, moving closer each round.', nodes: ['client', 'bootstrap', 'dbnodes'], edges: ['lookup', 'fetch'] },
        { id: 'merge', title: 'Merge', text: 'Copies from the k nodes are de-duplicated by signature, deleted ones are dropped and the rest are shown newest first.', nodes: ['client', 'dbnodes'], edges: ['fetch'] },
      ],
    },
    {
      id: 'routing',
      title: 'DHT routing',
      steps: [
        { id: 'join', title: 'Join', text: 'A node starts from the bootstrap peers, with a local cache and well-known nodes as fallbacks.', nodes: ['bootstrap', 'dbnodes'], edges: ['route'] },
        { id: 'buckets', title: 'k-buckets', text: 'Each node keeps 160 buckets indexed by XOR distance, each holding up to k = 4 peers.', nodes: ['dbnodes'], edges: [] },
        { id: 'refresh', title: 'Keep live peers', text: 'A peer seen again moves to the end of its bucket. When a bucket is full, the oldest peer is pinged and replaced only if it does not answer.', nodes: ['dbnodes'], edges: ['route'] },
        { id: 'lookup', title: 'Converge', text: 'A lookup asks the closest known peers for closer ones, halving the distance each round, so it finishes in O(log n) steps.', nodes: ['bootstrap', 'dbnodes'], edges: ['route'] },
      ],
    },
  ],
  sources: ['libr-code', 'libr-paper', 'libr-readme', 'libr-doc', 'resume', 'owner'],
  confirmed: true,
};
