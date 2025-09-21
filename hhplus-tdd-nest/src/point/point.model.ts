export type UserPoint = {
    id: number;
    point: number;
    updateMillis: number;
};

/**
 * 포인트 트랜잭션 종류
 * - CHARGE : 충전
 * - USE : 사용
 * enum : 정해진 선택지들에 번호를 매겨서 관리하는 방법. 따로 CHARGE = 100 이렇게 설정 안하면 0부터 시작
 */
export enum TransactionType {
    CHARGE,
    USE,
}

export type PointHistory = {
    id: number;
    userId: number;
    type: TransactionType;
    amount: number;
    timeMillis: number;
};
