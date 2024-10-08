export function shallowEqualArray(arr1: Array<any>, arr2: Array<any>) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!Object.is(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
}
