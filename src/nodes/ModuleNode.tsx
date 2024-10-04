import { Handle, NodeProps, Position } from '@xyflow/react';
import styles from '../nodes/WalletNode.module.css';
import NameInput from '../components/NameInput.tsx';
import { type ModuleNode } from '../nodes/types.ts';

export function ModuleNode({ data, id }: NodeProps<ModuleNode>) {
  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.moduleHeader}`}>
        <NameInput name={data.name} id={id} />
      </div>
      <div className={styles.body}>
        <Handle type="source" position={Position.Right} />
        <p className={styles.text}>
          Address: <span className={styles.address}>{data.address}</span>
        </p>
      </div>
    </div>
  );
}
