import React from "react";
import { useVendingMachine } from "../../context/VendingMachineContext";
import DrinkSelection from "../DrinkSelection/DrinkSelection";
import PaymentPanel from "../PaymentPanel/PaymentPanel";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import "./VendingMachine.css";

const VendingMachine: React.FC = () => {
  const { state, cancelTransaction } = useVendingMachine();

  return (
    <div className="vending-machine">
      <div className="vending-machine__header">
        <h1 className="vending-machine__title">🥤 자판기</h1>
        <button
          className="vending-machine__reset-btn"
          onClick={cancelTransaction}
          disabled={state.isLoading}
        >
          취소/환불
        </button>
      </div>

      <div className="vending-machine__body">
        {/* 상태 표시 영역 */}
        <StatusDisplay />

        {/* 음료 선택 영역 */}
        <DrinkSelection />

        {/* 결제 패널 영역 */}
        <PaymentPanel />
      </div>

      {/* 로딩 오버레이 */}
      {state.isLoading && (
        <div className="vending-machine__loading">
          <div className="loading-spinner"></div>
          <p>처리 중...</p>
        </div>
      )}
    </div>
  );
};

export default VendingMachine;
