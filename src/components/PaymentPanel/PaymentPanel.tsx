import React from "react";
import { useVendingMachine } from "../../context/VendingMachineContext";
import { CASH_UNITS, CashUnit } from "../../types";
import { formatCurrency, getCashUnitText } from "../../utils";
import "./PaymentPanel.css";

const PaymentPanel: React.FC = () => {
  const {
    state,
    selectPaymentMethod,
    insertCash,
    cancelTransaction,
  } = useVendingMachine();

  const handleCashInsert = (amount: CashUnit) => {
    insertCash(amount);
  };

  return (
    <div className="payment-panel">
      <h2 className="payment-panel__title">결제 수단</h2>

      {/* 결제 수단 선택 */}
      <div className="payment-method-selector">
        <button
          className={`payment-method-btn ${
            state.selectedPaymentMethod === "cash" ? "active" : ""
          }`}
          onClick={() => selectPaymentMethod("cash")}
          disabled={state.isLoading}
        >
          💰 현금
        </button>
        <button
          className={`payment-method-btn ${
            state.selectedPaymentMethod === "card" ? "active" : ""
          }`}
          onClick={() => selectPaymentMethod("card")}
          disabled={state.isLoading}
        >
          💳 카드
        </button>
      </div>

      {/* 현금 결제 패널 */}
      {state.selectedPaymentMethod === "cash" && (
        <div className="cash-panel">
          <h3>현금 투입</h3>
          <div className="cash-buttons">
            {CASH_UNITS.map((unit) => (
              <button
                key={unit}
                className="cash-btn"
                onClick={() => handleCashInsert(unit)}
                disabled={state.isLoading}
              >
                <span className="cash-btn__amount">{formatCurrency(unit)}</span>
                <span className="cash-btn__text">{getCashUnitText(unit)}</span>
              </button>
            ))}
          </div>

          <div className="cash-panel__info">
            <p>💡 원하는 금액만큼 여러 번 투입할 수 있습니다</p>
          </div>
        </div>
      )}

      {/* 카드 결제 패널 */}
      {state.selectedPaymentMethod === "card" && (
        <div className="card-panel">
          <h3>카드 결제</h3>
          <div className="card-panel__notice">
            <p>🔔 음료을 선택하면 자동으로 카드 결제가 진행됩니다</p>
          </div>
        </div>
      )}

      {/* 투입 금액 표시 */}
      <div className="inserted-amount">
        <h3>투입 금액</h3>
        <div className="amount-display">
          <span className="amount-value">
            {formatCurrency(state.insertedAmount)}
          </span>
        </div>
      </div>

      {/* 취소 버튼 */}
      {(state.insertedAmount > 0 || state.selectedDrink) && (
        <button
          className="vending-machine__reset-btn"
          onClick={cancelTransaction}
          disabled={state.isLoading}
        >
          거래 취소
        </button>
      )}
    </div>
  );
};

export default PaymentPanel;
