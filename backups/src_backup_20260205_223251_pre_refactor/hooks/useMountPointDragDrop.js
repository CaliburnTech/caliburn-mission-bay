import { useState, useCallback } from 'react';

/**
 * Custom hook for managing drag-and-drop between mount points in the Outfitter.
 * Handles both capability movement between mounts and visual feedback state.
 *
 * @param {Function} moveCapability - Store function to move capability from one mount to another
 * @returns {Object} Drag-drop state and handlers
 */
const useMountPointDragDrop = (moveCapability) => {
  // Track which mount point is being dragged from
  const [draggingFromMount, setDraggingFromMount] = useState(null);

  /**
   * Start dragging a capability from a mount point
   */
  const handleDragStart = useCallback((e, mountName, isEquipped) => {
    if (!isEquipped) {
      e.preventDefault();
      return false;
    }
    setDraggingFromMount(mountName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', mountName);
    return true;
  }, []);

  /**
   * End drag operation
   */
  const handleDragEnd = useCallback(() => {
    setDraggingFromMount(null);
  }, []);

  /**
   * Handle drag over a potential drop target
   */
  const handleDragOver = useCallback((e, targetMount) => {
    if (draggingFromMount && draggingFromMount !== targetMount) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  }, [draggingFromMount]);

  /**
   * Handle drop on a mount point
   */
  const handleDrop = useCallback((e, targetMount) => {
    e.preventDefault();
    const fromMount = e.dataTransfer.getData('text/plain');
    if (fromMount && fromMount !== targetMount) {
      moveCapability(fromMount, targetMount);
    }
    setDraggingFromMount(null);
  }, [moveCapability]);

  /**
   * Check if a mount is the current drag source
   */
  const isDragSource = useCallback((mountName) => {
    return draggingFromMount === mountName;
  }, [draggingFromMount]);

  /**
   * Check if a mount is a valid drop target
   */
  const isDropTarget = useCallback((mountName) => {
    return draggingFromMount && draggingFromMount !== mountName;
  }, [draggingFromMount]);

  return {
    draggingFromMount,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    isDragSource,
    isDropTarget
  };
};

export default useMountPointDragDrop;
