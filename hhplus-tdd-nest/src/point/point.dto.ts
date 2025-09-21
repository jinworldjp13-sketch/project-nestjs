import { IsInt } from 'class-validator';

// 이 API가 어떤 데이터를 받는지 명확히 알 수 있음
export class PointBody {
    @IsInt() // ← 이게 검증 규칙! (세로로 여러개 나열할 수 잇음) - 여기서는 정수여야 한다.
    amount: number; // <- 전달할 데이터(여러개 나열 가능 줄 띄우고)
}
