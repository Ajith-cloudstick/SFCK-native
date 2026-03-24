import React, { createContext, useState, useEffect } from 'react';
import { INITIAL_EMPLOYEES, INITIAL_WORK_ITEMS } from '../data/mockData';

export const AppContext = createContext();

const LATE_CUTOFF_HOUR = 8;
const LATE_CUTOFF_MIN = 30;

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('default'); // 'default' | 'late'
  const [supervisorEstate, setSupervisorEstateState] = useState(null);

  useEffect(() => {
    setEmployees(INITIAL_EMPLOYEES);
    setWorkItems(INITIAL_WORK_ITEMS);
  }, []);

  const setSupervisorEstate = (estateName) => {
    setSupervisorEstateState(estateName);
  };

  const showToast = (message, type = 'default') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
      setToastType('default');
    }, 2400);
  };

  const markEmployee = (id) => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(LATE_CUTOFF_HOUR, LATE_CUTOFF_MIN, 0, 0);
    const isLateNow = now >= cutoff;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        if (emp.status === 'present') {
          // Undo — reset to pending
          return { ...emp, status: 'pending', isLate: false };
        } else {
          // Mark present
          return { ...emp, status: 'present', isLate: isLateNow };
        }
      }
      return emp;
    }));

    return isLateNow;
  };

  const assignToWorkItem = (itemId, empId) => {
    setWorkItems(prev => prev.map(item => {
      if (item.id === itemId) {
        if (item.assignedEmpIds.includes(empId)) return item;
        return { ...item, assignedEmpIds: [...item.assignedEmpIds, empId] };
      }
      return item;
    }));
  };

  const removeFromWorkItem = (itemId, empId) => {
    setWorkItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, assignedEmpIds: item.assignedEmpIds.filter(id => id !== empId) };
      }
      return item;
    }));
  };

  const addCollection = (collection) => {
    setCollections(prev => [
      { ...collection, id: Date.now().toString(), timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  return (
    <AppContext.Provider value={{
      employees, workItems, collections,
      toastMessage, toastType,
      supervisorEstate, setSupervisorEstate,
      showToast, markEmployee,
      assignToWorkItem, removeFromWorkItem, addCollection,
    }}>
      {children}
    </AppContext.Provider>
  );
};
