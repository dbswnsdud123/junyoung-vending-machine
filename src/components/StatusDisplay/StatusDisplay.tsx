import React from "react";
import { useVendingMachine } from "../../context/VendingMachineContext";
import {
  getTransactionStatusText,
  formatCurrency,
  calculateChange,
  formatChangeDetails,
} from "../../utils";
import "./StatusDisplay.css";

const StatusDisplay: React.FC = () => {
  const { state } = useVendingMachine();

  const getStatusIcon = () => {
    switch (state.transactionStatus) {
      case "idle":
        return "⏳";
      case "selecting":
        return "🔍";
      case "processing":
        return "⚙️";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      case "error":
        return "⚠️";
      default:
        return "⏳";
    }
  };

  const getStatusColor = () => {
    switch (state.transactionStatus) {
      case "completed":
        return "success";
      case "error":
      case "cancelled":
        return "error";
      case "processing":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div className="status-display">
      <div className="status-header">
        <h2 className="status-title">자판기 상태</h2>
      </div>

      {/* 현재 상태 */}
      <div className={`status-card status-card--${getStatusColor()}`}>
        <div className="status-icon">{getStatusIcon()}</div>
        <div className="status-content">
          <h3 className="status-label">
            {getTransactionStatusText(state.transactionStatus)}
          </h3>
          <p className="status-message">{state.message}</p>
        </div>
      </div>

      {/* 거래 정보 */}
      <div className="transaction-info">
        <div className="info-grid">
          {/* 투입 금액 */}
          <div className="info-item">
            <span className="info-label">투입 금액</span>
            <span className="info-value info-value--amount">
              {formatCurrency(state.insertedAmount)}
            </span>
          </div>

          {/* 결제 수단 */}
          <div className="info-item">
            <span className="info-label">결제 수단</span>
            <span className="info-value">
              {state.selectedPaymentMethod
                ? state.selectedPaymentMethod === "cash"
                  ? "💰 현금"
                  : "💳 카드"
                : "미선택"}
            </span>
          </div>

          {/* 선택된 음료 */}
          <div className="info-item">
            <span className="info-label">선택 음료</span>
            <span className="info-value">
              {state.selectedDrink ? (
                <>
                  {state.selectedDrink.name} (
                  {formatCurrency(state.selectedDrink.price)})
                </>
              ) : (
                "미선택"
              )}
            </span>
          </div>

          {/* 거스름돈 (구매 완료 시) */}
          {state.transactionStatus === "completed" && state.selectedDrink && (
            <div className="info-item info-item--change">
              <span className="info-label">거스름돈</span>
              <span className="info-value info-value--change">
                {(() => {
                  const change =
                    state.insertedAmount +
                    state.selectedDrink.price -
                    state.selectedDrink.price;
                  const changeAmount = Math.max(0, change);
                  return formatCurrency(changeAmount);
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 잔돈 상세 (현금 결제 시) */}
      {state.selectedPaymentMethod === "cash" &&
        state.transactionStatus === "completed" &&
        state.selectedDrink && (
          <div className="change-details">
            <h4>잔돈 내역</h4>
            <div className="change-breakdown">
              {(() => {
                const changeAmount = Math.max(
                  0,
                  state.insertedAmount - state.selectedDrink.price
                );
                const changeBreakdown = calculateChange(changeAmount);
                return formatChangeDetails(changeBreakdown);
              })()}
            </div>
          </div>
        )}

      {/* 재고 현황 */}
      <div className="inventory-status">
        <h4>재고 현황</h4>
        <div className="inventory-grid">
          {state.drinks.map((drink) => (
            <div key={drink.id} className="inventory-item">
              <span className="inventory-name">{drink.name}</span>
              <span
                className={`inventory-stock ${
                  drink.stock === 0
                    ? "out-of-stock"
                    : drink.stock <= 3
                    ? "low-stock"
                    : ""
                }`}
              >
                {drink.stock}개
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
