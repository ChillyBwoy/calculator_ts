interface Action {
  type: string;
}

export type Update<S, A extends Action> = (
  state: S,
  action: A,
  initialState: S
) => S;

type Dispatch<A extends Action> = (action: A) => void;

type Unsubscribe = () => void;

type Subscriber<S> = (state: S) => void;

interface Store<S, A extends Action> {
  getState(): S;
  subscribe(listener: Subscriber<S>): Unsubscribe;
  dispatch: Dispatch<A>;
}

export function createStore<S, A extends Action>(
  update: Update<S, A>,
  initialState: S
): Store<S, A> {
  let subscribers: Array<Subscriber<S>> = [];
  let state = {
    ...initialState
  };

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = update(state, action, initialState);
      subscribers.forEach(s => s(state));
    },
    subscribe(listener) {
      subscribers.push(listener);
      listener(state);
      return () => {
        subscribers = subscribers.filter(s => s === listener);
      };
    }
  };
}
