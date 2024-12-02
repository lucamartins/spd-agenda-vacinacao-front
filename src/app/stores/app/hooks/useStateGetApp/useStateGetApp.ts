import appStore, { AppStore } from "../../AppStore";

const useStateGetApp = <T>(selectorFn: (state: AppStore) => T): T => {
  return appStore(selectorFn);
};

export default useStateGetApp;
