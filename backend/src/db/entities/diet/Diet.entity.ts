import { Column, Entity, PrimaryGeneratedColumn, Relation, ManyToOne, JoinColumn, OneToMany } from 'typeorm'

import type { User } from '../user/User.entity.js'
import { Meal } from '../meal/Meal.entity.js'

export enum WEIGHT_GOAL {
    // weight goal / week
    // 250 grams = 275 cal
    // bellow will be used as 275 multipliers for calculating total calorie intake daily
    LOSS_1000_GRAMS = -4,
    LOSS_750_GRAMS = -3,
    LOSS_500_GRAMS = -2,
    LOSS_250_GRAMS = -1,
    MAINTENANCE = 0,
    GAIN_250_GRAMS = 1,
    GAIN_500_GRAMS = 2,
    GAIN_750_GRAMS = 3,
    GAIN_1000_GRAMS = 4,
}

@Entity()
export class Diet {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({
        nullable: false,
    })
    name!: string

    // cal in kcal
    @Column({ default: 0, type: 'int' })
    calories!: number

    // macros in MICROGRAMS
    @Column({
        default: 0,
        type: 'int',
    })
    carbohydrates!: number

    @Column({
        default: 0,
        type: 'int',
    })
    proteins!: number

    @Column({
        default: 0,
        type: 'int',
    })
    fats!: number

    @Column({
        default: 0,
        type: 'int',
    })
    fiber!: number

    @Column({
        nullable: false,
    })
    carbohydrate_lower_range!: number

    @Column({
        nullable: false,
    })
    carbohydrate_upper_range!: number
    @Column({
        nullable: false,
    })
    protein_lower_range!: number
    @Column({
        nullable: false,
    })
    protein_upper_range!: number
    @Column({
        nullable: false,
    })
    fat_lower_range!: number
    @Column({
        nullable: false,
    })
    fat_upper_range!: number
    @Column({
        nullable: false,
    })
    daily_calorie_target!: number

    @ManyToOne('User', 'diets', {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    user!: Relation<User>

    @Column({
        nullable: false,
        type: 'enum',
        enum: WEIGHT_GOAL,
    })
    weight_goal!: WEIGHT_GOAL

    @OneToMany('Meal', 'diet', {
        cascade: ['insert', 'update'],
    })
    meal!: Relation<Meal[]>
}
