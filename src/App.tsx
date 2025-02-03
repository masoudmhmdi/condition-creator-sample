import { useEffect, useState } from 'react';
import './App.css';
import { RequirementContext, requirementData, SetQuestionState } from './condition/condition';

const requirementContext = new RequirementContext();
function App() {
  const [value, setValue] = useState<requirementData[]>([]);
  const [currentValue, setCurrentValue] = useState<requirementData | null>(null);

  useEffect(() => {
    requirementContext.subscribe((data: requirementData[]) => {
      setValue(structuredClone(data));
    });
    requirementContext.subscribeCurrent((data: requirementData) => {
      setCurrentValue(structuredClone(data));
    });
    requirementContext.transitionTo(new SetQuestionState());
  }, []);

  return (
    <>
      <h2>current:</h2>
      <div>
        {requirementContext.requirementState?.getOptions().map((o, i) => (
          <button key={i} style={{ cursor: 'pointer' }} onClick={() => requirementContext.requirementState.setValue(o)}>
            {o.value}
          </button>
        ))}
      </div>
      ------------------------
      <h2>list:</h2>
      {value.map((v, i) => {
        return <span key={i}>-----{v.option.value}-----</span>;
      })}
      <button onClick={() => console.log(requirementContext.build())}>build</button>
    </>
  );
}

export default App;
