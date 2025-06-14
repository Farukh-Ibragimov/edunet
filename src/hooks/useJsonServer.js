import { useState, useEffect, useCallback } from 'react';

const useJsonServer = (url) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsPending(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw Error('Could not fetch the data for that resource');
      }
      const result = await response.json();
      setData(result);
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      setError(err.message);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isPending, error, refetch };
};

export default useJsonServer; 