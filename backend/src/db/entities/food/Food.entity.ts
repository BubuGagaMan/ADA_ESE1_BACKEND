import { Entity, Column, PrimaryGeneratedColumn, Relation, OneToMany } from 'typeorm'
import { MealFood } from '../mealFoodJunction/MealFood.entity.js'

@Entity()
export class Food {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    name!: string

    // macros in grams * 10 to avoid js fraction math issues
    @Column({ type: 'int' })
    carbohydrates!: number

    @Column({ type: 'int' })
    proteins!: number

    @Column({ type: 'int' })
    fats!: number

    @Column({ type: 'int' })
    calories!: number

    @Column({ type: 'int' })
    fiber!: number

    // weight in MICROGRAMS
    @Column()
    weight!: number

    // gi to be multiplied by 10 on reception to get rid of decimals and then divided again to reintroduce them if present
    @Column({ type: 'int' })
    glycemic_index!: number

    @OneToMany('MealFood', 'food')
    mealFoods!: Relation<MealFood[]>
}
