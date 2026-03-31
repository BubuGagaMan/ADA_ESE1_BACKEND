import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm'
import { Diet } from '../diet/Diet.entity.js'
import { MealFood } from '../mealFoodJunction/MealFood.entity.js'

@Entity()
export class Meal {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    name!: string

    // macros in MICROGRAMS
    @Column({ default: 0, type: 'int' })
    carbohydrates!: number

    @Column({ default: 0, type: 'int' })
    fiber!: number

    @Column({ default: 0, type: 'int' })
    proteins!: number

    @Column({ default: 0, type: 'int' })
    fats!: number

    // cal in kcal - rounded
    @Column({ default: 0, type: 'int' })
    calories!: number

    @Column({ default: 0, type: 'int' })
    glycemic_load!: number

    @ManyToOne('Diet', 'meals', {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'diet_id' })
    diet!: Relation<Diet>

    @OneToMany('MealFood', 'meal', {
        cascade: true,
    })
    mealFoods!: Relation<MealFood[]>
}
