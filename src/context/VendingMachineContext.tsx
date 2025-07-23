import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  VendingMachineState,
  VendingMachineAction,
  INITIAL_DRINKS,
  Drink,
} from "../types";

// 초기 상태
const initialState: VendingMachineState = {
  drinks: INITIAL_DRINKS,
  selectedPaymentMethod: null,
  insertedAmount: 0,
  selectedDrink: null,
  transactionStatus: "idle",
  message: "결제 수단을 먼저 선택해주세요",
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
        // 결제 수단 변경 시 거래 관련 상태 초기화
        insertedAmount: 0,
        selectedDrink: null,
        transactionStatus: "idle",
        isLoading: false,
        message:
          action.payload === "cash"
            ? "동전이나 지폐를 넣어주세요"
            : "음료을 선택해주세요",
      };

    case "INSERT_CASH":
      const newAmount = state.insertedAmount + action.payload;
      return {
        ...state,
        insertedAmount: newAmount,
        message: `투입금액: ${newAmount.toLocaleString()}원`,
      };

    case "SELECT_DRINK":
      const drink = state.drinks.find((d) => d.id === action.payload);
      if (!drink) {
        return {
          ...state,
          message: "음료을 찾을 수 없습니다",
        };
      }
      if (drink.stock <= 0) {
        return {
          ...state,
          message: `${drink.name}은(는) 품절입니다`,
        };
      }

      // 현금 결제인 경우
      if (state.selectedPaymentMethod === "cash") {
        if (state.insertedAmount < drink.price) {
          return {
            ...state,
            message: `금액이 부족합니다. ${
              drink.price - state.insertedAmount
            }원 더 넣어주세요`,
          };
        }
        return {
          ...state,
          selectedDrink: drink,
          message: `${drink.name}을(를) 선택하셨습니다`,
          transactionStatus: "processing",
        };
      }

      // 카드 결제인 경우 - 음료 선택 시 바로 카드 결제 처리
      if (state.selectedPaymentMethod === "card") {
        // 카드 결제 시뮬레이션 (90% 성공률)
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
          return {
            ...state,
            selectedDrink: drink,
            insertedAmount: drink.price,
            message: `카드 결제 승인: ${drink.price.toLocaleString()}원`,
            transactionStatus: "processing",
          };
        } else {
          return {
            ...state,
            selectedDrink: drink,
            message: "카드 결제에 실패했습니다. 다시 시도해주세요",
            transactionStatus: "error",
          };
        }
      }

      // 결제 방법이 선택되지 않은 경우
      return {
        ...state,
        selectedDrink: drink,
        message: `${drink.name}을(를) 선택하셨습니다. 결제 방법을 선택해주세요`,
        transactionStatus: "selecting",
      };

    case "PROCESS_PURCHASE":
      if (!state.selectedDrink) {
        return {
          ...state,
          message: "음료를 먼저 선택해주세요",
          isLoading: false,
        };
      }

      const updatedDrinks = state.drinks.map((drink) =>
        drink.id === state.selectedDrink!.id
          ? { ...drink, stock: drink.stock - 1 }
          : drink
      );

      // 카드 결제와 현금 결제 구분
      const isCardPayment = state.selectedPaymentMethod === "card";
      const change = isCardPayment
        ? 0
        : state.insertedAmount - state.selectedDrink.price;

      return {
        ...state,
        drinks: updatedDrinks,
        insertedAmount: 0,
        selectedDrink: null,
        selectedPaymentMethod: null,
        transactionStatus: "completed",
        isLoading: false,
        message: isCardPayment
          ? `${state.selectedDrink.name} 구매 완료!`
          : change > 0
          ? `${
              state.selectedDrink.name
            } 구매 완료! 거스름돈: ${change.toLocaleString()}원`
          : `${state.selectedDrink.name} 구매 완료!`,
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
        message: "결제 수단을 먼저 선택해주세요",
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

    case "CARD_PAYMENT_FAILED":
      return {
        ...state,
        transactionStatus: "error",
        message: "카드 결제에 실패했습니다. 다시 시도해주세요.",
        isLoading: false,
        selectedDrink: null,
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

  const selectDrink = async (drinkId: string) => {
    const drink = state.drinks.find((d) => d.id === drinkId);

    // 카드 결제인 경우 비동기 처리
    if (state.selectedPaymentMethod === "card" && drink) {
      // 로딩 시작
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: "카드 결제 진행 중..." });

      // 1.5초 후 결제 결과 처리
      setTimeout(() => {
        const isSuccess = Math.random() > 0.1; // 90% 성공률

        if (isSuccess) {
          // 카드 결제 성공 시 음료 선택 상태 설정
          dispatch({
            type: "SELECT_DRINK",
            payload: drinkId,
          });

          // 잠시 후 구매 완료 처리
          setTimeout(() => {
            dispatch({ type: "PROCESS_PURCHASE" });
          }, 1000);
        } else {
          dispatch({ type: "CARD_PAYMENT_FAILED" });
        }
      }, 1500);
    } else {
      // 현금 결제 또는 일반적인 경우
      dispatch({ type: "SELECT_DRINK", payload: drinkId });
    }
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
