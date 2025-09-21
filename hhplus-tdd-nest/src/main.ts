import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}
bootstrap();

// < NEST JS >
// 파일 흐름도
// - (app 자체 내부 로직 처리) main.ts -> app.module.ts -> app.controller.ts -> app.service.ts
// - (app 밖 로직 처리) main.ts -> app.mudule.ts -> point.module.ts -> point.controller.ts -> (point.service.ts) ->  database (userDb, historyDb)

// 연결도
// - app.module.ts - point.module.ts - database.module.ts
// - module.ts - 다른 module.ts + controller + service

// 파일들 상세
// - .model.ts: 데이터베이스에 저장되는 타입 정의 (흐름에 직접 관여 안 함). (enum : 정해진 선택지들에 번호를 매겨서 관리하는 방법. 따로 CHARGE = 100 이렇게 설정 안하면 0부터 시작)
// - .dto.ts: API 통신시 데이터 검증용 (controller에서 사용). Data Transfer Object == 데이터를 안전하게 주고받기 위한 형식. 포장 규칙이 있음 (크기, 무게 제한 등). 이 API가 어떤 데이터를 받는지 명확히 알 수 있음.
// - ,.service.ts: 비즈니스 로직 (선택사항. controller에서 바로 database 연결 가능)
// Table = 가짜 데이터베이스 테이블. 실제 DB 대신 메모리에서 데이터를 관리하는 클래스.

// 실제 흐름도
// 1. 브라우저 → GET /point/123
// 2. NestJS 라우터 → PointController.point()
// 3. PointController → this.userDb.selectById()
// 4. Database → 결과 반환
// 5. Controller → JSON 응답

// HTTP 메서드 : 서버에게 뭘 하고 싶은지 알려주는 방법
// - GET: "메뉴판 보여주세요" (조회)
// - POST: "새로운 주문하겠습니다" (생성)
// - PUT: "주문을 완전히 바꿔주세요" (전체 수정) - DB.replace
// - PATCH: "주문에서 음료만 바꿔주세요" (부분 수정) - DB.update
// - DELETE: "주문 취소하겠습니다" (삭제)

// Typescript
// Promise는 UserPoint 형식대로 리턴
// Promise<UserPoint> {
//     const userId = Number.parseInt(id);
//     const user = await this.userDb.selectById(userId)
//     return user.point;
// }
