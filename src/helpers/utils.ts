import { Edge, useReactFlow } from '@xyflow/react';
import { Node } from '@xyflow/react/dist/esm/types';
import { GeneralHelpers } from '@xyflow/react/dist/esm/types/instance';

export const shortenAddress = (address: string, length = 4): string => {
  if (!address) {
    return '';
  }

  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
};

export function downloadCSV(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);

  // Append to the document to make it clickable
  document.body.appendChild(link);

  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportData(nodes: Node[], edges: Edge[]) {
  const csvLines: string[] = [];
  csvLines.push('safeAddress,name,owners,numberOfOwners');

  const safes = nodes.filter((node) => node.type === 'safe');

  const nodeMap = new Map<string, unknown>();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
  });

  safes.forEach((safe) => {
    // Find edges where target is the safe
    const relatedEdges = edges.filter((edge) => edge.target === safe.id);

    // For each edge, get the source node (wallet)
    const owners = relatedEdges
      .map((edge) => {
        const ownerNode = nodeMap.get(edge.source);
        if (ownerNode) {
          const name = ownerNode.data.name;
          const address = ownerNode.data.address;
          return `${name}_${address}`;
        } else {
          return null;
        }
      })
      .filter((owner) => owner !== null);

    const ownersString = owners.join(';');
    const numberOfOwners = owners.length;
    const line = `${safe.data.address},${safe.data.name},"${ownersString}",${numberOfOwners}`;

    csvLines.push(line);
  });

  const csvContent = csvLines.join('\n');
  downloadCSV(csvContent, 'output.csv');
}

export function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i - 1] !== '\\') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }
  result.push(current);

  return result;
}

export function importData(
  csvContent: string,
  addNodes: GeneralHelpers['addNodes'],
  addEdges: GeneralHelpers['addEdges']
) {
  // Split CSV content into lines
  const lines = csvContent.trim().split('\n');

  // Remove header line
  const header = lines.shift();

  if (!header) {
    console.error('CSV content is empty or invalid.');
    return;
  }

  const safeNodes = [];
  const walletNodes = [];
  const edges = [];

  lines.forEach((line, index) => {
    // Split the line into columns, considering quoted fields
    const columns = parseCSVLine(line);

    if (columns.length < 4) {
      console.warn(`Skipping invalid line ${index + 2}: ${line}`);
      return;
    }

    const [safeAddress, safeName, ownersString] = columns;

    // Create or retrieve the safe node
    const safeNode = {
      id: `safe-${safeAddress}`,
      type: 'safe',
      data: {
        address: safeAddress,
        name: safeName,
      },
      position: { x: 300, y: index * 220 },
    };
    safeNodes.push(safeNode);

    // Process owners
    const ownersList = ownersString.split(';').map((ownerStr) => {
      const [name, address] = ownerStr.split('_');
      return { name, address };
    });

    ownersList.forEach((owner, index) => {
      const isOwnerASafe = safeNodes.find((safe) => safe.data.address === owner.address);

      if (isOwnerASafe) {
        safeNode.position = { x: safeNode.position.x + 450, y: safeNode.position.y - 330 };
      }

      const walletNode = {
        id: isOwnerASafe ? `safe-${owner.address}` : `wallet-${owner.address}`,
        type: 'wallet',
        data: {
          address: owner.address,
          name: owner.name,
        },
        position: { x: 0, y: index * 150 },
      };

      if (safeNodes.every((safe) => safe.data.address !== owner.address)) {
        walletNodes.push(walletNode);
      }

      // Create an edge between the wallet and the safe
      const edge = {
        id: `edge-${walletNode.id}-${safeNode.id}`,
        source: walletNode.id,
        target: safeNode.id,
      };
      edges.push(edge);
    });
  });

  addNodes([...safeNodes, ...walletNodes]);
  addEdges(edges);
}
