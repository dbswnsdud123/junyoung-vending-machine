import React from "react";
import { useVendingMachine } from "../../context/VendingMachineContext";
import {
  getDrinkEmoji,
  getStockStatus,
  getStockStatusClass,
  formatCurrency,
} from "../../utils";
import "./DrinkSelection.css";

const DrinkSelection: React.FC = () => {
  const { state, selectDrink, canPurchaseDrink, processPurchase } =
    useVendingMachine();

  const handleDrinkSelect = (drinkId: string) => {
    selectDrink(drinkId);

    // 구매 가능한 경우 자동으로 구매 처리
    const drink = state.drinks.find((d) => d.id === drinkId);
    if (drink && canPurchaseDrink(drink)) {
      setTimeout(() => {
        processPurchase();
      }, 500);
    }
  };

  return (
    <div className="drink-selection">
      <h2 className="drink-selection__title">음료 선택</h2>

      <div className="drink-grid">
        {state.drinks.map((drink) => {
          const canPurchase = canPurchaseDrink(drink);
          const isSelected = state.selectedDrink?.id === drink.id;
          const stockStatus = getStockStatus(drink.stock);
          const stockClass = getStockStatusClass(drink.stock);

          return (
            <button
              key={drink.id}
              className={`drink-item ${stockClass} ${
                isSelected ? "selected" : ""
              } ${canPurchase ? "purchasable" : ""}`}
              onClick={() => handleDrinkSelect(drink.id)}
              disabled={drink.stock === 0 || state.isLoading}
            >
              <div className="drink-item__emoji">
                {getDrinkEmoji(drink.name)}
              </div>

              <div className="drink-item__info">
                <h3 className="drink-item__name">{drink.name}</h3>
                <p className="drink-item__price">
                  {formatCurrency(drink.price)}
                </p>

                <div className="drink-item__stock">
                  <span className={`stock-badge ${stockClass}`}>
                    {stockStatus}
                  </span>
                  <span className="stock-count">재고: {drink.stock}개</span>
                </div>
              </div>

              {/* 구매 가능 표시 */}
              {canPurchase && (
                <div className="drink-item__purchase-badge">구매 가능</div>
              )}

              {/* 선택된 음료 표시 */}
              {isSelected && (
                <div className="drink-item__selected-badge">선택됨</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="drink-selection__guide">
        <p>💡 충분한 금액을 투입한 후 음료를 선택하세요</p>
        {state.insertedAmount > 0 && (
          <p>
            현재 투입금액:{" "}
            <strong>{formatCurrency(state.insertedAmount)}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default DrinkSelection;
