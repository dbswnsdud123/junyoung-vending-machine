import { VendingMachineProvider } from "./context/VendingMachineContext";
import VendingMachine from "./components/VendingMachine/VendingMachine";
import "./App.css";

function App() {
  return (
    <div className="App">
      <VendingMachineProvider>
        <VendingMachine />
      </VendingMachineProvider>
    </div>
  );
}

export default App;
