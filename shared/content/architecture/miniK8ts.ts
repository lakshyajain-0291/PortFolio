import type { ArchitectureSpec } from './types';

/**
 * Mini-K8ts, confirmed with the owner on 2026-10-13: where the report and the
 * code differ, the report's stated behaviour is used. Grounded in
 * lakshyajain-0291/mini-k8ts: cmd/{scheduler,worker,cli}/main.go,
 * internal/scheduler/{service,strategy,leader}.go, internal/db/postgres.go,
 * internal/config/config.go, deployments/{docker-compose,prometheus}.yml,
 * deployments/k8s/scheduler.yaml, the README and the report (§4, §5).
 */
export const MINI_K8TS: ArchitectureSpec = {
  id: 'mini-k8ts',
  title: 'Mini-K8ts: a lease-gated scheduler over PostgreSQL',
  caption:
    'Workers pull their tasks from the control plane over HTTP. Every 2 seconds the replica holding the lease filters, scores and binds pending tasks in PostgreSQL, which holds all cluster state.',
  groups: [{ id: 'cp', label: 'Control plane replica' }],
  nodes: [
    {
      id: 'cli',
      label: 'm8s CLI',
      kind: 'client',
      tier: 0,
      lane: 0,
      description: 'A Go CLI over the REST API for submitting tasks and jobs, setting autoscaling, listing nodes and following logs.',
      source: 'k8ts-report',
    },
    {
      id: 'api',
      label: 'API server',
      kind: 'service',
      tier: 1,
      lane: 0,
      group: 'cp',
      description:
        'REST on port 8080 with token auth, RBAC, rate limiting and optional mTLS. It records submitted tasks as PENDING, takes worker registrations and heartbeats, serves each worker its task list and exposes Prometheus metrics.',
      source: 'k8ts-code',
    },
    {
      id: 'scheduler',
      label: 'Scheduler loop',
      kind: 'service',
      tier: 1,
      lane: 1,
      group: 'cp',
      description:
        'A goroutine in the same binary. Every 2 seconds it runs five passes in order: reconcile state, stuck tasks, failure recovery, job autoscaling, then placement. Only the replica holding the lease runs them.',
      source: 'k8ts-code',
    },
    {
      id: 'workers',
      label: 'Worker agents',
      kind: 'cluster',
      tier: 2,
      lane: 0,
      description:
        'One stateless agent per node. Every 2 seconds it sends a heartbeat with its CPU and memory use, fetches its assigned tasks and reconciles them against the containers actually running.',
      source: 'k8ts-code',
    },
    {
      id: 'store',
      label: 'PostgreSQL',
      kind: 'store',
      tier: 2,
      lane: 1,
      description:
        'The only stateful part: nodes with their reliability history, tasks, allocations, jobs, namespace quotas, secrets and the scheduler lease row.',
      source: 'k8ts-report',
    },
    {
      id: 'docker',
      label: 'Docker Engine',
      kind: 'external',
      tier: 3,
      lane: 0,
      description: 'Runs each task as a container. The worker starts it, waits on its exit code and stops orphaned containers.',
      source: 'k8ts-code',
    },
    {
      id: 'metrics',
      label: 'Prometheus and Grafana',
      kind: 'service',
      tier: 0,
      lane: 1,
      description: 'Prometheus scrapes the control plane; a Grafana dashboard shows scheduling latency, node reliability, the pending queue and leader status.',
      source: 'k8ts-report',
    },
  ],
  edges: [
    { id: 'submit', from: 'cli', to: 'api', label: 'submit, list, logs', protocol: 'HTTP', source: 'k8ts-code' },
    { id: 'state', from: 'api', to: 'store', label: 'record tasks and heartbeats', protocol: 'SQL', source: 'k8ts-code' },
    { id: 'schedule', from: 'scheduler', to: 'store', label: 'renew lease, then filter, score and bind', protocol: 'SQL', source: 'k8ts-code' },
    { id: 'sync', from: 'workers', to: 'api', label: 'heartbeat, fetch tasks, report status', protocol: 'HTTP', source: 'k8ts-code' },
    { id: 'run', from: 'workers', to: 'docker', label: 'start, wait, stop containers', source: 'k8ts-code' },
    { id: 'scrape', from: 'metrics', to: 'api', label: 'scrape /metrics', sync: false, source: 'k8ts-code' },
  ],
  flows: [
    {
      id: 'schedule',
      title: 'Schedule a task',
      steps: [
        { id: 'submit', title: 'Submit', text: 'The CLI posts a task with its image, CPU, memory and a priority from 0 to 10. The API stores it as PENDING.', nodes: ['cli', 'api', 'store'], edges: ['submit', 'state'] },
        { id: 'lease', title: 'Hold the lease', text: 'On each 2-second tick every replica tries to renew the lease row. Only the holder goes on to schedule.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'filter', title: 'Filter', text: 'Nodes that are not READY, lack CPU or memory headroom, or fall below a reliability threshold that rises with the task’s priority are dropped. Tasks of priority 7 or more only land on nodes with a profile score of at least 0.70.', nodes: ['scheduler'], edges: [] },
        { id: 'score', title: 'Score', text: 'The rest are ranked by 0.55 × reliability profile plus 0.35 × resource fit, minus fragmentation, wasted headroom and a risk penalty that grows with priority.', nodes: ['scheduler'], edges: [] },
        { id: 'bind', title: 'Bind', text: 'One transaction marks the task RUNNING on the best node and records the allocation. The scheduler deducts the task from that node in a local shadow map, so later tasks in the same tick cannot over-commit it before its next heartbeat.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'run', title: 'Run', text: 'On its next tick the worker fetches its task list, starts the container and reports COMPLETED or FAILED from the exit code.', nodes: ['workers', 'api', 'docker'], edges: ['sync', 'run'] },
      ],
    },
    {
      id: 'heal',
      title: 'Recover from a node failure',
      steps: [
        { id: 'silence', title: 'Heartbeats stop', text: 'A worker crashes or loses its link, and its heartbeats stop arriving.', nodes: ['workers', 'api'], edges: ['sync'] },
        { id: 'down', title: 'Mark down', text: 'A node that misses two heartbeats is marked DOWN, 4 seconds after its last one in the report’s tests, and its reliability score drops.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'requeue', title: 'Requeue', text: 'Within 2 seconds every RUNNING task on it goes back to PENDING. Retries back off exponentially, and a task that has failed three times stays FAILED.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'replace', title: 'Reschedule', text: 'The placement pass binds the requeued tasks to healthy nodes, and their workers pick them up on the next poll.', nodes: ['scheduler', 'workers', 'api'], edges: ['schedule', 'sync'] },
      ],
    },
    {
      id: 'failover',
      title: 'Fail over the scheduler',
      steps: [
        { id: 'replicas', title: 'Replicas', text: 'Every control-plane replica serves the API, but only the one holding the lease runs the scheduling loop.', nodes: ['api', 'scheduler'], edges: [] },
        { id: 'renew', title: 'Renew', text: 'The holder renews the lease row on every tick, in a conditional UPDATE that only succeeds for the holder or once the lease has expired.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'takeover', title: 'Take over', text: 'If the holder stops renewing for the lease duration (10 seconds by default), the next replica to try takes the lease and starts scheduling.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
      ],
    },
    {
      id: 'autoscale',
      title: 'Autoscale a job',
      steps: [
        { id: 'declare', title: 'Declare', text: 'A job sets a replica count and optional bounds: minimum and maximum replicas, a pending-queue threshold, a step size and a CPU floor.', nodes: ['cli', 'api', 'store'], edges: ['submit', 'state'] },
        { id: 'up', title: 'Scale up', text: 'In the job pass, if the job’s pending tasks reach the threshold, it adds one step of replicas, up to the maximum.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
        { id: 'down', title: 'Scale down', text: 'If cluster CPU use falls to the floor or below, it removes one replica, down to the minimum.', nodes: ['scheduler', 'store'], edges: ['schedule'] },
      ],
    },
  ],
  sources: ['k8ts-code', 'k8ts-readme', 'k8ts-report', 'resume'],
  confirmed: true,
};
