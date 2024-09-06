import {useLayoutEffect, useState} from "react";

export const useRefBank = <T extends any>() => {
  const [refBank] = useState<Map<string, T>>(() => new Map());

  useLayoutEffect(() => {
    return () => {
      for (const key in refBank.keys()) {
        refBank.delete(key);
      }
    };
  }, []);

  return refBank;
};
