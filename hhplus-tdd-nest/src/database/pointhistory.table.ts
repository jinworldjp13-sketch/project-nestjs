import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PointHistory, TransactionType } from 'src/point/point.model';

/**
 * 해당 Table 클래스는 변경하지 않고 공개된 API 만을 사용해 데이터를 제어합니다.
 */

// Table = 가짜 데이터베이스 테이블
// "실제 DB 대신 메모리에서 데이터를 관리하는 클래스"

// 📚 과제용 교육 목적
// 실제 데이터베이스(MySQL, PostgreSQL) 없이도 개발 연습할 수 있도록! 실제 DB의 응답 시간을 흉내내기 위해서

// 실제로 짠다면 아래와 같음.
// -- SQL 쿼리
// INSERT INTO point_history (user_id, amount, type, time_millis)
// VALUES (123, 1000, 0, 1698765432000);

// SELECT * FROM point_history WHERE user_id = 123;

@Injectable()
export class PointHistoryTable {
    private readonly table: PointHistory[] = []; // 가짜 DB 테이블 (배열)
    private cursor = 1; // 자동 증가 ID

    // 제공하는 api들
    // insert() - 데이터 추가
    // selectAllByUserId() - 특정 사용자 내역(모든 포인트 내역) 조회
    insert(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
    ): Promise<PointHistory> {
        return new Promise((r) => {
            setTimeout(() => {
                const history: PointHistory = {
                    // 데이터 구조
                    id: this.cursor++,
                    userId: userId,
                    amount: amount,
                    type: transactionType,
                    timeMillis: updateMillis,
                };
                this.table.push(history);
                r(history);
            }, randomInt(300));
        });
    }

    selectAllByUserId(userId: number): Promise<PointHistory[]> {
        return new Promise((r) => {
            r(this.table.filter((v) => v.userId == userId));
        });
    }
}
