import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    ValidationPipe,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { PointBody as PointDto } from './point.dto';

@Controller('/point')
export class PointController {
    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
    ) {}

    /**
     * 특정 유저의 포인트를 조회하는 기능
     */
    @Get(':id')
    async point(@Param('id') id: string): Promise<UserPoint> {
        const userId = this.parseUserId(id);
        const user = await this.userDb.selectById(userId);
        
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }
        
        return user;
    }

    /**
     * 특정 유저의 포인트 충전/이용 내역을 조회하는 기능
     */
    @Get(':id/histories')
    async history(@Param('id') id: string): Promise<PointHistory[]> {
        const userId = this.parseUserId(id);
        
        // 🔧 유저 존재 여부 확인 추가
        const user = await this.userDb.selectById(userId);
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }
        
        const userPointHistory = await this.historyDb.selectAllByUserId(userId);
        return userPointHistory;
    }

    /**
     * 특정 유저의 포인트를 충전하는 기능
     */
    @Patch(':id/charge')
    async charge(
        @Param('id') id: string,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = this.parseUserId(id);
        const amount = pointDto.amount;
        
        // 충전 금액 검증
        if (amount <= 0) {
            throw new BadRequestException('Charge amount must be positive');
        }
        
        const user = await this.userDb.selectById(userId);
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        const currentPoint = Number.parseInt(user.point);
        const updatedPoint = currentPoint + amount;
        
        await this.userDb.insertOrUpdate(userId, updatedPoint);
        const updatedUser = await this.userDb.selectById(userId);
        
        if (!updatedUser) {
            throw new Error('Failed to update user point');
        }
        
        await this.historyDb.insert(
            userId,
            amount,
            TransactionType.CHARGE,
            updatedUser.updateMillis,
        );

        return updatedUser;
    }

    /**
     * 특정 유저의 포인트를 사용하는 기능
     */
    @Patch(':id/use')
    async use(
        @Param('id') id: string,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = this.parseUserId(id);
        const amount = pointDto.amount;
        
        // 사용 금액 검증 추가
        if (amount <= 0) {
            throw new BadRequestException('Use amount must be positive');
        }
        
        const user = await this.userDb.selectById(userId);
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        const currentPoint = Number.parseInt(user.point);
        
        // 🔧 포인트 부족 검사 추가
        if (currentPoint < amount) {
            throw new BadRequestException(
                `Insufficient points. Current: ${currentPoint}, Required: ${amount}`
            );
        }

        const updatedPoint = currentPoint - amount;
        await this.userDb.insertOrUpdate(userId, updatedPoint);
        const updatedUser = await this.userDb.selectById(userId);
        
        if (!updatedUser) {
            throw new Error('Failed to update user point');
        }
        
        await this.historyDb.insert(
            userId,
            amount,
            TransactionType.USE,
            updatedUser.updateMillis,
        );

        // 가장 중요한 수정: return 추가!
        return updatedUser;
    }

    /**
     * 새로 추가: 유저 ID 파싱 및 검증을 위한 헬퍼 메서드
     */
    private parseUserId(id: string): number {
        const userId = Number.parseInt(id);
        if (isNaN(userId)) {
            throw new BadRequestException('Invalid user ID format');
        }
        return userId;
    }
}
