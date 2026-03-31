import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm'
import type { User } from '../user/User.entity.js'

export enum SEX {
    MALE = 0,
    FEMALE = 1,
}

export enum ACTIVITY_LEVEL {
    SEDENTARY = 1.2,
    LIGHTLY_ACTIVE = 1.375,
    MODERATELY_ACTIVE = 1.55,
    VERY_ACTIVE = 1.725,
    EXTRA_ACTIVE = 1.9,
}

@Entity()
export class UserMetrics {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ nullable: false })
    height!: number

    @Column({ type: 'float', nullable: false })
    weight!: number

    @Column({ nullable: false, type: 'enum', enum: SEX })
    sex!: SEX

    @Column({ type: 'date', nullable: false })
    // "Stored as YYYY-MM-DD"
    dob!: string

    @Column({ nullable: false, type: 'enum', enum: ACTIVITY_LEVEL })
    activity_level!: ACTIVITY_LEVEL

    @OneToOne('User', 'userMetrics', {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user!: Relation<User>
}
