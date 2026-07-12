import { useState, useEffect, useRef } from 'react';
import { Task, BoardDataV2 } from '../types';
import { isVersion1, migrateV1ToV2 } from '../utils/migration';
import { useToast } from './useToast';

const STORAGE_KEY = 'workflow_board_data';

export const useLocalStorage = () => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const { addToast } = useToast();
  const migrationTriggered = useRef(false);

  // Initialize and check for migrations
  useEffect(() => {
    try {
      const storedDataString = localStorage.getItem(STORAGE_KEY);
      
      if (!storedDataString) {
        // No data, initialize empty
        setTasksState([]);
        return;
      }

      const parsedData = JSON.parse(storedDataString);

      if (isVersion1(parsedData)) {
        // Run migration
        const migratedTasks = migrateV1ToV2(parsedData);
        const updatedData: BoardDataV2 = {
          version: 2,
          tasks: migratedTasks,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        setTasksState(migratedTasks);
        
        // Show Toast notification (prevent duplicate triggering on strict mode re-mount)
        if (!migrationTriggered.current) {
          migrationTriggered.current = true;
          // Trigger alert
          setTimeout(() => {
            addToast('Legacy database migrated successfully to Version 2 schema!', 'info', 5000);
          }, 500);
        }
      } else {
        // Load version 2 tasks
        setTasksState(parsedData.tasks || []);
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      addToast('Storage access failed. Changes will not persist.', 'error', 4000);
    }
  }, [addToast]);

  const setTasks = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    try {
      setTasksState((prev) => {
        const resolvedTasks = typeof newTasks === 'function' ? newTasks(prev) : newTasks;
        const dataToStore: BoardDataV2 = {
          version: 2,
          tasks: resolvedTasks,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        return resolvedTasks;
      });
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
      addToast('Local storage is full or disabled. Cannot save.', 'error', 4000);
    }
  };

  return { tasks, setTasks };
};
