import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  VendingMachineState,
  VendingMachineAction,
  INITIAL_DRINKS,
  Drink,
  PurchaseResult,
} from "../types";

// 초기 상태
const initialState: VendingMachineState = {
  drinks: INITIAL_DRINKS,
  selectedPaymentMethod: null,
  insertedAmount: 0,
  selectedDrink: null,
  transactionStatus: "idle",
  message: "음료를 선택해주세요",
  isLoading: false,
};

// Reducer 함수
const vendingMachineReducer = (
  state: VendingMachineState,
  action: VendingMachineAction
): VendingMachineState => {
  switch (action.type) {
    case "SELECT_PAYMENT_METHOD":
      return {
        ...state,
        selectedPaymentMethod: action.payload,
        message:
          action.payload === "cash"
            ? "동전이나 지폐를 넣어주세요"
            : "카드를 삽입해주세요",
        transactionStatus: "selecting",
      };

    case "INSERT_CASH":
      const newAmount = state.insertedAmount + action.payload;
      return {
        ...state,
        insertedAmount: newAmount,
        message: `투입금액: ${newAmount.toLocaleString()}원`,
      };

    case "PROCESS_CARD_PAYMENT":
      return {
        ...state,
        insertedAmount: action.payload,
        message: `카드 결제 승인: ${action.payload.toLocaleString()}원`,
      };

    case "SELECT_DRINK":
      const drink = state.drinks.find((d) => d.id === action.payload);
      if (!drink) {
        return {
          ...state,
          message: "음료를 찾을 수 없습니다",
        };
      }

      // 재고 확인
      if (drink.stock <= 0) {
        return {
          ...state,
          message: `${drink.name}은(는) 품절입니다`,
        };
      }

      // 금액 확인
      if (state.insertedAmount < drink.price) {
        return {
          ...state,
          message: `금액이 부족합니다. ${(
            drink.price - state.insertedAmount
          ).toLocaleString()}원 더 넣어주세요`,
        };
      }

      return {
        ...state,
        selectedDrink: drink,
        message: `${drink.name}을(를) 선택하셨습니다`,
        transactionStatus: "processing",
      };

    case "PROCESS_PURCHASE":
      if (!state.selectedDrink) {
        return {
          ...state,
          message: "음료를 먼저 선택해주세요",
        };
      }

      const change = state.insertedAmount - state.selectedDrink.price;
      const updatedDrinks = state.drinks.map((drink) =>
        drink.id === state.selectedDrink!.id
          ? { ...drink, stock: drink.stock - 1 }
          : drink
      );

      return {
        ...state,
        drinks: updatedDrinks,
        insertedAmount: 0,
        selectedDrink: null,
        selectedPaymentMethod: null,
        transactionStatus: "completed",
        message:
          change > 0
            ? `구매 완료! 거스름돈: ${change.toLocaleString()}원`
            : "구매 완료!",
      };

    case "CANCEL_TRANSACTION":
      const refundAmount = state.insertedAmount;
      return {
        ...initialState,
        drinks: state.drinks, // 재고는 유지
        message:
          refundAmount > 0
            ? `거래가 취소되었습니다. 환불: ${refundAmount.toLocaleString()}원`
            : "거래가 취소되었습니다",
      };

    case "RETURN_CHANGE":
      return {
        ...state,
        insertedAmount: 0,
        selectedDrink: null,
        selectedPaymentMethod: null,
        transactionStatus: "idle",
        message: "음료를 선택해주세요",
      };

    case "SET_MESSAGE":
      return {
        ...state,
        message: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "RESET_MACHINE":
      return {
        ...initialState,
        drinks: INITIAL_DRINKS, // 재고도 초기화
      };

    default:
      return state;
  }
};

// Context 타입
interface VendingMachineContextType {
  state: VendingMachineState;
  dispatch: React.Dispatch<VendingMachineAction>;
  // 헬퍼 함수들
  selectPaymentMethod: (method: "cash" | "card") => void;
  insertCash: (amount: 100 | 500 | 1000 | 5000 | 10000) => void;
  processCardPayment: (amount: number) => Promise<void>;
  selectDrink: (drinkId: string) => void;
  processPurchase: () => void;
  cancelTransaction: () => void;
  canPurchaseDrink: (drink: Drink) => boolean;
}

// Context 생성
const VendingMachineContext = createContext<VendingMachineContextType | null>(
  null
);

// Provider 컴포넌트
export const VendingMachineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(vendingMachineReducer, initialState);

  // 헬퍼 함수들
  const selectPaymentMethod = (method: "cash" | "card") => {
    dispatch({ type: "SELECT_PAYMENT_METHOD", payload: method });
  };

  const insertCash = (amount: 100 | 500 | 1000 | 5000 | 10000) => {
    dispatch({ type: "INSERT_CASH", payload: amount });
  };

  const processCardPayment = async (amount: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_MESSAGE", payload: "카드 결제 처리 중..." });

    // 카드 결제 시뮬레이션 (2초 대기)
    setTimeout(() => {
      // 90% 확률로 성공
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        dispatch({ type: "PROCESS_CARD_PAYMENT", payload: amount });
      } else {
        dispatch({
          type: "SET_MESSAGE",
          payload: "카드 결제에 실패했습니다. 다시 시도해주세요",
        });
      }

      dispatch({ type: "SET_LOADING", payload: false });
    }, 2000);
  };

  const selectDrink = (drinkId: string) => {
    dispatch({ type: "SELECT_DRINK", payload: drinkId });
  };

  const processPurchase = () => {
    dispatch({ type: "PROCESS_PURCHASE" });

    // 3초 후 초기 상태로 복귀
    setTimeout(() => {
      dispatch({ type: "RETURN_CHANGE" });
    }, 3000);
  };

  const cancelTransaction = () => {
    dispatch({ type: "CANCEL_TRANSACTION" });
  };

  const canPurchaseDrink = (drink: Drink): boolean => {
    return drink.stock > 0 && state.insertedAmount >= drink.price;
  };

  const contextValue: VendingMachineContextType = {
    state,
    dispatch,
    selectPaymentMethod,
    insertCash,
    processCardPayment,
    selectDrink,
    processPurchase,
    cancelTransaction,
    canPurchaseDrink,
  };

  return (
    <VendingMachineContext.Provider value={contextValue}>
      {children}
    </VendingMachineContext.Provider>
  );
};

// Custom Hook
export const useVendingMachine = () => {
  const context = useContext(VendingMachineContext);
  if (!context) {
    throw new Error(
      "useVendingMachine must be used within a VendingMachineProvider"
    );
  }
  return context;
};
