import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { TransactionType } from './point.model';

// jest.Mocked<UserPointTable>는 마치 "진짜 UserPointTable과 똑같이 생겼지만 모든 기능이 가짜인 장난감"을 만들어줘요!  진짜 데이터베이스를 건드리면 안되니까.
//! 이렇게 쓰면...
// let mockUserDb: jest.Mocked<UserPointTable>;
//! 이런 뜻이에요:
// let mockUserDb: {
//     selectById: jest.MockedFunction<어쩌고저쩌고>;  // 가짜 함수
//     insertOrUpdate: jest.MockedFunction<어쩌고저쩌고>; // 가짜 함수
//! UserPointTable의 모든 메서드가 가짜로 변함!
// }
//! 1. 가짜 장난감 만들기
// let mockUserDb: jest.Mocked<UserPointTable>;

//! 2. 가짜 장난감에게 "이렇게 행동해!"라고 알려주기
// mockUserDb.selectById.mockResolvedValue({
//     id: 123,
//     point: '1000'
// }); //! "123번 유저 찾으면 1000포인트 가진 유저 돌려줘!"

//! 3. 테스트 실행
// const result = await pointController.point('123');

// describe: "이런 기능들을 테스트해요" (그룹핑)
// it/test: "구체적으로 이걸 테스트해요" (실제 테스트)
//  "포인트 구역" 전체 그룹핑
describe('PointController', () => {
    let pointController: PointController;
    // Mock 객체들을 위한 변수 선언(가짜 함수를 제어)
    let mockUserDb: jest.Mocked<UserPointTable>;
    let mockHistoryDb: jest.Mocked<PointHistoryTable>;

    beforeEach(async () => {
        // 가짜 데이터베이스 Provider 생성
        const mockUserDbProvider = {
            // 이 클래스를 요청하면 useValue(가짜 객체)를 줘!
            provide: UserPointTable,
            useValue: {
                // 가짜 함수 만들기
                selectById: jest.fn(),
                insertOrUpdate: jest.fn(),
            },
        };
        const mockHistoryDbProvider = {
            provide: PointHistoryTable,
            useValue: {
                selectAllByUserId: jest.fn(),
                insert: jest.fn(),
            },
        };
        // 의존성 주입(PointController가 실제 DB 대신 가짜 DB를 사용)
        const app: TestingModule = await Test.createTestingModule({
            controllers: [PointController],
            providers: [mockUserDbProvider, mockHistoryDbProvider],
        }).compile();

        // Mock 객체들을 변수에 저장
        pointController = app.get<PointController>(PointController);
        mockUserDb = app.get<jest.Mocked<UserPointTable>>(UserPointTable);
        mockHistoryDb =
            app.get<jest.Mocked<PointHistoryTable>>(PointHistoryTable);
    });

    // 🎠 "포인트 조회" 구역 그룹핑(PointController 속)
    describe('point 조회', () => {
        // 실제 테스트 it (test와 같음. it을 많이 씀. 독해 자연스러움?)
        // Promise를 다루는데 async/await 써야 함.
        it('특정 유저의 포인트를 조회할 수 있어야 한다', async () => {
            const userId = '123';
            const mockUser = {
                id: userId,
                point: '1000',
                updateMillis: Date.now(),
            };

            // 🎬 1단계: 가짜 함수에게 "대본" 주기 (설정)
            //! 실제로도 pointControll.point 메서드에 selectById가 1번 호출되어서 여기서도 1번 호출시켰고 리턴값도 정함.
            mockUserDb.selectById.mockResolvedValue(mockUser);
            // "어떤 파라미터로 호출되든 mockUser를 돌려줘!"
            // mockResolvedValue 사용해서 가짜 리턴값 설정(미리 답 정해두기! 어떤 userId로 물어봐도 mockUser로 똑같이 대답해줄것)

            // 🎭 2단계: 실제 연기하기 (호출)
            const result = await pointController.point('123');
            // 내부적으로: mockUserDb.selectById(123) 호출됨!

            // 🕵️ 3단계: 연기 잘했나 확인하기. 실제 검증
            expect(mockUserDb.selectById).toHaveBeenCalledWith(123);
            // "정말 123으로 호출했니?"
            // toHaveBeenCalledWith : Jest에서 "가짜 함수가 정확한 인수(파라미터)로 호출되었는지 확인하는 도구
            expect(result).toEqual(mockUser);
        });

        it('존재하지 않는 유저 조회시 에러를 던져야 한다', async () => {
            mockUserDb.selectById.mockResolvedValue(null);

            // 🎯 에러가 던져지는지 확인
            await expect(pointController.point('999')).rejects.toThrow(
                'User 999 not found',
            );
            expect(mockUserDb.selectById).toHaveBeenCalledWith(999);
        });
    });
    describe('history 조회', async () => {
        it('특정 유저의 포인트 히스토리를 조회할 수 있어야 한다', () => {
            const userId = 123;
            const mockHistories = [
                {
                    id: 1,
                    userId: userId,
                    amount: 100,
                    type: TransactionType.CHARGE,
                    timeMillis: Date.now(),
                },
                {
                    id: 2,
                    userId: userId,
                    amount: 50,
                    type: TransactionType.USE,
                    timeMillis: Date().now,
                },
            ];

            mockHistoryDb.selectAllByUserId.mockResolvedValue(mockHistories);

            const result = await pointController.history('123');

            expect(mockHitoryDb.selectAllByUserId).toHaveBeenCalledWith(123);
            expect(result).toEqual(mockHistories);
            // expect(result).toHaveLength(2); // 추가 검증
        });
    });
    describe('charge 충전', () => {
        it('포인트를 정상적으로 충전할 수 있어야 한다', async () => {
            // 입력값 및 mock date 설정
            const userId = 123;
            const chargeAmount = 500;

            const originalUser = {
                id: userId,
                point: '1000',
                updateMillis: Date.now(),
            };

            const updatedUser = {
                id: userId,
                point: '1500',
                updateMillis: Date.now() + 1000,
            };

            //! pointController에서 실제로 해당메서드들 2번 및 1번씩 호출되어서 여기서도 그렇게 작성 + 반환값도 설정
            // 각 메서드에 반환값을 설정하기
            mockUserDb.selectById
                .mockResolvedValueOnce(originalUser) // 첫 번째 호출 : 기존 유저
                .mockResolvedValueOnce(updatedUser); // 두 번째 호출 : 업데이트된 유저

            mockUserDb.insertOrUpdate.mockResolvedValue(undefined);
            mockHistoryDb.insert.mockResolvedValue(undefined);

            const result = await pointController.charge('123', {
                amount: chargeAmount,
            });

            expect(mockUserDb.selectById).toHaveBeenCalledTimes(2); // 2번 호출되는지
            expect(mockUserDb.insertOrUpdate).toHaveBeenCalledWith(123, 1500);
            expect(mockHistoryDb.insert).toHaveBeenCalledWith(
                123,
                chargeAmount,
                TransactionType.CHARGE,
                updatedUser.updateMillis,
            );
            expect(result).toEqual(updatedUser); // 최종 결과 검증
        });
    });
    describe('use 사용', () => {
        it('포인트를 정상적으로 사용할 수 있어야 한다.', async () => {
            const userId = 123;
            const useAmount = 300;
            const originalUser = {
                id: userId,
                point: '1000',
                updateMillis: Date.now(),
            };
            const updatedUser = {
                id: userId,
                point: '700',
                updateMillis: Date.now() + 1000,
            };

            mockUserDb.selectById
                .mockResolvedValueOnce(originalUser)
                .mockResolvedValueOnce(updatedUser);

            mockUserDb.insertOrUpdate.mockResolvedValue(undefined);
            mockHistoryDb.insert.mockResolvedValue(undefined);

            const result = pointController.user('123', { amount: useAmount });

            expect(mockUserDb.selectById).toHaveBeenCalledTimes(2);
            expect(mockUserDb.insertOrUpdate).toHaveBeenCalledWith(123, 700);
            expect(mockHistoryDb.insert).toHaveBeenCalledWith(
                123,
                useAmount,
                TransactionType.USE,
                updatedUser.updateMillis,
            );
            expect(result).toEqual(updatedUser);
        });

        // it('포인트가 부족하면 음수가 될 수 있다(에러 처리 필요)', async () => {
        //     const userId = 123;
        //     const useAmount = 1500;
        //     const originalUser = {
        //         id: userId,
        //         point: '1000',
        //         updateMillis: Date.now(),
        //     };
        //     mockUserDb.selectById.mockResolvedValueOnce(originalUser);
        //     expect(() =>
        //         pointController.use('123', { amount: useAmount }).toThrow(),
        //     );
        // });
    });
});
