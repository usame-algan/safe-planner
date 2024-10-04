import type { NodeTypes } from '@xyflow/react';

import { WalletNode } from './WalletNode';
import { SafeNode } from './SafeNode';
import { ModuleNode } from './ModuleNode';
import { AppNode } from './types';

export const initialNodes: AppNode[] = [
  {
    id: 'a',
    type: 'wallet',
    position: { x: 100, y: 270 },
    data: { address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', name: 'vitalik.eth' },
  },
  {
    id: 'b',
    type: 'wallet',
    position: { x: 100, y: 420 },
    data: { address: '0xcd2e72aebe2a203b84f46deec948e6465db51c75', name: 'Alice' },
  },
  {
    id: 'c',
    type: 'safe',
    position: { x: 400, y: 120 },
    data: { name: 'Treasury Safe', network: 1 },
  },
  {
    id: 'd',
    type: 'safe',
    position: { x: 400, y: 380 },
    data: { name: 'Payroll Safe', network: 1 },
  },
  {
    id: 'e',
    type: 'safe',
    position: { x: 880, y: 230 },
    data: { name: 'DAO Safe', network: 1 },
  },
  {
    id: 'f',
    type: 'wallet',
    position: { x: 100, y: 120 },
    data: { address: '0x7c68798466a7c9E048Fcb6eb1Ac3A876Ba98d8Ee', name: 'Bob' },
  },
];

export const nodeTypes = {
  wallet: WalletNode,
  safe: SafeNode,
  module: ModuleNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
