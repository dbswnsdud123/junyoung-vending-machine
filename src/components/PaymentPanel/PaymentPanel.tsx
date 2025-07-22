import React, { useState } from "react";
import { useVendingMachine } from "../../context/VendingMachineContext";
import { CASH_UNITS, CashUnit } from "../../types";
import { formatCurrency, getCashUnitText } from "../../utils";
import "./PaymentPanel.css";

const PaymentPanel: React.FC = () => {
  const { state, selectPaymentMethod, insertCash, processCardPayment } =
    useVendingMachine();

  const [cardAmount, setCardAmount] = useState<string>("");

  const handleCashInsert = (amount: CashUnit) => {
    insertCash(amount);
  };

  const handleCardPayment = async () => {
    const amount = parseInt(cardAmount);
    if (amount > 0) {
      await processCardPayment(amount);
      setCardAmount("");
    }
  };

  const handleQuickCardPayment = async (amount: number) => {
    await processCardPayment(amount);
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

          {/* 빠른 결제 버튼들 */}
          <div className="quick-payment">
            <h4>빠른 결제</h4>
            <div className="quick-payment-buttons">
              {[1000, 2000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  className="quick-payment-btn"
                  onClick={() => handleQuickCardPayment(amount)}
                  disabled={state.isLoading}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* 직접 입력 */}
          <div className="card-input">
            <h4>직접 입력</h4>
            <div className="card-input-group">
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                placeholder="결제 금액 입력"
                className="card-amount-input"
                disabled={state.isLoading}
                min="0"
                step="100"
              />
              <button
                className="card-payment-btn"
                onClick={handleCardPayment}
                disabled={
                  state.isLoading || !cardAmount || parseInt(cardAmount) <= 0
                }
              >
                결제
              </button>
            </div>
          </div>

          <div className="card-panel__info">
            <p>💡 카드 결제는 정확한 금액만 결제됩니다</p>
            <p>⚡ 빠른 결제 버튼으로 간편하게 충전하세요</p>
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
    </div>
  );
};

export default PaymentPanel;
