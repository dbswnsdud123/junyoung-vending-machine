import { CashUnit, TransactionStatus } from "../types";

/**
 * 금액을 한국 원화 형식으로 포맷팅
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 문자열 (예: "1,100원")
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()}원`;
};

/**
 * 잔돈을 계산하여 각 단위별로 반환
 * @param changeAmount - 총 잔돈 금액
 * @returns 각 단위별 잔돈 개수
 */
export const calculateChange = (
  changeAmount: number
): Record<CashUnit, number> => {
  const units: CashUnit[] = [10000, 5000, 1000, 500, 100];
  const change: Record<CashUnit, number> = {
    10000: 0,
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
  };

  let remainingAmount = changeAmount;

  for (const unit of units) {
    if (remainingAmount >= unit) {
      change[unit] = Math.floor(remainingAmount / unit);
      remainingAmount = remainingAmount % unit;
    }
  }

  return change;
};

/**
 * 잔돈 계산 결과를 문자열로 변환
 * @param change - calculateChange 함수의 결과
 * @returns 잔돈 내역 문자열
 */
export const formatChangeDetails = (
  change: Record<CashUnit, number>
): string => {
  const details: string[] = [];

  Object.entries(change).forEach(([unit, count]) => {
    if (count > 0) {
      details.push(`${formatCurrency(Number(unit))} × ${count}개`);
    }
  });

  return details.length > 0 ? details.join(", ") : "잔돈 없음";
};

/**
 * 음료 이름에 따른 이모지 반환
 * @param drinkName - 음료 이름
 * @returns 해당하는 이모지
 */
export const getDrinkEmoji = (drinkName: string): string => {
  const emojiMap: Record<string, string> = {
    콜라: "🥤",
    물: "💧",
    커피: "☕",
  };

  return emojiMap[drinkName] || "🥤";
};

/**
 * 재고 상태에 따른 상태 텍스트 반환
 * @param stock - 재고 수량
 * @returns 재고 상태 텍스트
 */
export const getStockStatus = (stock: number): string => {
  if (stock === 0) return "품절";
  if (stock <= 3) return "품절임박";
  return "재고있음";
};

/**
 * 재고 상태에 따른 CSS 클래스 반환
 * @param stock - 재고 수량
 * @returns CSS 클래스명
 */
export const getStockStatusClass = (stock: number): string => {
  if (stock === 0) return "out-of-stock";
  if (stock <= 3) return "low-stock";
  return "in-stock";
};

/**
 * 결제 수단을 한국어로 변환
 * @param paymentMethod - 결제 수단 ('cash' | 'card')
 * @returns 한국어 결제 수단명
 */
export const getPaymentMethodText = (
  paymentMethod: "cash" | "card"
): string => {
  return paymentMethod === "cash" ? "현금" : "카드";
};

/**
 * 현금 단위를 텍스트로 변환
 * @param unit - 현금 단위
 * @returns 텍스트 (예: "천원권", "백원")
 */
export const getCashUnitText = (unit: CashUnit): string => {
  const unitMap: Record<CashUnit, string> = {
    100: "백원",
    500: "오백원",
    1000: "천원권",
    5000: "오천원권",
    10000: "만원권",
  };

  return unitMap[unit];
};

/**
 * 거래 상태를 한국어로 변환
 * @param status - 거래 상태
 * @returns 한국어 상태명
 */
export const getTransactionStatusText = (status: TransactionStatus): string => {
  const statusMap = {
    idle: "대기중",
    selecting: "선택중",
    processing: "처리중",
    card_processing: "카드 결제중",
    completed: "완료",
    cancelled: "취소됨",
    error: "오류",
  };

  return statusMap[status];
};

/**
 * 디바운스 함수
 * @param func - 실행할 함수
 * @param wait - 대기 시간 (밀리초)
 * @returns 디바운스된 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
