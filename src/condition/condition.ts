export type option = { id: string; value: string };

enum requirementState {
  setQuestion = 1,
  setQuestionCondition = 2,
  setChoice = 3,
  done = 4,
}

export type requirementData = {
  guid: string;
  option: option;
  state: requirementState;
};
export type requirementObserver = (value: requirementData[]) => void;
export type currentRequirementObserver = (value: requirementData) => void;
export class RequirementContext {
  public requirementState!: RequirementState;
  public requirementValue: RequirementState[] = [];
  private changeValueSubscribers: requirementObserver[] = [];
  private changeCurrentStateSubscriber: currentRequirementObserver[] = [];

  public notifyCurrent() {
    for (const fn of this.changeCurrentStateSubscriber) {
      fn(this.requirementState!.getData());
    }
  }

  public notify() {
    for (const fn of this.changeValueSubscribers) {
      fn(this.requirementValue.map((r) => r.getData()));
    }
  }

  public subscribe(fn: requirementObserver) {
    this.changeValueSubscribers.push(fn);
  }
  public subscribeCurrent(fn: currentRequirementObserver) {
    this.changeCurrentStateSubscriber.push(fn);
  }

  constructor() {
    // this.transitionTo(new SetQuestionState());
  }

  public transitionTo(state: RequirementState): void {
    this.requirementState = state;

    this.notifyCurrent();
    this.requirementState.setContext(this);
  }

  public build() {
    return this.requirementValue.map((r) => r.getData());
  }
}

abstract class RequirementState {
  protected requirementContext!: RequirementContext;
  guid: string;
  abstract state: requirementState;
  abstract value: option | null;
  abstract options: option[];
  public getOptions() {
    return this.options;
  }
  constructor() {
    this.guid = crypto.randomUUID();
  }

  public setContext(context: RequirementContext) {
    this.requirementContext = context;
  }

  abstract setValue(option: option): void;
  public getData(): requirementData {
    return {
      guid: this.guid,
      option: this.value!,
      state: this.state,
    };
  }
}

export class SetQuestionState extends RequirementState {
  constructor() {
    super();
  }
  state: requirementState = requirementState.setQuestion;
  value: option | null = null;
  options: option[] = [
    {
      id: 'q-1',
      value: 'q1',
    },
    {
      id: 'q-2',
      value: 'q2',
    },
  ];

  public setValue(option: option): void {
    this.value = option;
    this.requirementContext.requirementValue.push(this);
    this.requirementContext.notify();
    this.requirementContext.transitionTo(new setQuestionConditionOrChoiceState());
  }
}

export class setQuestionConditionOrChoiceState extends RequirementState {
  constructor() {
    super();
  }
  value: option | null = null;
  state: requirementState = requirementState.setQuestionCondition;
  options: option[] = [
    {
      id: 'qc1',
      value: 'atLeast',
    },
    {
      id: 'qc2',
      value: 'atMost',
    },
    {
      id: 'ch-1',
      value: 'ch1',
    },
    {
      id: 'ch-2',
      value: 'ch2',
    },
  ];

  public setValue(option: option): void {
    this.value = option;
    this.requirementContext.requirementValue.push(this);
    this.requirementContext.notify();

    if (option.id.startsWith('ch')) {
      this.requirementContext.transitionTo(new SetChoiceCondition());
    } else {
      this.requirementContext.transitionTo(new DoneState());
    }
  }
}

export class SetChoiceCondition extends RequirementState {
  constructor() {
    super();
  }
  state: requirementState = requirementState.setChoice;
  options: { id: string; value: string }[] = [{ id: '123412', value: 'choiceCondition1' }];
  value: option | null = null;
  public setValue(option: option): void {
    this.value = option;
    this.requirementContext.requirementValue.push(this);
    this.requirementContext.notify();
    this.requirementContext.transitionTo(new DoneState());
  }
}

export class DoneState extends RequirementState {
  constructor() {
    super();
  }
  state: requirementState = requirementState.done;
  value: option | null = null;
  options: option[] = [];
  setValue(option: option): void {}
}
