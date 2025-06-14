import React, { createContext } from 'react';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  return (
    <CourseContext.Provider value={{}}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => React.useContext(CourseContext); 