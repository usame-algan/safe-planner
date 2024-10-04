import type { Node, BuiltInNode } from '@xyflow/react';

export enum SafeModule {
  SpendingLimit,
  Recovery,
}

export type WalletNode = Node<{ address: string; name: string }, 'wallet'>;
export type SafeNode = Node<{ address?: string; name: string; network?: number }, 'safe'>;
export type ModuleNode = Node<{ address: string; type: SafeModule; name: string }, 'module'>;
export type AppNode = BuiltInNode | WalletNode | SafeNode | ModuleNode;
