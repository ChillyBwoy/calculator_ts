export interface Action {
  type: string;
}

export interface Updater<S, A extends Action> {
  init(): S;
  update(state: S, action: A): S;
}

type Subscriber<S> = (state: S) => void;

export interface Storage<S, A extends Action> {
  subscribe(listener: Subscriber<S>): () => void;
  getState(): S;
  dispatch(action: A): void;
}

class Store<S, A extends Action> implements Storage<S, A> {
  private subscribers: Array<Subscriber<S>> = [];
  private state: S;

  constructor(private updater: Updater<S, A>) {
    this.state = updater.init();
  }

  subscribe(listener: Subscriber<S>) {
    this.subscribers.push(listener);
    listener(this.state);
    return () => {
      this.subscribers = this.subscribers.filter(s => s === listener);
    };
  }

  notify(): void {
    console.log(JSON.stringify(this.state, null, 2));
    this.subscribers.forEach(s => s(this.state));
  }

  dispatch(action: A): void {
    console.log(action);
    this.state = this.updater.update(this.state, action);
    this.notify();
  }

  getState() {
    return this.state;
  }
}

export default Store;
