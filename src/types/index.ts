// 음료 타입 정의
export interface Drink {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

// 결제 수단 타입
export type PaymentMethod = "cash" | "card";

// 현금 단위 (원)
export type CashUnit = 100 | 500 | 1000 | 5000 | 10000;

// 거래 상태
export type TransactionStatus =
  | "idle" // 대기 상태
  | "selecting" // 음료 선택 중
  | "processing" // 처리 중
  | "card_processing" // 카드 결제 처리 중
  | "completed" // 완료
  | "cancelled" // 취소됨
  | "error"; // 오류

// 자판기 전체 상태
export interface VendingMachineState {
  // 음료 재고
  drinks: Drink[];

  // 결제 관련
  selectedPaymentMethod: PaymentMethod | null;
  insertedAmount: number;

  // 거래 관련
  selectedDrink: Drink | null;
  transactionStatus: TransactionStatus;

  // UI 상태
  message: string;
  isLoading: boolean;
}

// 액션 타입들
export type VendingMachineAction =
  | { type: "SELECT_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "INSERT_CASH"; payload: CashUnit }
  | { type: "SELECT_DRINK"; payload: string } // drink id
  | {
      type: "PROCESS_CARD_PAYMENT";
      payload: { drinkId: string; success: boolean };
    }
  | { type: "PROCESS_PURCHASE" }
  | { type: "CANCEL_TRANSACTION" }
  | { type: "RETURN_CHANGE" }
  | { type: "SET_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET_MACHINE" }
  | { type: "CARD_PAYMENT_FAILED" };

// 구매 결과 타입
export interface PurchaseResult {
  success: boolean;
  message: string;
  change?: number;
  drink?: Drink;
}

// 카드 결제 결과 타입
export interface CardPaymentResult {
  success: boolean;
  message: string;
  approvedAmount?: number;
}

// 초기 음료 데이터 타입
export const INITIAL_DRINKS: Drink[] = [
  {
    id: "cola",
    name: "콜라",
    price: 1100,
    stock: 10,
  },
  {
    id: "water",
    name: "물",
    price: 600,
    stock: 15,
  },
  {
    id: "coffee",
    name: "커피",
    price: 700,
    stock: 8,
  },
];

// 사용 가능한 현금 단위들
export const CASH_UNITS: CashUnit[] = [100, 500, 1000, 5000, 10000];
