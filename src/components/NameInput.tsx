import { useState } from 'react';
import styles from '../nodes/WalletNode.module.css';
import { useReactFlow } from '@xyflow/react';

const NameInput = ({ name, id }: { name: string; id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateNodeData } = useReactFlow();

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
  };

  return (
    <input
      className={styles.nameInput}
      value={name}
      onChange={(e) => updateNodeData(id, { name: e.target.value })}
      onBlur={handleNameBlur}
      onClick={handleNameClick}
      readOnly={!isEditing}
    />
  );
};

export default NameInput;
