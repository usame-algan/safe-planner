import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'a->c', source: 'a', target: 'c' },
  { id: 'b->c', source: 'b', target: 'c' },
  { id: 'b->d', source: 'b', target: 'd' },
  { id: 'c->e', source: 'c', target: 'e' },
  { id: 'f->c', source: 'f', target: 'c' },
];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
